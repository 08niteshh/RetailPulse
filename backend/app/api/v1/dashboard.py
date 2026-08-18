from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.schemas.schemas import DashboardOverviewResponse, FilterParams
from app.services.analytics_service import get_dashboard_kpis
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard Overview"])

@router.get("/overview", response_model=DashboardOverviewResponse)
def get_dashboard_overview(
    date_preset: Optional[str] = Query("30d", description="Preset: today, 7d, 30d, 90d, ytd, all, custom"),
    start_date: Optional[str] = Query(None, description="ISO format start date"),
    end_date: Optional[str] = Query(None, description="ISO format end date"),
    region_id: Optional[int] = Query(None, description="Filter by Region ID"),
    store_id: Optional[int] = Query(None, description="Filter by Store ID"),
    category_id: Optional[int] = Query(None, description="Filter by Category ID"),
    product_id: Optional[int] = Query(None, description="Filter by Product ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve executive KPI metrics, trend charts, category distributions, and top/bottom rankings."""
    params = FilterParams(
        date_preset=date_preset,
        start_date=start_date,
        end_date=end_date,
        region_id=region_id,
        store_id=store_id,
        category_id=category_id,
        product_id=product_id
    )
    return get_dashboard_kpis(db, params)
