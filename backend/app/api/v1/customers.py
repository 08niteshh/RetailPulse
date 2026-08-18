from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Dict, Any, Optional

from app.core.database import get_db
from app.models.models import Customer, Order, OrderItem, Product
from app.schemas.schemas import CustomerAnalyticsResponse, CustomerItem
from app.services.rfm_service import calculate_customer_rfm
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/customers", tags=["Customer Analytics & RFM"])

@router.get("", response_model=CustomerAnalyticsResponse)
def get_customers_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve customer RFM segment summaries, repeat rates, CLV, and customer profiles."""
    return calculate_customer_rfm(db)

@router.get("/{customer_id}", response_model=Dict[str, Any])
def get_customer_detail(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve deep dive customer profile and full chronological purchase history."""
    cust = db.query(Customer).filter(Customer.id == customer_id).first()
    if not cust:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    orders = db.query(Order).filter(Order.customer_id == customer_id, Order.status == "Completed")\
               .order_by(Order.order_date.desc()).all()

    orders_list = []
    total_spend = 0.0
    for o in orders:
        total_spend += o.total_amount
        items = db.query(
            OrderItem.quantity,
            OrderItem.unit_price,
            OrderItem.subtotal,
            Product.name.label("product_name"),
            Product.sku
        ).select_from(OrderItem).join(Product, OrderItem.product_id == Product.id)\
         .filter(OrderItem.order_id == o.id).all()

        orders_list.append({
            "order_number": o.order_number,
            "order_date": o.order_date.strftime("%Y-%m-%d %H:%M"),
            "total_amount": round(o.total_amount, 2),
            "payment_method": o.payment_method,
            "items_count": len(items),
            "items": [
                {
                    "product_name": it.product_name,
                    "sku": it.sku,
                    "quantity": it.quantity,
                    "unit_price": it.unit_price,
                    "subtotal": it.subtotal
                }
                for it in items
            ]
        })

    return {
        "customer": {
            "id": cust.id,
            "customer_code": cust.customer_code,
            "name": f"{cust.first_name} {cust.last_name}",
            "email": cust.email,
            "phone": cust.phone,
            "city": cust.city,
            "state": cust.state,
            "segment": cust.segment,
            "acquisition_date": cust.acquisition_date.strftime("%Y-%m-%d") if cust.acquisition_date else None,
            "total_orders": len(orders),
            "total_spend": round(total_spend, 2),
            "aov": round(total_spend / len(orders), 2) if orders else 0.0
        },
        "orders": orders_list
    }
