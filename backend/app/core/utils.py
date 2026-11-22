from datetime import UTC, datetime


def ahora_utc() -> datetime:
    """Fecha y hora actual con zona horaria (SQLModel guarda las fechas en UTC)."""
    return datetime.now(UTC)