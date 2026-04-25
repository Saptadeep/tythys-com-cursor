from __future__ import annotations

import hashlib
import uuid

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import ApiKey, Tenant
from app.db.seed import ensure_default_tenant_and_api_key


def _hash_key(key: str) -> str:
    return hashlib.sha256(key.encode("utf-8")).hexdigest()


def resolve_tenant_id(session: Session | None, x_api_key: str | None) -> uuid.UUID | None:
    """
    Returns tenant UUID when DB mode, else None (caller validates plain key against settings).
    """
    if not x_api_key:
        raise HTTPException(status_code=401, detail="Missing x-api-key header.")
    if session is None:
        if x_api_key != settings.ingest_api_key:
            raise HTTPException(status_code=401, detail="Invalid API key.")
        return None

    ensure_default_tenant_and_api_key(session)
    session.flush()

    if x_api_key == settings.ingest_api_key:
        tenant = session.execute(select(Tenant).where(Tenant.slug == "default")).scalar_one()
        return tenant.id

    key_hash = _hash_key(x_api_key)
    api_key = session.execute(select(ApiKey).where(ApiKey.key_hash == key_hash)).scalar_one_or_none()
    if api_key is None:
        raise HTTPException(status_code=401, detail="Invalid API key.")
    return api_key.tenant_id
