import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const PAGE_SIZE = 5;

const ESTADO_STYLE = {
  REALIZADA: "bg-green-100 text-green-700 border border-green-200",
  PROGRAMADA: "bg-orange-100 text-orange-700 border border-orange-200",
  CANCELADA: "bg-red-100 text-red-700 border border-red-200",
  ABIERTA: "bg-blue-100 text-blue-700 border border-blue-200",
};

export default function MeetingTable({ meetings }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [filterPending, setFilterPending] = useState("todas");
  const [comite, setComite] = useState("todos");

  const comites = [
    "todos",
    ...Array.from(
      new Set(meetings.map((m) => m.meeting_group).filter(Boolean)),
    ),
  ];

  const filtered = meetings
    .filter((m) => comite === "todos" || m.meeting_group === comite)
    .filter((m) => {
      if (filterPending === "pendientes") return (m.pending_count ?? 0) > 0;
      if (filterPending === "ok") return (m.pending_count ?? 0) === 0;
      return true;
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE,
  );

  const handleComite = (c) => {
    setComite(c);
    setPage(0);
  };
  const handlePending = (f) => {
    setFilterPending(f);
    setPage(0);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 mb-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl">
            <FaCalendarAlt size={16} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Reuniones</h2>
            <p className="text-xs text-slate-500">
              {filtered.length} registros
            </p>
          </div>
        </div>

        {/* Filtro pendientes */}
        <div className="flex gap-2">
          {["todas", "pendientes", "ok"].map((f) => (
            <button
              key={f}
              onClick={() => handlePending(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterPending === f
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f === "todas"
                ? "Todas"
                : f === "pendientes"
                  ? "Con pendientes"
                  : "Sin pendientes"}
            </button>
          ))}
        </div>
      </div>

      {/* Filtro por comité */}
      <div className="flex gap-2 flex-wrap mb-4">
        {comites.map((c) => (
          <button
            key={c}
            onClick={() => handleComite(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              comite === c
                ? "bg-slate-700 text-white shadow"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {c === "todos" ? "Todos los comités" : c}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Grupo / Comité
            </th>
            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Título
            </th>
            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tareas Pendientes
            </th>
            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Progreso Tareas
            </th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((meeting) => {
            const pending = meeting.pending_count ?? 0;
            const total = meeting.total_tasks ?? 0;
            const completed = meeting.completed_tasks ?? 0;
            const progress =
              total > 0 ? Math.round((completed / total) * 100) : 0;
            const estado = meeting.estado ?? "ABIERTA";

            return (
              <tr
                key={meeting.meeting_id}
                onClick={() => navigate(`/meeting/${meeting.meeting_id}`)}
                className="border-b border-slate-100 hover:bg-blue-50/50 cursor-pointer transition-colors"
              >
                <td className="py-3 text-sm text-slate-600">
                  {meeting.meeting_group ?? "-"}
                </td>

                <td className="py-3 text-sm font-medium text-slate-800 max-w-xs truncate">
                  {meeting.titulo}
                </td>

                <td className="py-3 text-sm text-slate-500">
                  {meeting.fecha_reunion
                    ? new Date(meeting.fecha_reunion).toLocaleDateString(
                        "es-CO",
                      )
                    : "-"}
                </td>
                <td className="py-3">
                  {pending > 0 ? (
                    <span className="bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full">
                      {pending} pendientes
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-700 border border-green-200 text-xs font-bold px-3 py-1 rounded-full">
                      Sin pendientes
                    </span>
                  )}
                </td>
                <td className="py-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${ESTADO_STYLE[estado] ?? "bg-slate-100 text-slate-600"}`}
                  >
                    {estado}
                  </span>
                </td>
                <td className="py-3 w-48">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-green-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-green-600 w-9 text-right">
                        {progress}%
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {completed}/{total} tareas completadas
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-500">
          Página {page + 1} de {Math.max(totalPages, 1)}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <FaChevronLeft size={10} /> Anterior
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Siguiente <FaChevronRight size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}
