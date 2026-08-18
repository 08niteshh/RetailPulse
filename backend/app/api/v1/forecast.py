from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.schemas.schemas import ForecastResponse
from app.services.forecast_service import run_demand_forecast
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/forecast", tags=["Demand Forecasting"])

@router.get("", response_model=ForecastResponse)
def get_forecast(
    product_id: Optional[int] = Query(None, description="Product ID filter"),
    category_id: Optional[int] = Query(None, description="Category ID filter"),
    store_id: Optional[int] = Query(None, description="Store ID filter"),
    horizon_days: int = Query(30, ge=7, le=90, description="Forecast horizon (7, 30, 60, 90 days)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Run real statistical time-series demand forecasting with confidence intervals and error metrics."""
    return run_demand_forecast(
        db,
        product_id=product_id,
        category_id=category_id,
        store_id=store_id,
        horizon_days=horizon_days
    )
