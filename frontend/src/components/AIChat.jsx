import { useState } from "react";
import { FaRobot, FaPaperPlane } from "react-icons/fa";
import api from "../services/api";

export default function AIChat({ meetingId = null }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const isScoped = meetingId !== null;

  async function askAI() {
    if (!question.trim()) return;

    const userMsg = { role: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await api.post("/chat", {
        question,
        meeting_id: meetingId,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: response.data.answer },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ Error al conectar con el asistente. Intenta de nuevo.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md mt-6 p-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`p-2.5 rounded-xl text-white ${isScoped ? "bg-emerald-600" : "bg-blue-600"}`}
        >
          <FaRobot size={18} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {isScoped ? "AI Meeting Assistant" : "AI Executive Assistant"}
          </h2>
          <p className="text-xs text-slate-500">
            {isScoped
              ? "Responde solo sobre esta reunión"
              : "Consulta sobre todas las reuniones y comités"}
          </p>
        </div>
      </div>

      {/* Mensajes */}
      <div className="bg-slate-50 rounded-xl p-4 min-h-32 max-h-80 overflow-y-auto mb-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-slate-400 text-sm text-center mt-6">
            {isScoped
              ? "Pregunta sobre las tareas, decisiones o riesgos de esta reunión..."
              : "Pregunta sobre tareas pendientes, riesgos activos, decisiones o resúmenes por comité..."}
          </p>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`rounded-2xl px-4 py-3 max-w-2xl text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white border border-slate-200 text-slate-700 shadow-sm rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder={
            isScoped
              ? "Pregunta sobre esta reunión..."
              : "Pregunta sobre todas las reuniones..."
          }
          className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50"
        />
        <button
          onClick={askAI}
          disabled={loading || !question.trim()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl text-sm font-medium transition-all"
        >
          <FaPaperPlane size={14} />
          Enviar
        </button>
      </div>
    </div>
  );
}
