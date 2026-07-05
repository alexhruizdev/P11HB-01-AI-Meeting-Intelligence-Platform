import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt, FaBan } from "react-icons/fa";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import TaskList from "../components/TaskList";
import DecisionList from "../components/DecisionList";
import RiskList from "../components/RiskList";
import TopicList from "../components/TopicList";
import AIChat from "../components/AIChat";

import api from "../services/api";

function DonutCard({ title, total, centerLabel, data, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 flex items-center gap-4">
      <div className="w-24 h-24 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={28}
              outerRadius={42}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <text
              x="50%"
              y="45%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: 18, fontWeight: 700, fill: "#1e293b" }}
            >
              {total}
            </text>
            <text
              x="50%"
              y="65%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: 9, fill: "#94a3b8" }}
            >
              {centerLabel}
            </text>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-widest font-semibold text-slate-500 mb-2">
          {title}
        </p>
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: item.color }}
              />
              <span className="text-xs text-slate-600">{item.name}</span>
            </div>
            <span className="text-sm font-bold text-slate-700">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MeetingDashboard() {
  const { id } = useParams();

  const [meeting, setMeeting] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [risks, setRisks] = useState([]);
  const [topics, setTopics] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [restricted, setRestricted] = useState(false);

  useEffect(() => {
    api.get(`/meeting/${id}`).then((res) => {
      setMeeting(res.data.meeting);
      setTasks(res.data.tasks);
      setDecisions(res.data.decisions);
      setRisks(res.data.risks);
      setTopics(res.data.topics);
      setRestricted(res.data.restricted ?? false);
    });

    api.get(`/meeting/${id}/dashboard`).then((res) => setDashboard(res.data));
  }, [id]);

  const estado = meeting?.estado ?? "";
  const isProgamada = estado.toUpperCase() === "PROGRAMADA";
  const isCancelada = estado.toUpperCase() === "CANCELADA";

  const taskData = [
    { name: "Completadas", value: dashboard.completed ?? 0, color: "#16a34a" },
    {
      name: "Pendientes",
      value: dashboard.pending_tasks ?? 0,
      color: "#f59e0b",
    },
  ];

  const riskData = [
    {
      name: "Mitigados",
      value: dashboard.mitigated_risks ?? 0,
      color: "#16a34a",
    },
    { name: "Abiertos", value: dashboard.open_risks ?? 0, color: "#dc2626" },
  ];

  const decisionData = [
    {
      name: "Ejecutadas",
      value: dashboard.executed_decisions ?? 0,
      color: "#16a34a",
    },
    {
      name: "Pendientes",
      value: dashboard.pending_decisions ?? 0,
      color: "#f59e0b",
    },
  ];

  return (
    <div className="flex bg-slate-100">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <div className="max-w-7xl mx-auto p-8">
          {/* Botón volver */}
          <div className="flex justify-end mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 text-slate-700 font-medium px-5 py-2.5 rounded-xl transition-all"
            >
              <FaArrowLeft />
              Volver al Dashboard general
            </Link>
          </div>

          {/* Encabezado de reunión */}
          {meeting && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800">
                Reunión: {meeting.meeting_group ?? "-"}
              </h1>
              <p className="text-slate-500 mt-1">
                {meeting.titulo} ·{" "}
                {meeting.fecha_reunion
                  ? new Date(meeting.fecha_reunion).toLocaleDateString("es-CO")
                  : "-"}
              </p>
            </div>
          )}

          {/* Banner PROGRAMADA */}
          {isProgamada && (
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6">
              <FaCalendarAlt className="text-orange-500 shrink-0" size={22} />
              <div>
                <p className="font-semibold text-orange-700">
                  Reunión programada — aún no realizada
                </p>
                <p className="text-sm text-orange-600 mt-0.5">
                  Los datos de tareas, decisiones y riesgos estarán disponibles
                  una vez que la reunión sea marcada como REALIZADA. A
                  continuación se muestran los temas previstos para esta
                  reunión.
                </p>
              </div>
            </div>
          )}

          {/* Banner CANCELADA */}
          {isCancelada && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
              <FaBan className="text-red-500 shrink-0" size={22} />
              <div>
                <p className="font-semibold text-red-700">Reunión cancelada</p>
                <p className="text-sm text-red-600 mt-0.5">
                  Esta reunión fue cancelada. No se registraron tareas,
                  decisiones ni riesgos. Se muestran únicamente los temas que
                  estaban previstos en la agenda.
                </p>
              </div>
            </div>
          )}

          {/* Resumen ejecutivo */}
          {meeting && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-700 mb-2">
                {restricted
                  ? "Temas previstos para esta reunión:"
                  : "Resumen de la reunión:"}
              </h2>
              <p className="text-slate-700">{meeting.resumen}</p>
            </div>
          )}

          {/* Donuts — solo si REALIZADA */}
          {!restricted && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <DonutCard
                title="Tareas"
                total={dashboard.tasks ?? 0}
                centerLabel="Total"
                data={taskData}
              />
              <DonutCard
                title="Riesgos"
                total={dashboard.risks ?? 0}
                centerLabel="Total"
                data={riskData}
              />
              <DonutCard
                title="Decisiones"
                total={dashboard.decisions ?? 0}
                centerLabel="Total"
                data={decisionData}
              />
            </div>
          )}

          {/* Tareas, decisiones, riesgos — solo si REALIZADA */}
          {!restricted && (
            <>
              <TaskList tasks={tasks} />
              <DecisionList decisions={decisions} />
              <RiskList risks={risks} />
            </>
          )}

          {/* Temas: siempre visibles */}
          <TopicList
            topics={topics}
            title={restricted ? "Temas previstos en la agenda" : "Temas"}
          />

          {/* Chat IA — solo si REALIZADA */}
          {!restricted && <AIChat meetingId={id} />}
        </div>
      </div>
    </div>
  );
}
