from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.schemas import SQLQueryRequest, SQLQueryResult, PresetSQLQuery
from app.services.sql_service import execute_sql_query, PRESET_QUERIES
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/sql", tags=["SQL Analytics Studio"])

@router.get("/presets", response_model=List[PresetSQLQuery])
def get_preset_queries(current_user: User = Depends(get_current_user)):
    """Retrieve pre-built analytical SQL queries demonstrating CTEs, Window Functions, and advanced joins."""
    return PRESET_QUERIES

@router.post("/execute", response_model=SQLQueryResult)
def run_sql_query(
    request: SQLQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Execute read-only SQL query against the database and measure execution performance."""
    try:
        result = execute_sql_query(db, request.query)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"SQL Query Execution Error: {str(e)}"
        )
