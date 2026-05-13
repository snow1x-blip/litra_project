import random as rd

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from models.model import Quastions
from schemas.schemas import create_question
from schemas.question_schemas import QuestionResponse
from database import Session, create_db, get_db
from add_item.add_question import add_question_from_db
from game.game import get_question_in_db


create_db()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/question", response_model=QuestionResponse)
def get_question_api(db: Session = Depends(get_db)):
    print(get_question_in_db(db, rd.randint(1, 8)))
    body, answer, other_answer = get_question_in_db(db, rd.randint(1, 8))

    return QuestionResponse(body=body, answer=answer, other_answers=other_answer)


# question_test = Quastions(topic="test_topic", body="test_body", answer="test_answer")
# add_question_from_db(Session, question_test)

# print(get_question(Session, 2))

'''
mas = get_question(Session, rd.randint(1, 2))

a = input(f"{mas[0]} {mas[2]}: ")
if a == mas[1]:
    print("Right!")

else:
    print("No (")
'''

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
