from fastapi import APIRouter
from services.ai_service import answer_question

router = APIRouter()


@router.post("/chat")
def chat(data: dict):

    question   = data.get("question", "")
    meeting_id = data.get("meeting_id", None)

    if meeting_id is not None:
        try:
            meeting_id = int(meeting_id)
        except (ValueError, TypeError):
            meeting_id = None

    return {
        "question":   question,
        "meeting_id": meeting_id,
        "answer":     answer_question(question, meeting_id)
    }