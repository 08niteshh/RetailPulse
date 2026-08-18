from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import get_db
from app.models.models import DatasetLog, User, Order
from app.schemas.schemas import DatasetUploadResponse
from app.services.cleaning_service import clean_and_ingest_csv
from app.seed.generator import seed_database
from app.api.deps import get_current_user, require_roles

router = APIRouter(prefix="/datasets", tags=["Dataset Management & Ingestion"])

@router.post("/upload", response_model=DatasetUploadResponse)
async def upload_csv_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload and process CSV dataset through the 10-step automated validation and cleaning pipeline."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a valid .csv file."
        )

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty."
        )

    response = clean_and_ingest_csv(
        file_bytes=content,
        filename=file.filename,
        db=db,
        user_id=current_user.id
    )
    return response

@router.get("", response_model=List[Dict[str, Any]])
def list_dataset_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve history of uploaded datasets, cleaning audit statistics, and status."""
    logs = db.query(DatasetLog).order_by(DatasetLog.created_at.desc()).all()
    results = []
    for l in logs:
        results.append({
            "id": l.id,
            "filename": l.filename,
            "rows_ingested": l.rows_ingested,
            "rows_cleaned": l.rows_cleaned,
            "duplicates_removed": l.duplicates_removed,
            "missing_imputed": l.missing_imputed,
            "status": l.status,
            "created_at": l.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })
    return results

@router.post("/seed-sample")
def trigger_sample_data_seed(
    target_count: int = 100000,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    """Admin-only: Trigger generation of 100,000+ realistic retail transaction dataset."""
    seed_database(db, target_transaction_count=target_count)
    return {
        "success": True,
        "message": f"Successfully initialized and verified retail dataset with {target_count:,}+ transactions."
    }
