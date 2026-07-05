import { FaCalendarAlt, FaTasks, FaShieldAlt, FaGavel } from "react-icons/fa";

export default function DashboardCards({ dashboard, scope = "general" }) {
  const cards = [
    ...(scope === "general"
      ? [
          {
            title: "REUNIONES",
            value: dashboard.meetings ?? 0,
            icon: <FaCalendarAlt size={26} />,
            color: "bg-blue-600",
            bg: "from-blue-50 to-white",
          },
        ]
      : []),

    {
      title: "TAREAS",
      value: dashboard.tasks ?? 0,
      icon: <FaTasks size={26} />,
      color: "bg-green-600",
      bg: "from-green-50 to-white",
    },

    {
      title: "RIESGOS",
      value: dashboard.risks ?? 0,
      icon: <FaShieldAlt size={26} />,
      color: "bg-red-600",
      bg: "from-red-50 to-white",
    },

    {
      title: "DECISIONES",
      value: dashboard.decisions ?? 0,
      icon: <FaGavel size={26} />,
      color: "bg-violet-600",
      bg: "from-violet-50 to-white",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`bg-gradient-to-br ${card.bg} rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-all`}
        >
          <div className="p-5">
            <div className="flex items-center gap-4">
              <div className={`${card.color} text-white p-4 rounded-xl shadow`}>
                {card.icon}
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest font-semibold text-slate-500">
                  {card.title}
                </p>

                <h2 className="text-4xl font-bold leading-none mt-2">
                  {card.value}
                </h2>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-500">
                Total {card.title.toLowerCase()}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
