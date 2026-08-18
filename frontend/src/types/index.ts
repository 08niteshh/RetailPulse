export type UserRole = 'ADMIN' | 'ANALYST';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface KPICardData {
  key: string;
  title: string;
  current_value: number;
  previous_value: number;
  percentage_change: number;
  is_positive: boolean;
  formatted_value: string;
  prefix: string;
  suffix: string;
  sparkline?: number[];
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
  profit: number;
  margin_pct: number;
}

export interface OrdersTrendPoint {
  date: string;
  orders: number;
  aov: number;
}

export interface CategoryRevenueItem {
  category: string;
  revenue: number;
  profit: number;
  units: number;
  margin_pct: number;
}

export interface RegionalRevenueItem {
  region: string;
  code: string;
  revenue: number;
  profit: number;
  orders: number;
}

export interface ProductPerformanceItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  revenue: number;
  profit: number;
  units: number;
  margin_pct: number;
}

export interface DashboardOverviewResponse {
  kpis: Record<string, KPICardData>;
  revenue_trend: RevenueTrendPoint[];
  orders_trend: OrdersTrendPoint[];
  category_revenue: CategoryRevenueItem[];
  regional_revenue: RegionalRevenueItem[];
  top_products: ProductPerformanceItem[];
  bottom_products: ProductPerformanceItem[];
  sales_vs_profit: Array<{
    name: string;
    revenue: number;
    profit: number;
    margin_pct: number;
    category: string;
  }>;
}

export interface SalesAnalyticsResponse {
  kpis: Record<string, KPICardData>;
  time_series: Array<{
    date: string;
    raw_date: string;
    revenue: number;
    profit: number;
    orders: number;
    units: number;
    aov: number;
    margin_pct: number;
  }>;
  granularity: string;
  mom_growth: number;
  yoy_growth: number;
  aov_trend: Array<{ date: string; aov: number }>;
  comparison_data?: {
    period_label: string;
    series: Array<{
      day_index: number;
      date: string;
      revenue: number;
      profit: number;
      orders: number;
    }>;
  };
}

export interface ProductItem {
  id: number;
  sku: string;
  name: string;
  category_name: string;
  unit_cost: number;
  unit_price: number;
  units_sold: number;
  revenue: number;
  profit: number;
  margin_pct: number;
  current_stock: number;
  stock_status: string;
  growth_pct: number;
}

export interface ProductDetailResponse {
  product: ProductItem;
  sales_history: Array<{ month: string; units: number; revenue: number; profit: number }>;
  monthly_trend: Array<{ month: string; units: number; revenue: number; profit: number }>;
  forecast: Array<{ date: string; forecast: number; lower_bound: number; upper_bound: number }>;
  inventory_metrics: {
    current_stock: number;
    unit_cost: number;
    total_stock_value: number;
    reorder_point: number;
    target_stock: number;
    lead_time_days: number;
    forecast_30d_demand: number;
    recommended_stock_level: number;
  };
}

export interface StoreItem {
  id: number;
  store_code: string;
  name: string;
  region_name: string;
  city: string;
  state: string;
  revenue: number;
  profit: number;
  orders_count: number;
  customers_count: number;
  inventory_value: number;
  margin_pct: number;
  growth_pct: number;
}

export interface RegionItem {
  id: number;
  name: string;
  code: string;
  manager_name?: string;
  store_count: number;
  revenue: number;
  profit: number;
  margin_pct: number;
  orders_count: number;
  top_category: string;
}

export interface RFMSegmentStat {
  segment: string;
  customer_count: number;
  percentage: number;
  avg_recency_days: number;
  avg_frequency: number;
  avg_monetary: number;
  total_revenue: number;
  color: string;
}

export interface CustomerItem {
  id: number;
  customer_code: string;
  name: string;
  email: string;
  city?: string;
  state?: string;
  segment: string;
  total_orders: number;
  total_spend: number;
  last_order_date?: string;
  recency_days: number;
  aov: number;
}

export interface CustomerAnalyticsResponse {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  repeat_rate: number;
  avg_clv: number;
  avg_order_value: number;
  segments: RFMSegmentStat[];
  top_customers: CustomerItem[];
}

