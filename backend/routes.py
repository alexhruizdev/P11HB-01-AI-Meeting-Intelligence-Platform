from fastapi import APIRouter
from sqlalchemy import text
from database import engine
from services.sql_service import (
    get_meetings,
    get_dashboard,
    get_dashboard_charts,
    get_decisions,
    get_risks,
    get_topics
)

router = APIRouter()


@router.get("/meetings")
def meetings():
    return get_meetings()


@router.get("/dashboard")
def dashboard():
    return get_dashboard()


@router.get("/dashboard/charts")
def dashboard_charts():
    return get_dashboard_charts()


@router.get("/decisions")
def decisions():
    return get_decisions()


@router.get("/risks")
def risks():
    return get_risks()


@router.get("/topics")
def topics():
    return get_topics()


@router.get("/meeting/{meeting_id}")
def get_meeting_detail(meeting_id: int):

    with engine.connect() as conn:

        meeting = conn.execute(text("""
            SELECT *
            FROM meetings
            WHERE meeting_id = :meeting_id
        """), {"meeting_id": meeting_id}).mappings().first()

        if not meeting:
            return {"meeting": None, "tasks": [], "decisions": [],
                    "risks": [], "topics": [], "restricted": False}

        estado = (meeting.get("estado") or "").upper()
        is_realizada = estado == "REALIZADA"

# Temas a tratar: siempre disponibles (agenda futura o realizada)
        topics = conn.execute(text("""
            SELECT
                t.*,
                m.meeting_group,
                m.fecha_reunion,
                m.meeting_number
            FROM meeting_topics t
            JOIN meetings m ON m.meeting_id = t.meeting_id
            WHERE t.meeting_id = :meeting_id
            ORDER BY t.topic_number
        """), {"meeting_id": meeting_id}).mappings().all()

        # Tareas, decisiones y riesgos: solo si la reunión fue REALIZADA
        if is_realizada:
            tasks = conn.execute(text("""
                SELECT *
                FROM tasks
                WHERE meeting_id = :meeting_id
                ORDER BY task_id
            """), {"meeting_id": meeting_id}).mappings().all()

            decisions = conn.execute(text("""
                SELECT
                    d.*,
                    m.meeting_group,
                    m.fecha_reunion,
                    m.meeting_number
                FROM meeting_decisions d
                JOIN meetings m ON m.meeting_id = d.meeting_id
                WHERE d.meeting_id = :meeting_id
                ORDER BY d.decision_number
            """), {"meeting_id": meeting_id}).mappings().all()

            risks = conn.execute(text("""
                SELECT
                    r.*,
                    m.meeting_group,
                    m.fecha_reunion,
                    m.meeting_number
                FROM meeting_risks r
                JOIN meetings m ON m.meeting_id = r.meeting_id
                WHERE r.meeting_id = :meeting_id
                ORDER BY r.risk_number
            """), {"meeting_id": meeting_id}).mappings().all()

        else:
            tasks = []
            decisions = []
            risks = []

    return {
        "meeting": meeting,
        "restricted": not is_realizada,
        "tasks": tasks,
        "decisions": decisions,
        "risks": risks,
        "topics": topics
    }


@router.get("/meetings/group/{group_name}")
def get_meetings_by_group(group_name: str):
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT *
            FROM meetings
            WHERE meeting_group = :group_name
            ORDER BY meeting_number DESC;
        """), {"group_name": group_name})
        return [dict(row._mapping) for row in result]


@router.get("/meeting/{meeting_id}/dashboard")
def meeting_dashboard(meeting_id: int):
    with engine.connect() as conn:

        estado = conn.execute(text("""
            SELECT estado FROM meetings WHERE meeting_id = :id
        """), {"id": meeting_id}).scalar()

        is_realizada = (estado or "").upper() == "REALIZADA"

        total_tasks = conn.execute(text("""
            SELECT COUNT(*) FROM tasks WHERE meeting_id = :id
        """), {"id": meeting_id}).scalar() if is_realizada else 0

        completed = conn.execute(text("""
            SELECT COUNT(*) FROM tasks
            WHERE meeting_id = :id AND estado = 'COMPLETADA'
        """), {"id": meeting_id}).scalar() if is_realizada else 0

        pending_tasks = conn.execute(text("""
            SELECT COUNT(*) FROM tasks
            WHERE meeting_id = :id AND estado = 'PENDIENTE'
        """), {"id": meeting_id}).scalar() if is_realizada else 0

        high_priority = conn.execute(text("""
            SELECT COUNT(*) FROM tasks
            WHERE meeting_id = :id AND prioridad = 'ALTA'
        """), {"id": meeting_id}).scalar() if is_realizada else 0

        total_decisions = conn.execute(text("""
            SELECT COUNT(*) FROM meeting_decisions WHERE meeting_id = :id
        """), {"id": meeting_id}).scalar() if is_realizada else 0

        executed_decisions = conn.execute(text("""
            SELECT COUNT(*) FROM meeting_decisions
            WHERE meeting_id = :id AND estado = 'EJECUTADA'
        """), {"id": meeting_id}).scalar() if is_realizada else 0

        total_risks = conn.execute(text("""
            SELECT COUNT(*) FROM meeting_risks WHERE meeting_id = :id
        """), {"id": meeting_id}).scalar() if is_realizada else 0

        mitigated_risks = conn.execute(text("""
            SELECT COUNT(*) FROM meeting_risks
            WHERE meeting_id = :id AND estado = 'MITIGADO'
        """), {"id": meeting_id}).scalar() if is_realizada else 0

        return {
            "estado": estado,
            "restricted": not is_realizada,
            "tasks": total_tasks,
            "completed": completed,
            "pending_tasks": pending_tasks,
            "high_priority": high_priority,
            "completion_percent": round((completed / total_tasks) * 100, 1) if total_tasks else 0,
            "decisions": total_decisions,
            "executed_decisions": executed_decisions,
            "pending_decisions": total_decisions - executed_decisions,
            "risks": total_risks,
            "mitigated_risks": mitigated_risks,
            "open_risks": total_risks - mitigated_risks,
        }