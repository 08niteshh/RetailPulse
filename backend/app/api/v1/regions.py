from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from typing import List, Dict, Any

from app.core.database import get_db
from app.models.models import Region, Store, Order, OrderItem, Category, Product
from app.schemas.schemas import RegionItem
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/regions", tags=["Regional Analytics"])

@router.get("", response_model=List[RegionItem])
def list_regions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve regional performance statistics, store counts, sales, and profit margins."""
    regions = db.query(Region).all()
    results: List[RegionItem] = []

    for reg in regions:
        store_cnt = db.query(Store).filter(Store.region_id == reg.id).count()
        
        reg_totals = db.query(
            func.coalesce(func.sum(Order.total_amount), 0.0).label("revenue"),
            func.coalesce(func.sum(Order.total_profit), 0.0).label("profit"),
            func.count(func.distinct(Order.id)).label("orders_count")
        ).select_from(Store).join(Order, and_(Store.id == Order.store_id, Order.status == "Completed"))\
         .filter(Store.region_id == reg.id).first()

        rev = float(reg_totals.revenue or 0.0) if reg_totals else 0.0
        prof = float(reg_totals.profit or 0.0) if reg_totals else 0.0
        ords = int(reg_totals.orders_count or 0) if reg_totals else 0
        margin = round((prof / rev * 100), 1) if rev > 0 else 0.0

        # Find top category in this region
        top_cat_row = db.query(
            Category.name,
            func.sum(OrderItem.subtotal).label("cat_rev")
        ).select_from(Order).join(OrderItem, Order.id == OrderItem.order_id)\
         .join(Store, Order.store_id == Store.id)\
         .join(Product, OrderItem.product_id == Product.id)\
         .join(Category, Product.category_id == Category.id)\
         .filter(Store.region_id == reg.id, Order.status == "Completed")\
         .group_by(Category.name).order_by(desc("cat_rev")).first()

        top_category_name = top_cat_row[0] if top_cat_row else "Electronics & Gadgets"

        results.append(
            RegionItem(
                id=reg.id,
                name=reg.name,
                code=reg.code,
                manager_name=reg.manager_name,
                store_count=store_cnt,
                revenue=round(rev, 2),
                profit=round(prof, 2),
                margin_pct=margin,
                orders_count=ords,
                top_category=top_category_name
            )
        )

    results.sort(key=lambda x: x.revenue, reverse=True)
    return results
