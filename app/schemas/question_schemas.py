from pydantic import BaseModel, ConfigDict


class _BaseQuestionResponse(BaseModel):
    model_config = ConfigDict(
        strict=True,
        extra='ignore',
        validate_default=True,
        validate_assignment=True,
        frozen=False,
        populate_by_name=True,
    )

    body: str
    answer: str


class QuestionResponse(_BaseQuestionResponse):
    other_answers: list[str]


class QuestionCreate(_BaseQuestionResponse):
    category: str
    topic: str