export interface InventoryItem {
  product_id: number;
  sku: string;
  product_name: string;
  category_name: string;
  current_stock: number;
  reserved_stock: number;
  reorder_point: number;
  safety_stock: number;
  inventory_value: number;
  units_sold_30d: number;
  turnover_ratio: number;
  days_of_supply: number;
  status: 'GREEN' | 'YELLOW' | 'RED' | 'GRAY';
}

export interface InventoryOverviewResponse {
  total_stock_value: number;
  total_units_in_stock: number;
  overall_turnover_ratio: number;
  healthy_count: number;
  low_stock_count: number;
  critical_count: number;
  out_of_stock_count: number;
  alerts: Array<{
    type: 'CRITICAL' | 'WARNING' | 'INFO';
    title: string;
    message: string;
    count: number;
  }>;
  items: InventoryItem[];
}

export interface RecommendationItem {
  product_id: number;
  product_name: string;
  sku: string;
  category: string;
  current_stock: number;
  forecasted_demand_30d: number;
  daily_run_rate: number;
  reorder_point: number;
  safety_stock: number;
  recommended_reorder_qty: number;
  stockout_risk: 'HIGH' | 'MEDIUM' | 'LOW';
  estimated_days_until_stockout: number;
  reason: string;
}

export interface ForecastPoint {
  date: string;
  actual?: number | null;
  forecast?: number | null;
  lower_bound?: number | null;
  upper_bound?: number | null;
  baseline?: number | null;
}

export interface ForecastMetrics {
  mae: number;
  rmse: number;
  mape: number;
  baseline_mape: number;
  improvement_pct: number;
  model_name: string;
}

export interface ForecastResponse {
  historical_points: Array<{ date: string; actual: number; revenue: number }>;
  forecast_points: ForecastPoint[];
  metrics: ForecastMetrics;
  target_name: string;
  horizon_days: number;
  insights: string[];
}

export interface AnomalyItem {
  id: string;
  metric: string;
  date: string;
  expected_value: number;
  actual_value: number;
  deviation_pct: number;
  deviation_amount: number;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  anomaly_type: 'SPIKE' | 'DROP';
  entity_name?: string;
  explanation: string;
}

export interface AnomalyResponse {
  total_anomalies: number;
  critical_count: number;
  warning_count: number;
  anomalies: AnomalyItem[];
  time_series_with_bounds: Array<{
    date: string;
    actual: number;
    expected: number;
    upper_bound: number;
    lower_bound: number;
    is_anomaly: boolean;
  }>;
}

export interface InsightItem {
  id: string;
  category: 'REVENUE' | 'PROFITABILITY' | 'INVENTORY' | 'REGIONAL' | 'CUSTOMER';
  title: string;
  finding: string;
  evidence: string;
  business_impact: string;
  recommended_action: string;
  impact_level: 'HIGH' | 'MEDIUM' | 'LOW';
  metric_value?: string;
}

export interface InsightsResponse {
  generated_at: string;
  summary_stats: {
    total_insights: number;
    high_impact_count: number;
    medium_impact_count: number;
    categories_covered: string[];
  };
  insights: InsightItem[];
}

export interface CleaningSummary {
  rows_uploaded: number;
  rows_cleaned: number;
  duplicates_removed: number;
  missing_imputed: number;
  invalid_records_fixed: number;
  final_records: number;
  columns_detected: string[];
  cleaning_steps: string[];
}

export interface DatasetUploadResponse {
  success: boolean;
  message: string;
  dataset_id?: number;
  summary: CleaningSummary;
  preview: Array<Record<string, any>>;
}

export interface SQLQueryResult {
  columns: string[];
  rows: Array<Record<string, any>>;
  row_count: number;
  execution_time_ms: number;
  query: string;
}

export interface PresetSQLQuery {
  id: string;
  title: string;
  category: string;
  description: string;
  concepts_used: string[];
  sql: string;
}

export interface FilterState {
  datePreset: string;
  startDate: string | null;
  endDate: string | null;
  regionId: number | null;
  storeId: number | null;
  categoryId: number | null;
  productId: number | null;
}
