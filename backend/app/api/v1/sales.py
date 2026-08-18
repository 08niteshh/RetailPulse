from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.schemas.schemas import SalesAnalyticsResponse, FilterParams
from app.services.analytics_service import get_sales_drilldown
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/sales", tags=["Sales Analytics"])

@router.get("", response_model=SalesAnalyticsResponse)
@router.get("/drilldown", response_model=SalesAnalyticsResponse)
def get_sales_analytics(
    granularity: Optional[str] = Query("daily", description="daily, weekly, monthly, quarterly, yearly"),
    comparison_mode: Optional[bool] = Query(False, description="Enable previous period overlay"),
    date_preset: Optional[str] = Query("30d"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    region_id: Optional[int] = Query(None),
    store_id: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None),
    product_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve detailed sales analytics with multi-grain drilldown and comparison mode."""
    params = FilterParams(
        date_preset=date_preset,
        start_date=start_date,
        end_date=end_date,
        region_id=region_id,
        store_id=store_id,
        category_id=category_id,
        product_id=product_id
    )
    try:
        return get_sales_drilldown(db, params, granularity=granularity, comparison_mode=comparison_mode)
    except Exception as e:
        import traceback
        traceback.print_exc()
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Sales drilldown error: {str(e)}")
