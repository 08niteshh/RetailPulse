from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.schemas.schemas import AnomalyResponse
from app.services.anomaly_service import detect_anomalies
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/anomalies", tags=["Anomaly Detection"])

@router.get("", response_model=AnomalyResponse)
def get_anomalies(
    metric_type: str = Query("revenue", description="revenue, orders, profit"),
    threshold_sigma: float = Query(2.2, ge=1.5, le=4.0, description="Standard deviations threshold for outlier band"),
    store_id: Optional[int] = Query(None, description="Store ID filter"),
    region_id: Optional[int] = Query(None, description="Region ID filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Detect statistical sales and order anomalies with Z-scores, deviation percentages, and root-cause explanations."""
    return detect_anomalies(
        db,
        metric_type=metric_type,
        threshold_sigma=threshold_sigma,
        store_id=store_id,
        region_id=region_id
    )
