import { useState } from "react";
import { FaListUl, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const PAGE_SIZE = 5;

export default function TopicList({ topics, title = "Próximos Temas" }) {
  const [page, setPage] = useState(0);
  const [comite, setComite] = useState("todos");

  const comites = [
    "todos",
    ...Array.from(new Set(topics.map((t) => t.meeting_group).filter(Boolean))),
  ];

  const filtered =
    comite === "todos"
      ? topics
      : topics.filter((t) => t.meeting_group === comite);

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
          <div className="bg-emerald-600 text-white p-2.5 rounded-xl">
            <FaListUl size={16} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
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
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c === "todos" ? "Todos" : c}
            </button>
          ))}
        </div>
      </div>

      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: "3%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "59%" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              #
            </th>
            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Grupo / Comité
            </th>
            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Reunión
            </th>
            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tema
            </th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((t, index) => (
            <tr
              key={t.topic_id}
              className="border-b border-slate-100 hover:bg-emerald-50/40 transition-colors"
            >
              <td className="py-3 text-sm text-slate-400 font-medium">
                {page * PAGE_SIZE + index + 1}
              </td>
              <td className="py-3 text-sm text-slate-600 truncate pr-2">
                {t.meeting_group ?? "-"}
              </td>
              <td className="py-3 text-sm text-slate-500 pr-2">
                {t.fecha_reunion
                  ? new Date(t.fecha_reunion).toLocaleDateString("es-CO")
                  : "-"}
              </td>
              <td className="py-3">
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
                  R{t.meeting_number ?? t.meeting_id}
                </span>
              </td>
              <td className="py-3 text-sm text-slate-700 break-words leading-relaxed">
                {t.topic_text}
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Siguiente <FaChevronRight size={10} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
