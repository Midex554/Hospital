import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import api from "../api/api";

function Appointment() {
  const [appointments, setAppointment] = useState([]);

  useEffect(() => {
    const fetchAppointment = async () => {
      const token = localStorage.getItem("token");

      const response = await api.get("/appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAppointment(response.data);
    };
    fetchAppointment();
  }, []);

  return (
    <DashboardLayout title="Appointments">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Appointment List</h2>

        <table className="w-full">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Patient</th>
              <th className="p-3 text-left">Doctor</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="border-b">
                <td className="p-3">{appointment.id}</td>
                <td className="p-3">
                  {appointment.patient?.firstName}{" "}
                  {appointment.patient?.lastName}
                </td>
                <td className="p-3">
                  {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                </td>
                <td className="p-3">{appointment.appointmentDate}</td>
                <td className="p-3">{appointment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Appointment;
