from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
import pandas as pd
import numpy as np

from app.models.models import Inventory, Product, Category, Store, OrderItem, Order
from app.schemas.schemas import (
    InventoryOverviewResponse, InventoryItem, RecommendationItem
)

def get_inventory_overview(
    db: Session,
    store_id: Optional[int] = None,
    category_id: Optional[int] = None
) -> InventoryOverviewResponse:
    """
    Compute inventory valuation, turnover ratio, stock health status, and automated operational alerts.
    """
    anchor_date = db.query(func.max(Order.order_date)).scalar() or datetime.utcnow()
    thirty_days_ago = anchor_date - timedelta(days=30)

    # 1. Fetch 30-day product sales velocity
    sales_30d_q = db.query(
        OrderItem.product_id,
        func.sum(OrderItem.quantity).label("units_sold_30d"),
        func.sum(OrderItem.unit_cost * OrderItem.quantity).label("cogs_30d")
    ).select_from(Order).join(OrderItem, Order.id == OrderItem.order_id)\
     .filter(Order.order_date >= thirty_days_ago, Order.status == "Completed")

    if store_id:
        sales_30d_q = sales_30d_q.filter(Order.store_id == store_id)

    sales_30d_q = sales_30d_q.group_by(OrderItem.product_id).all()
    sales_velocity = {r.product_id: (int(r.units_sold_30d or 0), float(r.cogs_30d or 0.0)) for r in sales_30d_q}

    # 2. Query aggregate inventory across stores
    inv_query = db.query(
        Product.id.label("product_id"),
        Product.sku,
        Product.name.label("product_name"),
        Product.unit_cost,
        Product.unit_price,
        Product.min_reorder_level,
        Product.target_stock,
        Product.lead_time_days,
        Category.name.label("category_name"),
        func.coalesce(func.sum(Inventory.current_stock), 0).label("current_stock"),
        func.coalesce(func.sum(Inventory.reserved_stock), 0).label("reserved_stock"),
        func.coalesce(func.sum(Inventory.reorder_point), 20).label("reorder_point"),
        func.coalesce(func.sum(Inventory.safety_stock), 10).label("safety_stock")
    ).select_from(Product).join(Category, Product.category_id == Category.id)\
     .outerjoin(Inventory, Product.id == Inventory.product_id)

    if store_id:
        inv_query = inv_query.filter(Inventory.store_id == store_id)
    if category_id:
        inv_query = inv_query.filter(Product.category_id == category_id)

    inv_items = inv_query.group_by(
        Product.id, Product.sku, Product.name, Product.unit_cost, Product.unit_price,
        Product.min_reorder_level, Product.target_stock, Product.lead_time_days, Category.name
    ).all()

    items: List[InventoryItem] = []
    total_val = 0.0
    total_units = 0
    total_cogs_30d = 0.0

    healthy_cnt = 0
    low_cnt = 0
    crit_cnt = 0
    oos_cnt = 0

    below_reorder_list = []
    stockout_risk_list = []
    slow_movers_list = []

    for row in inv_items:
        curr_stk = int(row.current_stock)
        res_stk = int(row.reserved_stock)
        u_cost = float(row.unit_cost)
        inv_v = curr_stk * u_cost
        
        total_val += inv_v
        total_units += curr_stk

        sold_30d, cogs = sales_velocity.get(row.product_id, (0, 0.0))
        total_cogs_30d += cogs

        daily_rate = sold_30d / 30.0
        dos = (curr_stk / daily_rate) if daily_rate > 0 else (999.0 if curr_stk > 0 else 0.0)

        rop = int(row.reorder_point)
        safety = int(row.safety_stock)

        # Status determination
        if curr_stk == 0:
            status = "GRAY"  # Out of Stock
            oos_cnt += 1
            stockout_risk_list.append(row.product_name)
        elif curr_stk <= safety:
            status = "RED"   # Critical
            crit_cnt += 1
            stockout_risk_list.append(row.product_name)
        elif curr_stk <= rop:
            status = "YELLOW" # Low Stock
            low_cnt += 1
            below_reorder_list.append(row.product_name)
        else:
            status = "GREEN"  # Healthy
            healthy_cnt += 1

        # Check slow movers
        if curr_stk > 50 and sold_30d < 5:
            slow_movers_list.append(row.product_name)

        # Turnover Ratio = Annualized COGS / Inventory Value
        annual_cogs = cogs * 12
        item_turnover = (annual_cogs / inv_v) if inv_v > 0 else 0.0

        items.append(
            InventoryItem(
                product_id=row.product_id,
                sku=row.sku,
                product_name=row.product_name,
                category_name=row.category_name,
                current_stock=curr_stk,
                reserved_stock=res_stk,
                reorder_point=rop,
                safety_stock=safety,
                inventory_value=round(inv_v, 2),
                units_sold_30d=sold_30d,
                turnover_ratio=round(item_turnover, 2),
                days_of_supply=round(dos, 1),
                status=status
            )
        )

    # Sort items: critical and out of stock first, then by value
    status_order = {"RED": 0, "GRAY": 1, "YELLOW": 2, "GREEN": 3}
    items.sort(key=lambda x: (status_order.get(x.status, 4), -x.inventory_value))

    # Overall Annualized Turnover = (COGS 30d * 12) / Total Inventory Value
    overall_turnover = ((total_cogs_30d * 12) / total_val) if total_val > 0 else 0.0

    # Build smart actionable alerts
    alerts = []
    if below_reorder_list:
        alerts.append({
            "type": "WARNING",
            "title": f"{len(below_reorder_list)} products are below reorder threshold",
            "message": f"Replenishment orders should be initiated for {', '.join(below_reorder_list[:3])} and {max(0, len(below_reorder_list)-3)} others.",
            "count": len(below_reorder_list)
        })

    if stockout_risk_list:
        alerts.append({
            "type": "CRITICAL",
            "title": f"{len(stockout_risk_list)} products at imminent stockout risk",
            "message": f"Critical stock depletion detected in key SKUs ({', '.join(stockout_risk_list[:3])}). High probability of lost revenue.",
            "count": len(stockout_risk_list)
        })

    if slow_movers_list:
        alerts.append({
            "type": "INFO",
            "title": f"{len(slow_movers_list)} products have unusually slow movement",
            "message": f"Capital tied up in sluggish inventory. Consider promotional markdown or bundling for {', '.join(slow_movers_list[:3])}.",
            "count": len(slow_movers_list)
        })

    return InventoryOverviewResponse(
        total_stock_value=round(total_val, 2),
        total_units_in_stock=total_units,
        overall_turnover_ratio=round(overall_turnover, 2),
        healthy_count=healthy_cnt,
        low_stock_count=low_cnt,
        critical_count=crit_cnt,
        out_of_stock_count=oos_cnt,
        alerts=alerts,
        items=items
    )

