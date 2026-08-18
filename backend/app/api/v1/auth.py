from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.models.models import User, ActivityLog
from app.schemas.schemas import UserCreate, UserLogin, UserOut, Token
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user account."""
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Password confirmation validation if supplied
    if user_in.confirm_password and user_in.password != user_in.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    role = user_in.role.upper() if user_in.role.upper() in ["ADMIN", "ANALYST"] else "ANALYST"

    new_user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Log registration activity
    log = ActivityLog(
        user_id=new_user.id,
        action="USER_REGISTERED",
        entity_type="USER",
        entity_id=str(new_user.id),
        details=f"User {new_user.email} successfully registered with role {new_user.role}."
    )
    db.add(log)
    db.commit()

    token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        subject=new_user.id,
        role=new_user.role,
        expires_delta=token_expires
    )

    return Token(
        access_token=token,
        token_type="bearer",
        user=UserOut.from_orm(new_user)
    )

@router.post("/login", response_model=Token)
def login_user(login_in: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user with email & password and return JWT access token."""
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This user account has been deactivated."
        )

    token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        subject=user.id,
        role=user.role,
        expires_delta=token_expires
    )

    # Log login event
    log = ActivityLog(
        user_id=user.id,
        action="USER_LOGIN",
        entity_type="AUTH",
        details=f"User {user.email} logged in successfully."
    )
    db.add(log)
    db.commit()

    return Token(
        access_token=token,
        token_type="bearer",
        user=UserOut.from_orm(user)
    )

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Return currently authenticated user session."""
    return UserOut.from_orm(current_user)

@router.get("/demo-accounts")
def get_demo_credentials():
    """Provides sample testing credentials for frictionless evaluation."""
    return {
        "admin": {
            "email": "admin@retailpulse.io",
            "password": "AdminPass123!",
            "role": "ADMIN",
            "name": "Alexander Morgan (Executive Admin)"
        },
        "analyst": {
            "email": "analyst@retailpulse.io",
            "password": "AnalystPass123!",
            "role": "ANALYST",
            "name": "Elena Vance (Lead BI Analyst)"
        }
    }
