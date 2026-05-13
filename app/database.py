from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase


engine = create_engine("sqlite:///./quest.db")
Session = sessionmaker(engine)


class Base(DeclarativeBase):
    pass


def create_db() -> None:
	Base.metadata.create_all(engine)


def get_db() -> None:
    db = Session()
    try:
        yield db

    finally:
        db.close()
