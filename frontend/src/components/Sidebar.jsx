import {
    FaChartLine,
    FaCalendarAlt,
    FaTasks,
    FaExclamationTriangle,
    FaComments,
    FaSearch,
    FaCog
} from "react-icons/fa";

export default function Sidebar() {

    const menu = [

        {
            icon: <FaChartLine />,
            title: "Dashboard"
        },

        {
            icon: <FaCalendarAlt />,
            title: "Reuniones"
        },

        {
            icon: <FaTasks />,
            title: "Tareas"
        },

        {
            icon: <FaExclamationTriangle />,
            title: "Riesgos"
        },

        {
            icon: <FaComments />,
            title: "AI Chat"
        },

        {
            icon: <FaSearch />,
            title: "Buscar"
        },

        {
            icon: <FaCog />,
            title: "Configuración"
        }

    ];

    return (

        <aside className="w-72 bg-slate-900 text-white min-h-screen shadow-2xl">

            <div className="p-8">

                <h2 className="text-2xl font-bold">

                    P11HB-01

                </h2>

                <p className="text-slate-400 text-sm mt-2">

                    Enterprise AI Platform

                </p>

            </div>

            <nav className="mt-8">

                {

                    menu.map(item => (

                        <div

                            key={item.title}

                            className="flex items-center gap-4 px-8 py-4 hover:bg-slate-800 cursor-pointer transition"

                        >

                            <span className="text-xl">

                                {item.icon}

                            </span>

                            <span>

                                {item.title}

                            </span>

                        </div>

                    ))

                }

            </nav>

        </aside>

    );

}