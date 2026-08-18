from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.core.database import get_db
from app.schemas.schemas import InventoryOverviewResponse, RecommendationItem
from app.services.inventory_service import get_inventory_overview, get_inventory_recommendations
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/inventory", tags=["Inventory Intelligence"])

@router.get("", response_model=InventoryOverviewResponse)
def get_inventory_status(
    store_id: Optional[int] = Query(None, description="Filter by Store ID"),
    category_id: Optional[int] = Query(None, description="Filter by Category ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve inventory stock valuation, turnover ratio, stock status cards, and operational alerts."""
    return get_inventory_overview(db, store_id=store_id, category_id=category_id)

@router.get("/recommendations", response_model=List[RecommendationItem])
def get_recommendations(
    store_id: Optional[int] = Query(None, description="Filter by Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve data-driven replenishment recommendations and stockout risk calculations."""
    return get_inventory_recommendations(db, store_id=store_id)
