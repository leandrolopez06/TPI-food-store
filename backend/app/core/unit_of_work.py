from types import TracebackType
from typing import Self

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Una transacción: abre la sesión al entrar y confirma o deshace al salir.

    Los Unit of Work de cada módulo heredan de esta clase y, en __enter__,
    crean los repositorios que comparten la misma sesión.
    """

    session: Session

    def __enter__(self) -> Self:
        self.session = session_factory()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()