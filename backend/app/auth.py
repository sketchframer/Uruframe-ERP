"""JWT create/verify and get_current_user dependency."""

from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.orm import User
from app.serialization import row_to_camel

security = HTTPBearer(auto_error=False)


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode = {"sub": user_id, "exp": expire}
    return jwt.encode(to_encode, settings.jwt_secret, algorithm="HS256")


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    row = {c.key: getattr(user, c.key) for c in user.__table__.columns}
    return row_to_camel(row)
