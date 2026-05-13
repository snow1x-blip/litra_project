from schemas.schemas import create_question
from database import Session


def add_question_from_db(session: Session, question) -> None:
    with Session() as session:
        try:
            create_question(question, session)
        
        except:
            session.rollback()
            raise
        
        else:
            session.commit()
