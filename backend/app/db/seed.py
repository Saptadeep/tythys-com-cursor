from __future__ import annotations

import hashlib
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import ApiKey, Tenant


def _hash_key(key: str) -> str:
    return hashlib.sha256(key.encode("utf-8")).hexdigest()


def ensure_default_tenant_and_api_key(session: Session) -> None:
    """Idempotent seed for local/dev: default tenant + API key matching settings.ingest_api_key."""
    slug = "default"
    tenant = session.execute(select(Tenant).where(Tenant.slug == slug)).scalar_one_or_none()
    if tenant is None:
        tenant = Tenant(
            slug=slug,
            name="Default Tenant",
            created_at=datetime.now(tz=timezone.utc),
        )
        session.add(tenant)
        session.flush()

    key_hash = _hash_key(settings.ingest_api_key)
    existing = session.execute(
        select(ApiKey).where(ApiKey.tenant_id == tenant.id, ApiKey.key_hash == key_hash),
    ).scalar_one_or_none()
    if existing is None:
        session.add(
            ApiKey(
                tenant_id=tenant.id,
                key_prefix=settings.ingest_api_key[:8],
                key_hash=key_hash,
                name="default-ingest",
                created_at=datetime.now(tz=timezone.utc),
            ),
        )
