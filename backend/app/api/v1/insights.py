from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.schemas import InsightsResponse
from app.services.insights_service import generate_business_insights
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/insights", tags=["Business Insights"])

@router.get("", response_model=InsightsResponse)
def get_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve automatically generated prescriptive and diagnostic business recommendations."""
    return generate_business_insights(db)
