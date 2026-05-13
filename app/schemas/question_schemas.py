from pydantic import BaseModel


class QuestionResponse(BaseModel):
    body: str
    answer: str
    other_answers: list[str]
    
    class Config:
        from_attributes = True


class QuestionCreate(BaseModel):
    topic: str
    body: str
    answer: str
    model_config = {"from_attributes": True}
