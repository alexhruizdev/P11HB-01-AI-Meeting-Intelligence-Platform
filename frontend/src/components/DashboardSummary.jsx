import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6"];

function SummaryCard({ title, total, centerLabel, data }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-3">
      <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>

      <div className="grid grid-cols-[170px_1fr] gap-4 items-center">
        <div className="h-40 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={62}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color || COLORS[index]} />
                ))}
              </Pie>

              <text
                x="50%"
                y="47%"
                textAnchor="middle"
                className="fill-slate-900 text-3xl font-bold"
              >
                {total}
              </text>

              <text
                x="50%"
                y="60%"
                textAnchor="middle"
                className="fill-slate-500 text-sm"
              >
                {centerLabel}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col justify-center space-y-1.5">
          {data.map((item, index) => {
            const percent = total ? ((item.value / total) * 100).toFixed(1) : 0;

            return (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        background: item.color || COLORS[index],
                      }}
                    />

                    <span className="text-sm font-medium text-slate-700">
                      {item.name}
                    </span>
                  </div>

                  <span className="text-xl font-bold">{item.value}</span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${percent}%`,
                      background: item.color || COLORS[index],
                    }}
                  />
                </div>

                <div className="text-right text-xs text-slate-500 mt-1">
                  {percent}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DashboardSummary({ dashboard, charts }) {
  const meetingData = [
    {
      name: "Programadas",
      value: charts?.meeting_summary?.programmed ?? 0,
      color: "#2563eb",
    },
    {
      name: "Realizadas",
      value:
        (charts?.meeting_summary?.total ?? 0) -
        (charts?.meeting_summary?.programmed ?? 0) -
        (charts?.meeting_summary?.cancelled ?? 0),
      color: "#22c55e",
    },
    {
      name: "Canceladas",
      value: charts?.meeting_summary?.cancelled ?? 0,
      color: "#ef4444",
    },
  ];

  const meetingTotal = charts?.meeting_summary?.total ?? 0;

  const taskData = [
    {
      name: "Realizadas",
      value: dashboard.completed ?? 0,
      color: "#22c55e",
    },
    {
      name: "Pendientes",
      value: dashboard.pending ?? 0,
      color: "#f59e0b",
    },
  ];

  const openRisks = (dashboard.risks ?? 0) - (dashboard.mitigated ?? 0);

  const riskData = [
    {
      name: "Mitigados",
      value: dashboard.mitigated ?? 0,
      color: "#22c55e",
    },
    {
      name: "Abiertos",
      value: openRisks,
      color: "#ef4444",
    },
  ];

  const decisionData = [
    {
      name: "Ejecutadas",
      value: dashboard.executed ?? 0,
      color: "#22c55e",
    },
    {
      name: "Pendientes",
      value: dashboard.pending_decisions ?? 0,
      color: "#f59e0b",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      <SummaryCard
        title="Resumen de Reuniones"
        total={meetingTotal}
        centerLabel="Reuniones"
        data={meetingData}
      />

      <SummaryCard
        title="Estado de Tareas"
        total={dashboard.tasks ?? 0}
        centerLabel="Tareas"
        data={taskData}
      />

      <SummaryCard
        title="Estado de Riesgos"
        total={dashboard.risks ?? 0}
        centerLabel="Riesgos"
        data={riskData}
      />

      <SummaryCard
        title="Estado de Decisiones"
        total={dashboard.decisions ?? 0}
        centerLabel="Decisiones"
        data={decisionData}
      />
    </div>
  );
}
