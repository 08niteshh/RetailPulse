from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

try:
    from pydantic import EmailStr
except Exception:
    EmailStr = str  # Safe fallback

# --- Auth Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "ANALYST"

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    confirm_password: Optional[str] = None
    role: str = "ANALYST"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None

# --- Global Filter Params ---
class FilterParams(BaseModel):
    date_preset: Optional[str] = "30d"  # today, 7d, 30d, 90d, ytd, all, custom
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    region_id: Optional[int] = None
    store_id: Optional[int] = None
    category_id: Optional[int] = None
    product_id: Optional[int] = None

# --- KPI Card Schema ---
class KPICardData(BaseModel):
    key: str
    title: str
    current_value: float
    previous_value: float
    percentage_change: float
    is_positive: bool
    formatted_value: str
    prefix: str = "₹"
    suffix: str = ""
    sparkline: List[float] = []

class DashboardOverviewResponse(BaseModel):
    kpis: Dict[str, KPICardData]
    revenue_trend: List[Dict[str, Any]]
    orders_trend: List[Dict[str, Any]]
    category_revenue: List[Dict[str, Any]]
    regional_revenue: List[Dict[str, Any]]
    top_products: List[Dict[str, Any]]
    bottom_products: List[Dict[str, Any]]
    sales_vs_profit: List[Dict[str, Any]]

# --- Sales Analytics ---
class SalesAnalyticsResponse(BaseModel):
    kpis: Dict[str, KPICardData]
    time_series: List[Dict[str, Any]]
    granularity: str
    mom_growth: float
    yoy_growth: float
    aov_trend: List[Dict[str, Any]]
    comparison_data: Optional[Dict[str, Any]] = None

# --- Product Analytics ---
class ProductItem(BaseModel):
    id: int
    sku: str
    name: str
    category_name: str
    unit_cost: float
    unit_price: float
    units_sold: int
    revenue: float
    profit: float
    margin_pct: float
    current_stock: int
    stock_status: str
    growth_pct: float

class ProductDetailResponse(BaseModel):
    product: ProductItem
    sales_history: List[Dict[str, Any]]
    monthly_trend: List[Dict[str, Any]]
    forecast: List[Dict[str, Any]]
    inventory_metrics: Dict[str, Any]

# --- Store & Regional ---
class StoreItem(BaseModel):
    id: int
    store_code: str
    name: str
    region_name: str
    city: str
    state: str
    revenue: float
    profit: float
    orders_count: int
    customers_count: int
    inventory_value: float
    margin_pct: float
    growth_pct: float

class RegionItem(BaseModel):
    id: int
    name: str
    code: str
    manager_name: Optional[str]
    store_count: int
    revenue: float
    profit: float
    margin_pct: float
    orders_count: int
    top_category: str

# --- Customer Analytics & RFM ---
class RFMSegmentStat(BaseModel):
    segment: str
    customer_count: int
    percentage: float
    avg_recency_days: float
    avg_frequency: float
    avg_monetary: float
    total_revenue: float
    color: str

class CustomerItem(BaseModel):
    id: int
    customer_code: str
    name: str
    email: str
    city: Optional[str]
    state: Optional[str]
    segment: str
    total_orders: int
    total_spend: float
    last_order_date: Optional[str]
    recency_days: int
    aov: float

class CustomerAnalyticsResponse(BaseModel):
    total_customers: int
    new_customers: int
    returning_customers: int
    repeat_rate: float
    avg_clv: float
    avg_order_value: float
    segments: List[RFMSegmentStat]
    top_customers: List[CustomerItem]

# --- Inventory Intelligence ---
class InventoryItem(BaseModel):
    product_id: int
    sku: str
    product_name: str
    category_name: str
    current_stock: int
    reserved_stock: int
    reorder_point: int
    safety_stock: int
    inventory_value: float
    units_sold_30d: int
    turnover_ratio: float
    days_of_supply: float
    status: str  # GREEN, YELLOW, RED, GRAY

class InventoryOverviewResponse(BaseModel):
    total_stock_value: float
    total_units_in_stock: int
    overall_turnover_ratio: float
    healthy_count: int
    low_stock_count: int
    critical_count: int
    out_of_stock_count: int
    alerts: List[Dict[str, Any]]
    items: List[InventoryItem]

# --- Demand Forecasting ---
class ForecastPoint(BaseModel):
    date: str
    actual: Optional[float] = None
    forecast: Optional[float] = None
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    baseline: Optional[float] = None

class ForecastMetrics(BaseModel):
    mae: float
    rmse: float
    mape: float
    baseline_mape: float
    improvement_pct: float
    model_name: str

class ForecastResponse(BaseModel):
    historical_points: List[Dict[str, Any]]
    forecast_points: List[ForecastPoint]
    metrics: ForecastMetrics
    target_name: str
    horizon_days: int
    insights: List[str]

# --- Inventory Recommendations ---
class RecommendationItem(BaseModel):
    product_id: int
    product_name: str
    sku: str
    category: str
    current_stock: int
    forecasted_demand_30d: int
    daily_run_rate: float
    reorder_point: int
    safety_stock: int
    recommended_reorder_qty: int
    stockout_risk: str  # HIGH, MEDIUM, LOW
    estimated_days_until_stockout: int
    reason: str

# --- Anomaly Detection ---
class AnomalyItem(BaseModel):
    id: str
    metric: str
    date: str
    expected_value: float
    actual_value: float
    deviation_pct: float
    deviation_amount: float
    severity: str  # CRITICAL, WARNING, INFO
    anomaly_type: str  # SPIKE, DROP
    entity_name: Optional[str] = None
    explanation: str

class AnomalyResponse(BaseModel):
    total_anomalies: int
    critical_count: int
    warning_count: int
    anomalies: List[AnomalyItem]
    time_series_with_bounds: List[Dict[str, Any]]

# --- Business Insights ---
class InsightItem(BaseModel):
    id: str
    category: str  # REVENUE, PROFITABILITY, INVENTORY, REGIONAL, CUSTOMER
    title: str
    finding: str
    evidence: str
    business_impact: str
    recommended_action: str
    impact_level: str  # HIGH, MEDIUM, LOW
    metric_value: Optional[str] = None

class InsightsResponse(BaseModel):
    generated_at: str
    summary_stats: Dict[str, Any]
    insights: List[InsightItem]

# --- Data Cleaning & Ingestion ---
class CleaningSummary(BaseModel):
    rows_uploaded: int
    rows_cleaned: int
    duplicates_removed: int
    missing_imputed: int
    invalid_records_fixed: int
    final_records: int
    columns_detected: List[str]
    cleaning_steps: List[str]

class DatasetUploadResponse(BaseModel):
    success: bool
    message: str
    dataset_id: Optional[int]
    summary: CleaningSummary
    preview: List[Dict[str, Any]]

# --- SQL Analytics Studio ---
class SQLQueryRequest(BaseModel):
    query: str

class SQLQueryResult(BaseModel):
    columns: List[str]
    rows: List[Dict[str, Any]]
    row_count: int
    execution_time_ms: float
    query: str

class PresetSQLQuery(BaseModel):
    id: str
    title: str
    category: str
    description: str
    concepts_used: List[str]
    sql: str
