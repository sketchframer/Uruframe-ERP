"""Pydantic schemas for API request/response (camelCase for JSON)."""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


def camel_alias(name: str) -> str:
    """Convert snake_case to camelCase."""
    parts = name.split("_")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


# User
class UserBase(BaseModel):
    name: str
    role: str
    pin: str
    avatar: str | None = None


class UserCreate(UserBase):
    id: str | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    pin: str | None = None
    avatar: str | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    role: str
    pin: str
    avatar: str | None = None


# Generic: allow arbitrary fields for PATCH and response (frontend sends camelCase)
class GenericResourceCreate(BaseModel):
    model_config = ConfigDict(extra="allow")


class GenericResourceUpdate(BaseModel):
    model_config = ConfigDict(extra="allow")


class GenericResourceResponse(BaseModel):
    model_config = ConfigDict(extra="allow", populate_by_name=True)


# Auth
class LoginRequest(BaseModel):
    pin: str


class LoginResponse(BaseModel):
    token: str
    user: UserResponse
