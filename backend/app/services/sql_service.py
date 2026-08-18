import time
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.schemas.schemas import SQLQueryResult, PresetSQLQuery

PRESET_QUERIES: List[PresetSQLQuery] = [
    PresetSQLQuery(
        id="top-products-by-category-window",
        title="Top 3 Products per Category (Window Functions)",
        category="Category Intelligence",
        description="Ranks products within each merchandise category by net revenue using DENSE_RANK() and Common Table Expressions (CTEs).",
        concepts_used=["CTE", "DENSE_RANK() OVER(PARTITION BY ...)", "JOIN", "GROUP BY"],
        sql="""WITH ProductSales AS (
    SELECT 
        c.name AS category_name,
        p.name AS product_name,
        p.sku,
        SUM(oi.quantity) AS total_units_sold,
        ROUND(SUM(oi.subtotal), 2) AS total_revenue,
        ROUND(SUM(oi.profit), 2) AS total_profit,
        DENSE_RANK() OVER (
            PARTITION BY c.name 
            ORDER BY SUM(oi.subtotal) DESC
        ) as category_rank
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN categories c ON p.category_id = c.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'Completed'
    GROUP BY c.name, p.name, p.sku
)
SELECT 
    category_name,
    category_rank,
    product_name,
    sku,
    total_units_sold,
    total_revenue,
    total_profit
FROM ProductSales
WHERE category_rank <= 3
ORDER BY category_name, category_rank;"""
    ),
    PresetSQLQuery(
        id="mom-growth-lag",
        title="Monthly Revenue & MoM Growth % (LAG Window Function)",
        category="Time Series Analysis",
        description="Calculates monthly gross revenue, previous month revenue using LAG(), and exact Month-over-Month percentage growth.",
        concepts_used=["LAG() OVER()", "CTE", "Date Formatting", "CASE WHEN (Zero Division Guard)"],
        sql="""WITH MonthlyRevenue AS (
    SELECT 
        strftime('%Y-%m', order_date) AS sales_month,
        COUNT(DISTINCT id) AS total_orders,
        COUNT(DISTINCT customer_id) AS unique_customers,
        ROUND(SUM(total_amount), 2) AS current_month_revenue,
        ROUND(SUM(total_profit), 2) AS current_month_profit
    FROM orders
    WHERE status = 'Completed'
    GROUP BY strftime('%Y-%m', order_date)
)
SELECT 
    sales_month,
    total_orders,
    unique_customers,
    current_month_revenue,
    current_month_profit,
    LAG(current_month_revenue, 1) OVER (ORDER BY sales_month) AS prior_month_revenue,
    ROUND(
        (current_month_revenue - LAG(current_month_revenue, 1) OVER (ORDER BY sales_month)) 
        / NULLIF(LAG(current_month_revenue, 1) OVER (ORDER BY sales_month), 0) * 100.0, 
        2
    ) AS mom_growth_pct
FROM MonthlyRevenue
ORDER BY sales_month DESC;"""
    ),
    PresetSQLQuery(
        id="cumulative-running-total",
        title="Cumulative Running Revenue & Share of Business",
        category="Financial Analytics",
        description="Computes running cumulative sales total over time and moving 7-day average sales.",
        concepts_used=["SUM() OVER(ROWS BETWEEN ...)", "AVG() OVER()", "Window Frames"],
        sql="""WITH DailySales AS (
    SELECT 
        strftime('%Y-%m-%d', order_date) AS sales_date,
        COUNT(id) AS daily_orders,
        ROUND(SUM(total_amount), 2) AS daily_revenue
    FROM orders
    WHERE status = 'Completed'
    GROUP BY strftime('%Y-%m-%d', order_date)
)
SELECT 
    sales_date,
    daily_orders,
    daily_revenue,
    ROUND(
        SUM(daily_revenue) OVER (
            ORDER BY sales_date 
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ), 2
    ) AS cumulative_running_total,
    ROUND(
        AVG(daily_revenue) OVER (
            ORDER BY sales_date 
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        ), 2
    ) AS moving_avg_7d
FROM DailySales
ORDER BY sales_date DESC
LIMIT 45;"""
    ),
    PresetSQLQuery(
        id="store-performance-ranking",
        title="Store Benchmark & Regional Contribution",
        category="Store Operations",
        description="Ranks stores by revenue and calculates each store's percentage contribution to its respective region's total sales.",
        concepts_used=["SUM() OVER(PARTITION BY region)", "RANK()", "Nested Aggregation"],
        sql="""WITH StoreSummary AS (
    SELECT 
        r.name AS region_name,
        s.name AS store_name,
        s.city,
        s.state,
        COUNT(DISTINCT o.id) AS total_orders,
        ROUND(SUM(o.total_amount), 2) AS store_revenue,
        ROUND(SUM(o.total_profit), 2) AS store_profit
    FROM orders o
    JOIN stores s ON o.store_id = s.id
    JOIN regions r ON s.region_id = r.id
    WHERE o.status = 'Completed'
    GROUP BY r.name, s.name, s.city, s.state
)
SELECT 
    region_name,
    store_name,
    city,
    state,
    total_orders,
    store_revenue,
    store_profit,
    ROUND(SUM(store_revenue) OVER (PARTITION BY region_name), 2) AS regional_total_revenue,
    ROUND((store_revenue / SUM(store_revenue) OVER (PARTITION BY region_name)) * 100.0, 2) AS pct_of_regional_revenue,
    RANK() OVER (ORDER BY store_revenue DESC) AS overall_rank
FROM StoreSummary
ORDER BY store_revenue DESC;"""
    ),
    PresetSQLQuery(
        id="customer-rfm-sql",
        title="Customer Frequency & Tier Segmentation (CASE Statements)",
        category="Customer Intelligence",
        description="Segments customer cohorts based on transaction frequency and lifetime spend using multi-condition CASE expressions.",
        concepts_used=["CASE Expression", "HAVING", "GROUP BY", "Conditional Scoring"],
        sql="""SELECT 
    c.customer_code,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.email,
    c.city,
    c.state,
    COUNT(o.id) AS total_orders,
    ROUND(SUM(o.total_amount), 2) AS lifetime_spend,
    ROUND(AVG(o.total_amount), 2) AS average_order_value,
    MAX(strftime('%Y-%m-%d', o.order_date)) AS most_recent_order,
    CASE 
        WHEN COUNT(o.id) >= 6 AND SUM(o.total_amount) >= 1500 THEN 'Tier 1: VIP Elite'
        WHEN COUNT(o.id) >= 3 AND SUM(o.total_amount) >= 700 THEN 'Tier 2: Loyal High-Value'
        WHEN COUNT(o.id) >= 2 THEN 'Tier 3: Repeat Buyer'
        ELSE 'Tier 4: Single Purchase'
    END AS customer_tier
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.status = 'Completed'
GROUP BY c.id, c.customer_code, c.first_name, c.last_name, c.email, c.city, c.state
ORDER BY lifetime_spend DESC
LIMIT 50;"""
    )
]

def execute_sql_query(db: Session, query_text: str) -> SQLQueryResult:
    """
    Execute read-only SQL queries with timing and result serialization.
    """
    clean_query = query_text.strip()
    # Basic security check: disallow destructive queries
    lower_q = clean_query.lower()
    for forbidden in ["drop ", "truncate ", "delete from", "insert into", "update ", "alter table"]:
        if forbidden in lower_q:
            raise ValueError(f"Write operation '{forbidden.strip()}' is disallowed in the SQL Analytics Studio.")

    start_time = time.time()
    
    result = db.execute(text(clean_query))
    columns = list(result.keys()) if result.returns_rows else []
    raw_rows = result.fetchall() if result.returns_rows else []
    
    execution_time_ms = round((time.time() - start_time) * 1000, 2)
    
    rows = []
    for r in raw_rows:
        row_dict = {}
        for idx, col in enumerate(columns):
            val = r[idx]
            # Convert float rounding for clean display
            if isinstance(val, float):
                val = round(val, 2)
            row_dict[col] = val
        rows.append(row_dict)

    return SQLQueryResult(
        columns=columns,
        rows=rows,
        row_count=len(rows),
        execution_time_ms=execution_time_ms,
        query=query_text
    )
