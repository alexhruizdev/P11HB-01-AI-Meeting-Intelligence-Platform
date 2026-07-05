import { useState } from "react";
import { FaShieldAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const PAGE_SIZE = 5;

const ESTADO_STYLE = {
  MITIGADO: "bg-green-100 text-green-700 border border-green-200",
  ACTIVO: "bg-red-100 text-red-700 border border-red-200",
};

export default function RiskList({ risks }) {
  const [page, setPage] = useState(0);
  const [comite, setComite] = useState("todos");

  const comites = [
    "todos",
    ...Array.from(new Set(risks.map((r) => r.meeting_group).filter(Boolean))),
  ];

  const filtered =
    comite === "todos"
      ? risks
      : risks.filter((r) => r.meeting_group === comite);

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 text-white p-2.5 rounded-xl">
            <FaShieldAlt size={16} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Riesgos</h2>
            <p className="text-xs text-slate-500">
              {filtered.length} registros
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap justify-end">
          {comites.map((c) => (
            <button
              key={c}
              onClick={() => handleComite(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                comite === c
                  ? "bg-red-600 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c === "todos" ? "Todos" : c}
            </button>
          ))}
        </div>
      </div>

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
              Riesgo
            </th>
            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((r, index) => (
            <tr
              key={r.risk_id}
              className="border-b border-slate-100 hover:bg-red-50/40 transition-colors"
            >
              <td className="py-3 text-sm text-slate-400 font-medium">
                {page * PAGE_SIZE + index + 1}
              </td>
              <td className="py-3 text-sm text-slate-600">
                {r.meeting_group ?? "-"}
              </td>
              <td className="py-3 text-sm text-slate-500">
                {r.fecha_reunion
                  ? new Date(r.fecha_reunion).toLocaleDateString("es-CO")
                  : "-"}
              </td>
              <td className="py-3">
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                  R{r.meeting_number ?? r.meeting_id}
                </span>
              </td>
              <td className="py-3 text-sm text-slate-700">{r.risk_text}</td>
              <td className="py-3">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${ESTADO_STYLE[r.estado] ?? "bg-slate-100 text-slate-500"}`}
                >
                  {r.estado ?? "ACTIVO"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Siguiente <FaChevronRight size={10} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
