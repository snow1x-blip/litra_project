from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class Quastions(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(primary_key=True)
    topic: Mapped[str] = mapped_column(String(63))
    category: Mapped[str] = mapped_column(String(63))
    body: Mapped[str] = mapped_column(String(255))
    answer: Mapped[str] = mapped_column(String(63))

    def __repr__(self) -> str:
        return f"[{self.id}, {self.topic}, {self.body}, {self.answer}]"
