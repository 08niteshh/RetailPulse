import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="ANALYST", nullable=False)  # ADMIN or ANALYST
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    activity_logs = relationship("ActivityLog", back_populates="user")
    dataset_logs = relationship("DatasetLog", back_populates="user")

class Region(Base):
    __tablename__ = "regions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    manager_name = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    stores = relationship("Store", back_populates="region")

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    store_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(50), nullable=False)
    square_footage = Column(Integer, default=5000)
    target_monthly_sales = Column(Float, default=100000.0)
    created_at = Column(DateTime, default=utc_now)

    region = relationship("Region", back_populates="stores")
    orders = relationship("Order", back_populates="store")
    inventory = relationship("Inventory", back_populates="store")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    target_margin_pct = Column(Float, default=35.0)
    created_at = Column(DateTime, default=utc_now)

    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    unit_cost = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    min_reorder_level = Column(Integer, default=20)
    target_stock = Column(Integer, default=100)
    lead_time_days = Column(Integer, default=5)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    category = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")
    inventory = relationship("Inventory", back_populates="product")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    customer_code = Column(String(50), unique=True, index=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(50), nullable=True)
    segment = Column(String(50), default="Regular")  # Champions, Loyal, Regular, At Risk, Inactive
    acquisition_date = Column(DateTime, default=utc_now)
    created_at = Column(DateTime, default=utc_now)

    orders = relationship("Order", back_populates="customer")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(100), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False, index=True)
    order_date = Column(DateTime, nullable=False, index=True)
    status = Column(String(50), default="Completed")  # Completed, Cancelled, Returned, Processing
    payment_method = Column(String(50), default="Credit Card")
    discount_amount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)
    total_profit = Column(Float, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    customer = relationship("Customer", back_populates="orders")
    store = relationship("Store", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_orders_date_store", "order_date", "store_id"),
        Index("idx_orders_date_customer", "order_date", "customer_id"),
    )

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    unit_cost = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    discount_pct = Column(Float, default=0.0)
    subtotal = Column(Float, nullable=False)
    profit = Column(Float, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    current_stock = Column(Integer, default=0, nullable=False)
    reserved_stock = Column(Integer, default=0, nullable=False)
    reorder_point = Column(Integer, default=20, nullable=False)
    safety_stock = Column(Integer, default=10, nullable=False)
    last_restocked_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    store = relationship("Store", back_populates="inventory")
    product = relationship("Product", back_populates="inventory")

    __table_args__ = (
        UniqueConstraint("store_id", "product_id", name="uq_store_product_inventory"),
    )

class DatasetLog(Base):
    __tablename__ = "dataset_logs"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    uploaded_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    rows_ingested = Column(Integer, default=0)
    rows_cleaned = Column(Integer, default=0)
    duplicates_removed = Column(Integer, default=0)
    missing_imputed = Column(Integer, default=0)
    status = Column(String(50), default="Completed")
    audit_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="dataset_logs")

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=True)
    entity_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="activity_logs")
