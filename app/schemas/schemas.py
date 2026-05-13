from models.model import Quastions


def create_question(question: Quastions, session) -> None:
    session.add(question)
