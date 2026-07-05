import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const getDashboardCharts = async () => {
  const response = await api.get("/dashboard/charts");
  return response.data;
};

export default api;