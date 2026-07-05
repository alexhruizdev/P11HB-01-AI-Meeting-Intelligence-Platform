import { useEffect, useState } from "react";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

import DashboardCards from "../components/DashboardCards";
import DashboardSummary from "../components/DashboardSummary";
import DashboardCharts from "../components/DashboardCharts";

import MeetingTable from "../components/MeetingTable";
import DecisionList from "../components/DecisionList";
import RiskList from "../components/RiskList";
import TopicList from "../components/TopicList";
import AIChat from "../components/AIChat";

import api, { getDashboardCharts } from "../services/api";

export default function Dashboard() {
  const [meetings, setMeetings] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [charts, setCharts] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [risks, setRisks] = useState([]);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    api.get("/meetings").then((res) => setMeetings(res.data));

    api.get("/dashboard").then((res) => setDashboard(res.data));

    getDashboardCharts().then((data) => setCharts(data));

    api.get("/decisions").then((res) => setDecisions(res.data));

    api.get("/risks").then((res) => setRisks(res.data));

    api.get("/topics").then((res) => setTopics(res.data));
  }, []);

  return (
    <div className="flex bg-slate-100">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <div className="w-full max-w-[1800px] mx-auto px-6 py-6">
          <DashboardCards dashboard={dashboard} />

          <DashboardSummary dashboard={dashboard} charts={charts} />

          <DashboardCharts charts={charts} />

          <MeetingTable meetings={meetings} />

          <DecisionList decisions={decisions} />

          <RiskList risks={risks} />

          <TopicList topics={topics} />

          <AIChat />
        </div>
      </div>
    </div>
  );
}
