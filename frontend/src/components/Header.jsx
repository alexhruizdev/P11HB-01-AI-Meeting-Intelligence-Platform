import {
    FaRobot,
    FaDatabase,
    FaBrain
} from "react-icons/fa";

export default function Header() {

    return (

        <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">

            <div className="max-w-7xl mx-auto px-8 py-8">

                <div className="flex justify-between items-center">

                    <div>

                        <h1 className="text-4xl font-bold">

                            AI Meeting Intelligence Platform

                        </h1>

                        <p className="text-slate-300 mt-3 text-lg">

                            Plataforma Empresarial de Inteligencia para Reuniones

                        </p>

                    </div>

                    <div className="flex gap-5">

                        <div className="bg-slate-700 p-4 rounded-xl">

                            <FaRobot size={28} />

                        </div>

                        <div className="bg-slate-700 p-4 rounded-xl">

                            <FaBrain size={28} />

                        </div>

                        <div className="bg-slate-700 p-4 rounded-xl">

                            <FaDatabase size={28} />

                        </div>

                    </div>

                </div>

            </div>

        </header>

    );

}