const PRIORIDAD_COLOR = {
    ALTA: "bg-red-100 text-red-700",
    MEDIA: "bg-amber-100 text-amber-700",
    BAJA: "bg-slate-100 text-slate-700"
};

const ESTADO_COLOR = {
    PENDIENTE: "bg-amber-100 text-amber-700",
    COMPLETADA: "bg-green-100 text-green-700"
};

export default function TaskList({ tasks }) {

    return (

        <div className="bg-white rounded-xl shadow p-6 mt-8">

            <h2 className="text-2xl font-bold mb-4 text-emerald-700">
                Tareas
            </h2>

            <ul className="space-y-3">

                {tasks.map((task) => (

                    <li
                        key={task.task_id}
                        className="border-l-4 border-emerald-600 pl-4 py-1"
                    >

                        <div className="flex justify-between items-start gap-3">

                            <span>{task.descripcion}</span>

                            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${PRIORIDAD_COLOR[task.prioridad] ?? "bg-slate-100 text-slate-700"}`}>
                                {task.prioridad}
                            </span>

                        </div>

                        <div className="text-sm text-slate-500 mt-1 flex justify-between">

                            <span>{task.responsable ?? "Sin asignar"}</span>

                            <span className={`text-xs px-2 py-1 rounded-full ${ESTADO_COLOR[task.estado] ?? "bg-slate-100 text-slate-700"}`}>
                                {task.estado}
                            </span>

                        </div>

                    </li>

                ))}

            </ul>

        </div>

    );

}