def get_inventory_recommendations(db: Session, store_id: Optional[int] = None) -> List[RecommendationItem]:
    """
    Generate quantitative inventory reorder recommendations based on historical run rates and lead times.
    """
    overview = get_inventory_overview(db, store_id=store_id)
    recs: List[RecommendationItem] = []

    for item in overview.items:
        daily_rate = item.units_sold_30d / 30.0
        forecast_30d = int(round(daily_rate * 30.0 * 1.1))  # 10% safety cushion
        
        # Days until stockout
        if daily_rate > 0:
            days_left = int(item.current_stock / daily_rate)
        else:
            days_left = 999

        # Safety Stock & Reorder Point
        lead_time = 5  # default lead time days
        safety_stock = max(10, int(np.ceil(1.65 * np.sqrt(lead_time) * max(1.0, daily_rate))))
        rop = int(np.ceil((daily_rate * lead_time) + safety_stock))
        
        # Recommended order quantity
        reorder_qty = max(0, int(forecast_30d + safety_stock - item.current_stock))

        if days_left <= 7 or item.status in ["RED", "GRAY"]:
            risk = "HIGH"
            reason = f"Expected 30-day demand ({forecast_30d} units) significantly exceeds current stock ({item.current_stock} units). Stockout expected within {days_left} days."
        elif days_left <= 20 or item.status == "YELLOW":
            risk = "MEDIUM"
            reason = f"Stock level is approaching the reorder point ({rop} units). Lead time is {lead_time} days."
        else:
            risk = "LOW"
            reason = f"Inventory is healthy with {days_left} days of supply remaining."

        recs.append(
            RecommendationItem(
                product_id=item.product_id,
                product_name=item.product_name,
                sku=item.sku,
                category=item.category_name,
                current_stock=item.current_stock,
                forecasted_demand_30d=forecast_30d,
                daily_run_rate=round(daily_rate, 2),
                reorder_point=rop,
                safety_stock=safety_stock,
                recommended_reorder_qty=reorder_qty,
                stockout_risk=risk,
                estimated_days_until_stockout=min(999, days_left),
                reason=reason
            )
        )

    # Sort high risk first, then by recommended quantity
    risk_rank = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    recs.sort(key=lambda x: (risk_rank.get(x.stockout_risk, 3), -x.recommended_reorder_qty))
    return recs
