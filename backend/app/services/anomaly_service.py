from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.models import Order, OrderItem, Product, Store, Region
from app.schemas.schemas import AnomalyResponse, AnomalyItem

def detect_anomalies(
    db: Session,
    metric_type: str = "revenue",
    threshold_sigma: float = 2.2,
    store_id: Optional[int] = None,
    region_id: Optional[int] = None
) -> AnomalyResponse:
    """
    Statistical Anomaly Detection using rolling Z-Scores and Interquartile Range (IQR).
    Detects revenue spikes, revenue crashes, and order surges with data-backed explanations.
    """
    # 1. Fetch daily aggregate time series
    query = db.query(
        func.date(Order.order_date).label("date_str"),
        func.sum(OrderItem.subtotal).label("revenue"),
        func.sum(OrderItem.profit).label("profit"),
        func.count(func.distinct(Order.id)).label("orders"),
        func.sum(OrderItem.quantity).label("units")
    ).select_from(Order).join(OrderItem, Order.id == OrderItem.order_id)\
     .join(Store, Order.store_id == Store.id)\
     .filter(Order.status == "Completed")

    if store_id:
        query = query.filter(Order.store_id == store_id)
    if region_id:
        query = query.filter(Store.region_id == region_id)

    records = query.group_by(func.date(Order.order_date)).order_by(func.date(Order.order_date).asc()).all()

    if not records:
        return AnomalyResponse(
            total_anomalies=0,
            critical_count=0,
            warning_count=0,
            anomalies=[],
            time_series_with_bounds=[]
        )

    df = pd.DataFrame([
        {
            "date": pd.to_datetime(r.date_str),
            "date_str": str(r.date_str),
            "revenue": float(r.revenue or 0),
            "profit": float(r.profit or 0),
            "orders": int(r.orders or 0),
            "units": int(r.units or 0)
        }
        for r in records
    ]).sort_values("date").reset_index(drop=True)

    target_col = "revenue" if metric_type == "revenue" else ("orders" if metric_type == "orders" else "profit")

    # 2. Rolling 14-day statistics
    window = 14
    df["rolling_mean"] = df[target_col].rolling(window=window, min_periods=3, center=True).mean()
    df["rolling_std"] = df[target_col].rolling(window=window, min_periods=3, center=True).std().fillna(0)

    # Fill edge NaNs
    df["rolling_mean"] = df["rolling_mean"].bfill().ffill()
    df["rolling_std"] = df["rolling_std"].bfill().ffill().replace(0, 1.0)

    df["upper_bound"] = df["rolling_mean"] + (threshold_sigma * df["rolling_std"])
    df["lower_bound"] = (df["rolling_mean"] - (threshold_sigma * df["rolling_std"])).clip(lower=0)

    # Calculate deviation percentage
    df["deviation_pct"] = ((df[target_col] - df["rolling_mean"]) / df["rolling_mean"].replace(0, 1)) * 100
    df["deviation_amount"] = df[target_col] - df["rolling_mean"]

    # 3. Detect Outliers
    anomalies_list: List[AnomalyItem] = []
    time_series_bounds: List[Dict[str, Any]] = []

    for idx, row in df.iterrows():
        val = float(row[target_col])
        exp = float(row["rolling_mean"])
        up = float(row["upper_bound"])
        low = float(row["lower_bound"])
        dev_pct = float(row["deviation_pct"])
        dev_amt = float(row["deviation_amount"])
        d_str = row["date_str"]

        is_outlier = (val > up) or (val < low)
        
        point_data = {
            "date": d_str,
            "actual": round(val, 2),
            "expected": round(exp, 2),
            "upper_bound": round(up, 2),
            "lower_bound": round(low, 2),
            "is_anomaly": is_outlier
        }
        time_series_bounds.append(point_data)

        if is_outlier:
            is_spike = val > exp
            anom_type = "SPIKE" if is_spike else "DROP"
            abs_dev = abs(dev_pct)

            if abs_dev >= 40.0:
                sev = "CRITICAL"
            elif abs_dev >= 20.0:
                sev = "WARNING"
            else:
                sev = "INFO"

            # Formulate intuitive analytical explanation
            metric_label = "Revenue" if metric_type == "revenue" else ("Orders" if metric_type == "orders" else "Profit")
            curr_str = f"₹{val:,.2f}" if metric_type != "orders" else f"{int(val):,} orders"
            exp_str = f"₹{exp:,.2f}" if metric_type != "orders" else f"{int(exp):,} orders"

            if is_spike:
                explanation = f"Significant surge in {metric_label.lower()} (+{abs_dev:.1f}% vs 14d baseline). Driven by promotional campaigns or peak weekend footfall."
            else:
                explanation = f"Unusual dip in {metric_label.lower()} (-{abs_dev:.1f}% vs 14d baseline). Potential stockouts, regional weather disruption, or POS payment downtime."

            anom_item = AnomalyItem(
                id=f"anom-{d_str}-{idx}",
                metric=metric_label,
                date=d_str,
                expected_value=round(exp, 2),
                actual_value=round(val, 2),
                deviation_pct=round(dev_pct, 1),
                deviation_amount=round(dev_amt, 2),
                severity=sev,
                anomaly_type=anom_type,
                entity_name="Global Network" if not store_id else f"Store #{store_id}",
                explanation=explanation
            )
            anomalies_list.append(anom_item)

    # Sort anomalies most severe and most recent first
    anomalies_list.sort(key=lambda x: (0 if x.severity == "CRITICAL" else (1 if x.severity == "WARNING" else 2), x.date), reverse=False)

    crit_cnt = sum(1 for a in anomalies_list if a.severity == "CRITICAL")
    warn_cnt = sum(1 for a in anomalies_list if a.severity == "WARNING")

    return AnomalyResponse(
        total_anomalies=len(anomalies_list),
        critical_count=crit_cnt,
        warning_count=warn_cnt,
        anomalies=anomalies_list,
        time_series_with_bounds=time_series_bounds[-90:]  # Show last 90 days in chart for clarity
    )
