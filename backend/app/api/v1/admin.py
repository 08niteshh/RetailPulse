from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import get_db
from app.models.models import User, ActivityLog, Order, Product, Store, Customer
from app.schemas.schemas import UserOut, UserCreate
from app.core.security import get_password_hash
from app.api.deps import require_roles

router = APIRouter(prefix="/admin", tags=["Admin Management"])

@router.get("/users", response_model=List[UserOut])
def list_system_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles(["ADMIN"]))
):
    """Admin-only: List all system users and their assigned roles."""
    return db.query(User).order_by(User.id.asc()).all()

@router.post("/users", response_model=UserOut)
def create_system_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles(["ADMIN"]))
):
    """Admin-only: Provision a new user account with specified role."""
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    new_user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role.upper(),
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Activity log
    log = ActivityLog(
        user_id=admin_user.id,
        action="ADMIN_CREATE_USER",
        entity_type="USER",
        entity_id=str(new_user.id),
        details=f"Admin {admin_user.email} created user {new_user.email} with role {new_user.role}."
    )
    db.add(log)
    db.commit()

    return UserOut.from_orm(new_user)

@router.get("/activity-logs", response_model=List[Dict[str, Any]])
def list_activity_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles(["ADMIN"]))
):
    """Admin-only: View system activity audit log entries."""
    logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit).all()
    results = []
    for l in logs:
        user_email = l.user.email if l.user else "System"
        results.append({
            "id": l.id,
            "user_email": user_email,
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "details": l.details,
            "created_at": l.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })
    return results

@router.get("/system-status")
def get_system_status(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles(["ADMIN"]))
):
    """Admin-only: Overall database and platform health telemetry."""
    total_orders = db.query(Order).count()
    total_prods = db.query(Product).count()
    total_stores = db.query(Store).count()
    total_custs = db.query(Customer).count()
    total_users = db.query(User).count()

    return {
        "status": "HEALTHY",
        "database_engine": str(db.bind.engine.url),
        "total_orders": total_orders,
        "total_products": total_prods,
        "total_stores": total_stores,
        "total_customers": total_custs,
        "total_users": total_users,
        "analytics_engine_status": "ONLINE",
        "forecasting_engine_status": "ONLINE"
    }
