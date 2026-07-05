import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import MeetingDashboard from "./pages/MeetingDashboard";

export default function App() {

    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/meeting/:id" element={<MeetingDashboard />} />
        </Routes>
    );

}