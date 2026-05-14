from sqlalchemy import select
from database import Session
from models.model import Quastions

def test(session_factory, id: int):
    with session_factory() as session:
        question = session.scalars(select(Quastions).where(Quastions.id == id)).one()
        print(question)

test(Session, 2)
