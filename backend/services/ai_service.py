import requests
from sqlalchemy import text
from database import engine

OLLAMA_URL   = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "llama3.2:latest"


def _call_ollama(system_prompt: str, user_question: str) -> str:
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model":  OLLAMA_MODEL,
                "stream": False,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_question}
                ],
                "options": {"num_predict": 512}
            },
            timeout=180
        )
        response.raise_for_status()
        return response.json()["message"]["content"]
    except requests.exceptions.ConnectionError:
        return "⚠️ No se puede conectar con Ollama. Verifica que esté corriendo en http://localhost:11434"
    except requests.exceptions.Timeout:
        return "⚠️ Ollama tardó demasiado. Intenta una pregunta más específica."
    except Exception as e:
        return f"⚠️ Error: {str(e)}"


def _get_global_context() -> str:
    with engine.connect() as conn:

# Conteos exactos por comité — subqueries independientes para evitar producto cartesiano
        committee_stats = conn.execute(text("""
            SELECT
                m.meeting_group AS comite,
                COUNT(DISTINCT m.meeting_id) AS reuniones,
                (SELECT COUNT(*) FROM tasks t
                 JOIN meetings m2 ON m2.meeting_id = t.meeting_id
                 WHERE m2.meeting_group = m.meeting_group) AS tareas_total,
                (SELECT COUNT(*) FROM tasks t
                 JOIN meetings m2 ON m2.meeting_id = t.meeting_id
                 WHERE m2.meeting_group = m.meeting_group AND t.estado = 'PENDIENTE') AS tareas_pendientes,
                (SELECT COUNT(*) FROM tasks t
                 JOIN meetings m2 ON m2.meeting_id = t.meeting_id
                 WHERE m2.meeting_group = m.meeting_group AND t.estado = 'COMPLETADA') AS tareas_completadas,
                (SELECT COUNT(*) FROM meeting_risks r
                 JOIN meetings m2 ON m2.meeting_id = r.meeting_id
                 WHERE m2.meeting_group = m.meeting_group) AS riesgos_total,
                (SELECT COUNT(*) FROM meeting_risks r
                 JOIN meetings m2 ON m2.meeting_id = r.meeting_id
                 WHERE m2.meeting_group = m.meeting_group AND r.estado = 'ACTIVO') AS riesgos_activos,
                (SELECT COUNT(*) FROM meeting_risks r
                 JOIN meetings m2 ON m2.meeting_id = r.meeting_id
                 WHERE m2.meeting_group = m.meeting_group AND r.estado = 'MITIGADO') AS riesgos_mitigados,
                (SELECT COUNT(*) FROM meeting_decisions d
                 JOIN meetings m2 ON m2.meeting_id = d.meeting_id
                 WHERE m2.meeting_group = m.meeting_group) AS decisiones_total,
                (SELECT COUNT(*) FROM meeting_decisions d
                 JOIN meetings m2 ON m2.meeting_id = d.meeting_id
                 WHERE m2.meeting_group = m.meeting_group AND d.estado = 'EJECUTADA') AS decisiones_ejecutadas,
                (SELECT COUNT(*) FROM meeting_decisions d
                 JOIN meetings m2 ON m2.meeting_id = d.meeting_id
                 WHERE m2.meeting_group = m.meeting_group AND d.estado != 'EJECUTADA') AS decisiones_pendientes
            FROM meetings m
            GROUP BY m.meeting_group
            ORDER BY m.meeting_group;
        """)).mappings().all()

        # Totales globales
        totals = conn.execute(text("""
            SELECT
                (SELECT COUNT(*) FROM meetings)                                         AS reuniones,
                (SELECT COUNT(*) FROM tasks WHERE estado = 'PENDIENTE')                AS tareas_pendientes,
                (SELECT COUNT(*) FROM tasks WHERE estado = 'COMPLETADA')               AS tareas_completadas,
                (SELECT COUNT(*) FROM meeting_risks WHERE estado = 'ACTIVO')           AS riesgos_activos,
                (SELECT COUNT(*) FROM meeting_risks WHERE estado = 'MITIGADO')         AS riesgos_mitigados,
                (SELECT COUNT(*) FROM meeting_decisions WHERE estado = 'EJECUTADA')    AS decisiones_ejecutadas,
                (SELECT COUNT(*) FROM meeting_decisions WHERE estado != 'EJECUTADA')   AS decisiones_pendientes;
        """)).mappings().first()

        # Tareas pendientes con responsable y prioridad
        pending_tasks = conn.execute(text("""
            SELECT t.descripcion, t.responsable, t.prioridad, m.meeting_group
            FROM tasks t
            JOIN meetings m ON m.meeting_id = t.meeting_id
            WHERE t.estado = 'PENDIENTE'
            ORDER BY t.prioridad DESC, m.meeting_group
            LIMIT 20;
        """)).mappings().all()

        # Riesgos activos
        active_risks = conn.execute(text("""
            SELECT r.risk_text, m.meeting_group
            FROM meeting_risks r
            JOIN meetings m ON m.meeting_id = r.meeting_id
            WHERE r.estado = 'ACTIVO'
            LIMIT 15;
        """)).mappings().all()

        # Construcción del contexto
        stats_text = "\n".join([
            f"- {s['comite']}: {s['reuniones']} reuniones | "
            f"Tareas: {s['tareas_pendientes']} pendientes / {s['tareas_completadas']} completadas | "
            f"Riesgos: {s['riesgos_activos']} activos / {s['riesgos_mitigados']} mitigados | "
            f"Decisiones: {s['decisiones_ejecutadas']} ejecutadas / {s['decisiones_pendientes']} pendientes"
            for s in committee_stats
        ])

        tasks_text = "\n".join([
            f"- [{t['meeting_group']}] {t['descripcion']} | Responsable: {t['responsable']} | Prioridad: {t['prioridad']}"
            for t in pending_tasks
        ]) or "Sin tareas pendientes."

        risks_text = "\n".join([
            f"- [{r['meeting_group']}] {r['risk_text']}"
            for r in active_risks
        ]) or "Sin riesgos activos."

        return f"""RESUMEN GLOBAL EXACTO (datos directos de base de datos):
Total reuniones: {totals['reuniones']}
Tareas pendientes: {totals['tareas_pendientes']} | Tareas completadas: {totals['tareas_completadas']}
Riesgos activos: {totals['riesgos_activos']} | Riesgos mitigados: {totals['riesgos_mitigados']}
Decisiones ejecutadas: {totals['decisiones_ejecutadas']} | Decisiones pendientes: {totals['decisiones_pendientes']}

ESTADÍSTICAS EXACTAS POR COMITÉ:
{stats_text}

TAREAS PENDIENTES (con responsable):
{tasks_text}

RIESGOS ACTIVOS:
{risks_text}"""


