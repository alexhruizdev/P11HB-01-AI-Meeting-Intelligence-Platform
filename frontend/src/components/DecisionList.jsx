import { useState } from "react";
import { FaGavel, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const PAGE_SIZE = 5;

const ESTADO_STYLE = {
  EJECUTADA: "bg-green-100 text-green-700 border border-green-200",
  PENDIENTE: "bg-amber-100 text-amber-700 border border-amber-200",
};

export default function DecisionList({ decisions }) {
  const [page, setPage] = useState(0);
  const [comite, setComite] = useState("todos");

  const comites = [
    "todos",
    ...Array.from(
      new Set(decisions.map((d) => d.meeting_group).filter(Boolean)),
    ),
  ];

  const filtered =
    comite === "todos"
      ? decisions
      : decisions.filter((d) => d.meeting_group === comite);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE,
  );

  const handleComite = (c) => {
    setComite(c);
    setPage(0);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 mt-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl">
            <FaGavel size={16} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Decisiones</h2>
            <p className="text-xs text-slate-500">
              {filtered.length} registros
            </p>
          </div>
        </div>

        {/* Filtro por comité */}
        <div className="flex gap-2 flex-wrap justify-end">
          {comites.map((c) => (
            <button
              key={c}
              onClick={() => handleComite(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                comite === c
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c === "todos" ? "Todos" : c}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider w-8">
              #
            </th>
            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Grupo / Comité
            </th>
            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">
              Reunión
            </th>
            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Decisión
            </th>
            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((d, index) => (
            <tr
              key={d.decision_id}
              className="border-b border-slate-100 hover:bg-indigo-50/40 transition-colors"
            >
              <td className="py-3 text-sm text-slate-400 font-medium">
                {page * PAGE_SIZE + index + 1}
              </td>
              <td className="py-3 text-sm text-slate-600">
                {d.meeting_group ?? "-"}
              </td>
              <td className="py-3 text-sm text-slate-500">
                {d.fecha_reunion
                  ? new Date(d.fecha_reunion).toLocaleDateString("es-CO")
                  : "-"}
              </td>
              <td className="py-3">
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                  R{d.meeting_number ?? d.meeting_id}
                </span>
              </td>
              <td className="py-3 text-sm text-slate-700">{d.decision_text}</td>
              <td className="py-3">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${ESTADO_STYLE[d.estado] ?? "bg-slate-100 text-slate-500"}`}
                >
                  {d.estado ?? "PENDIENTE"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Página {page + 1} de {totalPages}
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Siguiente <FaChevronRight size={10} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
