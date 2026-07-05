import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  LabelList,
} from "recharts";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
];

const formatXAxis = (meeting_id) => `M${meeting_id}`;

const CustomDot = ({ cx, cy, value, color }) => {
  if (value === undefined || value === null) return null;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#fff"
        stroke={color}
        strokeWidth={2.5}
      />
      <text
        x={cx}
        y={cy - 12}
        textAnchor="middle"
        fontSize={11}
        fontWeight="600"
        fill={color}
      >
        {value}
      </text>
    </g>
  );
};

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-200 p-5">
      <h2 className="text-lg font-semibold text-slate-800 mb-1">{title}</h2>
      <div className="border-t border-slate-100 mb-4" />
      {children}
      <div className="mt-3 text-left">
        <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
          Ver detalle →
        </button>
      </div>
    </div>
  );
}

export default function DashboardCharts({ charts }) {
  if (!charts) return null;

  const tasksTrend = (charts.tasks_trend ?? []).map((d) => ({
    ...d,
    label: `M${d.meeting_id}`,
  }));

  const risksTrend = (charts.risks_trend ?? []).map((d) => ({
    ...d,
    label: `M${d.meeting_id}`,
  }));

  const maxTasks = Math.max(
    ...tasksTrend.map((d) => Math.max(d.realizadas ?? 0, d.pendientes ?? 0)),
    1,
  );

  const maxRisks = Math.max(
    ...risksTrend.map((d) => Math.max(d.abiertos ?? 0, d.mitigados ?? 0)),
    1,
  );

  const maxMeetings = Math.max(
    ...(charts.meetings_by_group ?? []).map((d) => d.cantidad ?? 0),
    1,
  );

  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Gráfica 1 — Tareas por reunión */}
        <ChartCard title="Tareas: Realizadas vs Pendientes">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={tasksTrend}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid vertical={false} stroke="#eef2f7" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={[0, maxTasks + 1]}
                tickCount={maxTasks + 2}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 20px rgba(0,0,0,.08)",
                }}
              />
              <Legend verticalAlign="bottom" height={36} />
              <Line
                type="monotone"
                dataKey="realizadas"
                name="Realizadas"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={(props) => (
                  <CustomDot
                    {...props}
                    color="#16a34a"
                    value={props.payload.realizadas}
                  />
                )}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="pendientes"
                name="Pendientes"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={(props) => (
                  <CustomDot
                    {...props}
                    color="#f59e0b"
                    value={props.payload.pendientes}
                  />
                )}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Gráfica 2 — Riesgos por reunión */}
        <ChartCard title="Riesgos: Abiertos vs Mitigados">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={risksTrend}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid vertical={false} stroke="#eef2f7" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={[0, maxRisks + 1]}
                tickCount={maxRisks + 2}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 20px rgba(0,0,0,.08)",
                }}
              />
              <Legend verticalAlign="bottom" height={36} />
              <Line
                type="monotone"
                dataKey="abiertos"
                name="Abiertos"
                stroke="#dc2626"
                strokeWidth={2.5}
                dot={(props) => (
                  <CustomDot
                    {...props}
                    color="#dc2626"
                    value={props.payload.abiertos}
                  />
                )}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="mitigados"
                name="Mitigados"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={(props) => (
                  <CustomDot
                    {...props}
                    color="#16a34a"
                    value={props.payload.mitigados}
                  />
                )}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Gráfica 3 — Reuniones por comité */}
        <ChartCard title="Reuniones por Comité">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={charts.meetings_by_group}
              margin={{ top: 24, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid vertical={false} stroke="#eef2f7" />
              <XAxis
                dataKey="meeting_group"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={[0, maxMeetings + 1]}
                tickCount={maxMeetings + 2}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 20px rgba(0,0,0,.08)",
                }}
              />
              <Bar dataKey="cantidad" radius={[10, 10, 0, 0]} barSize={48}>
                <LabelList
                  dataKey="cantidad"
                  position="top"
                  style={{ fontSize: 13, fontWeight: "700", fill: "#334155" }}
                />
                {charts.meetings_by_group.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
