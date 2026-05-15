import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import api from "../api/api";

import { Users, UserRound, CalendarCheck } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function AdminDashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchStats();
  }, []);

  const chartData = [
    { name: "Patients", total: stats.patients },
    { name: "Doctors", total: stats.doctors },
    { name: "Appointments", total: stats.appointment },
  ];

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 font-semibold">Patients</h3>
              <p className="text-4xl font-bold mt-2">{stats.patients}</p>
            </div>

            <div className="bg-blue-100 p-4 rounded-full">
              <Users className="text-blue-700" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 font-semibold">Doctors</h3>
              <p className="text-4xl font-bold mt-2">{stats.doctors}</p>
            </div>

            <div className="bg-green-100 p-4 rounded-full">
              <UserRound className="text-green-700" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 font-semibold">Appointments</h3>
              <p className="text-4xl font-bold mt-2">{stats.appointment}</p>
            </div>

            <div className="bg-purple-100 p-4 rounded-full">
              <CalendarCheck className="text-purple-700" size={32} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow mt-8">
        <h3 className="text-xl font-bold mb-4">System Overview</h3>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;
