import io
import csv
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.models import Order, OrderItem, Product, Category, Store, Region, Customer, Inventory
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/export", tags=["Data Export Center"])

@router.get("/sales")
def export_sales_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Export recent sales transactions as downloadable CSV."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Order Number", "Order Date", "Store Code", "Store Name", "Region", "Total Amount", "Total Cost", "Total Profit", "Status", "Payment Method"])

    orders = db.query(
        Order.order_number,
        Order.order_date,
        Store.store_code,
        Store.name.label("store_name"),
        Region.name.label("region_name"),
        Order.total_amount,
        Order.total_cost,
        Order.total_profit,
        Order.status,
        Order.payment_method
    ).select_from(Order).join(Store, Order.store_id == Store.id)\
     .join(Region, Store.region_id == Region.id)\
     .filter(Order.status == "Completed")\
     .order_by(Order.order_date.desc()).limit(10000).all()

    for o in orders:
        writer.writerow([
            o.order_number,
            o.order_date.strftime("%Y-%m-%d %H:%M:%S"),
            o.store_code,
            o.store_name,
            o.region_name,
            f"{o.total_amount:.2f}",
            f"{o.total_cost:.2f}",
            f"{o.total_profit:.2f}",
            o.status,
            o.payment_method
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=retailpulse_sales_export.csv"}
    )

@router.get("/products")
def export_products_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Export catalog performance and profit margin analysis as CSV."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["SKU", "Product Name", "Category", "Unit Cost", "Unit Price", "Gross Margin %", "Min Reorder Level", "Target Stock"])

    prods = db.query(
        Product.sku,
        Product.name,
        Category.name.label("cat_name"),
        Product.unit_cost,
        Product.unit_price,
        Product.min_reorder_level,
        Product.target_stock
    ).select_from(Product).join(Category, Product.category_id == Category.id).all()

    for p in prods:
        margin = round(((p.unit_price - p.unit_cost) / p.unit_price * 100), 1) if p.unit_price > 0 else 0.0
        writer.writerow([
            p.sku,
            p.name,
            p.cat_name,
            f"{p.unit_cost:.2f}",
            f"{p.unit_price:.2f}",
            f"{margin:.1f}%",
            p.min_reorder_level,
            p.target_stock
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=retailpulse_products_export.csv"}
    )

@router.get("/inventory")
def export_inventory_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Export warehouse and store inventory valuation report as CSV."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Store Code", "Store Name", "Product SKU", "Product Name", "Current Stock", "Reserved Stock", "Reorder Point", "Safety Stock", "Stock Valuation"])

    inv_records = db.query(
        Store.store_code,
        Store.name.label("store_name"),
        Product.sku,
        Product.name.label("product_name"),
        Product.unit_cost,
        Inventory.current_stock,
        Inventory.reserved_stock,
        Inventory.reorder_point,
        Inventory.safety_stock
    ).select_from(Inventory).join(Store, Inventory.store_id == Store.id)\
     .join(Product, Inventory.product_id == Product.id).all()

    for inv in inv_records:
        val = inv.current_stock * inv.unit_cost
        writer.writerow([
            inv.store_code,
            inv.store_name,
            inv.sku,
            inv.product_name,
            inv.current_stock,
            inv.reserved_stock,
            inv.reorder_point,
            inv.safety_stock,
            f"{val:.2f}"
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=retailpulse_inventory_valuation.csv"}
    )
