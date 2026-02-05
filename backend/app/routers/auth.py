"""Auth routes: login, me, logout."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import create_access_token, get_current_user
from app.database import get_db
from app.models.orm import User
from app.models.schemas import LoginRequest, LoginResponse, UserResponse
from app.serialization import row_to_camel

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(
    body: LoginRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.pin == body.pin).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid PIN")
    row = {c.key: getattr(user, c.key) for c in user.__table__.columns}
    user_response = row_to_camel(row)
    token = create_access_token(user.id)
    return LoginResponse(token=token, user=UserResponse(**user_response))


@router.get("/me", response_model=UserResponse)
def me(current_user: dict = Depends(get_current_user)):
    return current_user


@router.post("/logout")
def logout():
    return {}