def _get_meeting_context(meeting_id: int) -> str:
    with engine.connect() as conn:

        meeting = conn.execute(text("""
            SELECT titulo, meeting_group, fecha_reunion, estado, resumen
            FROM meetings WHERE meeting_id = :id
        """), {"id": meeting_id}).mappings().first()

        if not meeting:
            return "No se encontró información de esta reunión."

        stats = conn.execute(text("""
            SELECT
                COUNT(t.task_id)                                                AS tareas_total,
                COUNT(t.task_id) FILTER (WHERE t.estado = 'PENDIENTE')         AS tareas_pendientes,
                COUNT(t.task_id) FILTER (WHERE t.estado = 'COMPLETADA')        AS tareas_completadas,
                COUNT(r.risk_id)                                                AS riesgos_total,
                COUNT(r.risk_id) FILTER (WHERE r.estado = 'ACTIVO')            AS riesgos_activos,
                COUNT(r.risk_id) FILTER (WHERE r.estado = 'MITIGADO')          AS riesgos_mitigados,
                COUNT(d.decision_id)                                            AS decisiones_total,
                COUNT(d.decision_id) FILTER (WHERE d.estado = 'EJECUTADA')     AS decisiones_ejecutadas
            FROM meetings m
            LEFT JOIN tasks t             ON t.meeting_id = m.meeting_id
            LEFT JOIN meeting_risks r     ON r.meeting_id = m.meeting_id
            LEFT JOIN meeting_decisions d ON d.meeting_id = m.meeting_id
            WHERE m.meeting_id = :id
        """), {"id": meeting_id}).mappings().first()

        tasks = conn.execute(text("""
            SELECT descripcion, responsable, prioridad, estado
            FROM tasks WHERE meeting_id = :id ORDER BY task_id LIMIT 10
        """), {"id": meeting_id}).mappings().all()

        risks = conn.execute(text("""
            SELECT risk_text, estado
            FROM meeting_risks WHERE meeting_id = :id LIMIT 10
        """), {"id": meeting_id}).mappings().all()

        decisions = conn.execute(text("""
            SELECT decision_text, estado
            FROM meeting_decisions WHERE meeting_id = :id LIMIT 10
        """), {"id": meeting_id}).mappings().all()

        tasks_text = "\n".join([
            f"- {t['descripcion']} | {t['responsable']} | {t['prioridad']} | {t['estado']}"
            for t in tasks
        ]) or "Sin tareas."

        risks_text = "\n".join([
            f"- {r['risk_text']} | {r['estado']}"
            for r in risks
        ]) or "Sin riesgos."

        decisions_text = "\n".join([
            f"- {d['decision_text']} | {d['estado']}"
            for d in decisions
        ]) or "Sin decisiones."

        return f"""REUNIÓN: {meeting['titulo']} | {meeting['meeting_group']} | {meeting['estado']}
RESUMEN: {meeting['resumen']}

CONTEOS EXACTOS DE ESTA REUNIÓN:
Tareas: {stats['tareas_total']} total | {stats['tareas_pendientes']} pendientes | {stats['tareas_completadas']} completadas
Riesgos: {stats['riesgos_total']} total | {stats['riesgos_activos']} activos | {stats['riesgos_mitigados']} mitigados
Decisiones: {stats['decisiones_total']} total | {stats['decisiones_ejecutadas']} ejecutadas

DETALLE TAREAS:
{tasks_text}

DETALLE RIESGOS:
{risks_text}

DETALLE DECISIONES:
{decisions_text}"""


def answer_question(question: str, meeting_id: int | None = None) -> str:

    if meeting_id is None:
        context = _get_global_context()
        system_prompt = f"""Eres un asistente ejecutivo de reuniones corporativas. Responde en español, directo y preciso.
IMPORTANTE: Usa ÚNICAMENTE los números exactos del contexto. No estimes ni calcules — los datos ya están calculados.
Si preguntan por tareas de un comité, usa los conteos de "ESTADÍSTICAS EXACTAS POR COMITÉ".
Si preguntan por responsables, usa "TAREAS PENDIENTES".

DATOS DEL SISTEMA:
{context}"""
    else:
        context = _get_meeting_context(meeting_id)
        system_prompt = f"""Eres un asistente ejecutivo de UNA reunión específica. Responde en español, directo y preciso.
IMPORTANTE: Usa ÚNICAMENTE los números exactos del contexto. No estimes ni calcules.
Si preguntan algo de otra reunión responde: "Para esa consulta usa el Chat del Dashboard general."

DATOS DE ESTA REUNIÓN:
{context}"""

    return _call_ollama(system_prompt, question)