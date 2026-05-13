from sqlalchemy import select
from database import Session
from models.model import Quastions


def get_question_in_db(session: Session, id: int) -> tuple[str, str, list]:
    statement_body = select(Quastions.body).where(Quastions.id == id)
    body = session.scalars(statement_body).one()

    statement_answer = select(Quastions.answer).where(Quastions.id == id)
    answer = session.scalars(statement_answer).one()

    statement_topic = select(Quastions.topic).where(Quastions.id == id)
    topic = session.scalars(statement_topic).one()

    statement_other_answer = select(Quastions.answer).where(Quastions.topic == topic)
    other_answer = session.scalars(statement_other_answer).all()

    def other_answers_result(mas, ans):
        result = list(set(mas))
        result.remove(ans)

        return result

    return (str(body), str(answer), other_answers_result(other_answer, answer))
