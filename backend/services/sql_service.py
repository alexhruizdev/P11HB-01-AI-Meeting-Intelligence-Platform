from sqlalchemy import text
from database import engine


def get_decisions():
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT
                d.decision_id,
                d.decision_text,
                d.estado,
                m.meeting_id,
                m.meeting_number,
                m.meeting_group,
                m.fecha_reunion
            FROM meeting_decisions d
            JOIN meetings m ON m.meeting_id = d.meeting_id
            ORDER BY d.decision_id DESC;
        """))
        return [dict(row._mapping) for row in result]


def get_risks():
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT
                r.risk_id,
                r.risk_text,
                r.estado,
                m.meeting_id,
                m.meeting_number,
                m.meeting_group,
                m.fecha_reunion
            FROM meeting_risks r
            JOIN meetings m ON m.meeting_id = r.meeting_id
            ORDER BY r.risk_id DESC;
        """))
        return [dict(row._mapping) for row in result]


def get_topics():
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT
                t.topic_id,
                t.topic_text,
                m.meeting_id,
                m.meeting_number,
                m.meeting_group,
                m.fecha_reunion
            FROM meeting_topics t
            JOIN meetings m ON m.meeting_id = t.meeting_id
            ORDER BY t.topic_id DESC;
        """))
        return [dict(row._mapping) for row in result]


def get_meetings():
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT
                m.meeting_id,
                m.titulo,
                m.fecha_reunion,
                m.resumen,
                m.proxima_reunion,
                m.estado,
                m.meeting_group,
                m.meeting_number,
                m.created_at,
                COUNT(t.task_id) FILTER (WHERE t.estado = 'PENDIENTE')   AS pending_count,
                COUNT(t.task_id)                                           AS total_tasks,
                COUNT(t.task_id) FILTER (WHERE t.estado = 'COMPLETADA')  AS completed_tasks
            FROM meetings m
            LEFT JOIN tasks t ON t.meeting_id = m.meeting_id
            GROUP BY m.meeting_id
            ORDER BY m.meeting_id DESC;
        """))
        return [dict(row._mapping) for row in result]


def get_dashboard():
    with engine.connect() as conn:

        total_tasks = conn.execute(
            text("SELECT COUNT(*) FROM tasks")
        ).scalar()

        completed = conn.execute(
            text("SELECT COUNT(*) FROM tasks WHERE estado='COMPLETADA'")
        ).scalar()

        total_risks = conn.execute(
            text("SELECT COUNT(*) FROM meeting_risks")
        ).scalar()

        mitigated = conn.execute(
            text("SELECT COUNT(*) FROM meeting_risks WHERE estado='MITIGADO'")
        ).scalar()

        total_decisions = conn.execute(
            text("SELECT COUNT(*) FROM meeting_decisions")
        ).scalar()

        executed = conn.execute(
            text("SELECT COUNT(*) FROM meeting_decisions WHERE estado='EJECUTADA'")
        ).scalar()

        return {
            "meetings": conn.execute(
                text("SELECT COUNT(*) FROM meetings")
            ).scalar(),
            "tasks": total_tasks,
            "pending": total_tasks - completed,
            "completed": completed,
            "completion_percent": round((completed / total_tasks) * 100, 1) if total_tasks else 0,
            "risks": total_risks,
            "mitigated": mitigated,
            "open_risks": total_risks - mitigated,
            "risk_mitigation_percent": round((mitigated / total_risks) * 100, 1) if total_risks else 0,
            "decisions": total_decisions,
            "executed": executed,
            "pending_decisions": total_decisions - executed,
            "decision_execution_percent": round((executed / total_decisions) * 100, 1) if total_decisions else 0,
            "high_priority": conn.execute(
                text("SELECT COUNT(*) FROM tasks WHERE prioridad='ALTA'")
            ).scalar(),
            "topics": conn.execute(
                text("SELECT COUNT(*) FROM meeting_topics")
            ).scalar()
        }


def get_dashboard_charts():
    with engine.connect() as conn:

        return {

            "meeting_summary": {
                "total": conn.execute(
                    text("SELECT COUNT(*) FROM meetings")
                ).scalar(),
                "active_groups": conn.execute(
                    text("SELECT COUNT(DISTINCT meeting_group) FROM meetings")
                ).scalar(),
                "programmed": conn.execute(
                    text("SELECT COUNT(*) FROM meetings WHERE estado='PROGRAMADA'")
                ).scalar(),
                "cancelled": conn.execute(
                    text("SELECT COUNT(*) FROM meetings WHERE estado='CANCELADA'")
                ).scalar(),
            },

            "tasks_by_status": [
                dict(row._mapping)
                for row in conn.execute(text("""
                    SELECT estado, COUNT(*) cantidad
                    FROM tasks
                    GROUP BY estado
                    ORDER BY estado;
                """))
            ],

            "meetings_by_group": [
                dict(row._mapping)
                for row in conn.execute(text("""
                    SELECT meeting_group, COUNT(*) cantidad
                    FROM meetings
                    GROUP BY meeting_group
                    ORDER BY cantidad DESC;
                """))
            ],

            "tasks_trend": [
                dict(row._mapping)
                for row in conn.execute(text("""
                    SELECT
                        m.meeting_id,
                        CONCAT('R', COALESCE(m.meeting_number::text, m.meeting_id::text)) AS reunion,
                        COUNT(t.task_id) FILTER (WHERE t.estado = 'COMPLETADA') AS realizadas,
                        COUNT(t.task_id) FILTER (WHERE t.estado = 'PENDIENTE')  AS pendientes
                    FROM meetings m
                    LEFT JOIN tasks t ON t.meeting_id = m.meeting_id
                    GROUP BY m.meeting_id, m.meeting_number
                    ORDER BY m.meeting_id;
                """))
            ],

            "risks_trend": [
                dict(row._mapping)
                for row in conn.execute(text("""
                    SELECT
                        m.meeting_id,
                        CONCAT('R', COALESCE(m.meeting_number::text, m.meeting_id::text)) AS reunion,
                        COUNT(r.risk_id) FILTER (WHERE r.estado = 'ACTIVO')    AS abiertos,
                        COUNT(r.risk_id) FILTER (WHERE r.estado = 'MITIGADO')  AS mitigados
                    FROM meetings m
                    LEFT JOIN meeting_risks r ON r.meeting_id = m.meeting_id
                    GROUP BY m.meeting_id, m.meeting_number
                    ORDER BY m.meeting_id;
                """))
            ]
        }