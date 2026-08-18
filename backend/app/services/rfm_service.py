from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
import pandas as pd
import numpy as np

from app.models.models import Customer, Order, OrderItem
from app.schemas.schemas import CustomerAnalyticsResponse, RFMSegmentStat, CustomerItem

def calculate_customer_rfm(db: Session) -> CustomerAnalyticsResponse:
    """
    Perform Recency, Frequency, Monetary (RFM) Segmentation and CLV Analysis.
    """
    max_order_date = db.query(func.max(Order.order_date)).scalar() or datetime.utcnow()

    # Query customer metrics
    cust_query = db.query(
        Customer.id,
        Customer.customer_code,
        Customer.first_name,
        Customer.last_name,
        Customer.email,
        Customer.city,
        Customer.state,
        Customer.acquisition_date,
        func.count(Order.id).label("total_orders"),
        func.coalesce(func.sum(Order.total_amount), 0.0).label("total_spend"),
        func.max(Order.order_date).label("last_order_date")
    ).select_from(Customer).outerjoin(Order, and_(Customer.id == Order.customer_id, Order.status == "Completed"))\
     .group_by(Customer.id).all()

    if not cust_query:
        return CustomerAnalyticsResponse(
            total_customers=0,
            new_customers=0,
            returning_customers=0,
            repeat_rate=0.0,
            avg_clv=0.0,
            avg_order_value=0.0,
            segments=[],
            top_customers=[]
        )

    records = []
    for c in cust_query:
        last_dt = c.last_order_date
        recency = (max_order_date - last_dt).days if last_dt else 999
        spend = float(c.total_spend or 0.0)
        orders = int(c.total_orders or 0)
        aov = (spend / orders) if orders > 0 else 0.0

        records.append({
            "id": c.id,
            "customer_code": c.customer_code,
            "name": f"{c.first_name} {c.last_name}",
            "email": c.email,
            "city": c.city,
            "state": c.state,
            "total_orders": orders,
            "total_spend": spend,
            "last_order_date": last_dt.strftime("%Y-%m-%d") if last_dt else None,
            "recency_days": recency,
            "aov": round(aov, 2)
        })

    df = pd.DataFrame(records)

    # Calculate RFM quantiles & segments
    # Recency: lower days is better (rank ascending)
    # Frequency & Monetary: higher is better
    def assign_segment(row):
        orders = row["total_orders"]
        spend = row["total_spend"]
        rec = row["recency_days"]

        if orders == 0:
            return "Inactive"
        if orders >= 5 and spend >= 1200 and rec <= 45:
            return "High Value"
        elif orders >= 3 and rec <= 90:
            return "Loyal"
        elif orders >= 2 and rec <= 120:
            return "Regular"
        elif orders >= 2 and rec > 120:
            return "At Risk"
        elif orders == 1 and rec <= 60:
            return "New"
        else:
            return "Inactive"

    df["segment"] = df.apply(assign_segment, axis=1)

    total_custs = len(df)
    returning_custs = int((df["total_orders"] > 1).sum())
    new_custs = int((df["total_orders"] == 1).sum())
    repeat_rate = round((returning_custs / total_custs * 100) if total_custs > 0 else 0.0, 1)
    avg_clv = round(float(df["total_spend"].mean()), 2)
    avg_aov = round(float(df[df["total_orders"] > 0]["aov"].mean()), 2) if (df["total_orders"] > 0).any() else 0.0

    # Aggregate Segment Statistics
    segment_colors = {
        "High Value": "#10B981",  # Emerald
        "Loyal": "#3B82F6",       # Blue
        "Regular": "#8B5CF6",     # Purple
        "New": "#06B6D4",         # Cyan
        "At Risk": "#F59E0B",     # Amber
        "Inactive": "#6B7280"     # Gray
    }

    segments_list: List[RFMSegmentStat] = []
    for seg_name, group in df.groupby("segment"):
        c_count = len(group)
        pct = round((c_count / total_custs * 100), 1)
        avg_rec = round(float(group["recency_days"].mean()), 1)
        avg_freq = round(float(group["total_orders"].mean()), 1)
        avg_mon = round(float(group["total_spend"].mean()), 2)
        tot_rev = round(float(group["total_spend"].sum()), 2)

        segments_list.append(RFMSegmentStat(
            segment=seg_name,
            customer_count=c_count,
            percentage=pct,
            avg_recency_days=avg_rec,
            avg_frequency=avg_freq,
            avg_monetary=avg_mon,
            total_revenue=tot_rev,
            color=segment_colors.get(seg_name, "#6B7280")
        ))

    # Sort segments by total revenue
    segments_list.sort(key=lambda x: x.total_revenue, reverse=True)

    # Top customers list
    top_cust_df = df.sort_values(by="total_spend", ascending=False).head(50)
    top_customers = [
        CustomerItem(
            id=int(row["id"]),
            customer_code=row["customer_code"],
            name=row["name"],
            email=row["email"],
            city=row["city"],
            state=row["state"],
            segment=row["segment"],
            total_orders=int(row["total_orders"]),
            total_spend=round(float(row["total_spend"]), 2),
            last_order_date=row["last_order_date"],
            recency_days=int(row["recency_days"]),
            aov=round(float(row["aov"]), 2)
        )
        for _, row in top_cust_df.iterrows()
    ]

    return CustomerAnalyticsResponse(
        total_customers=total_custs,
        new_customers=new_custs,
        returning_customers=returning_custs,
        repeat_rate=repeat_rate,
        avg_clv=avg_clv,
        avg_order_value=avg_aov,
        segments=segments_list,
        top_customers=top_customers
    )
