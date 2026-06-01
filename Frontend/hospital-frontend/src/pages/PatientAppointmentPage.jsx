import { useEffect, useState } from "react";
import api from "../api/api";
import DashboardLayout from "../layout/DashboardLayout";
import { CalendarDays, Stethoscope, Clock3, FileText } from "lucide-react";

export default function PatientAppointmentsPage() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get(`/appointments/patient/${user.id}`);

      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <DashboardLayout title="My Appointments">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">
            My Appointments
          </h1>

          <p className="text-slate-500 mt-1">
            View your appointment history and assigned doctors.
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-slate-100">
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-slate-100">
            No appointments found
          </div>
        ) : (
          <div className="grid gap-5">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <CalendarDays size={20} />
                      </div>

                      <div>
                        <h2 className="font-bold text-slate-800 text-lg">
                          {appointment.complaint}
                        </h2>

                        <p className="text-sm text-slate-400">
                          Appointment #{appointment.id}
                        </p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <InfoBox
                        icon={Clock3}
                        label="Appointment Date"
                        value={new Date(
                          appointment.appointmentDate,
                        ).toLocaleString()}
                      />

                      <InfoBox
                        icon={Stethoscope}
                        label="Assigned Doctor"
                        value={`Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`}
                      />

                      <InfoBox
                        icon={FileText}
                        label="Specialization"
                        value={appointment.doctor.specialization}
                      />
                    </div>

                    {appointment.notes && (
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p className="text-xs uppercase font-bold text-slate-400 mb-1">
                          Notes
                        </p>

                        <p className="text-sm text-slate-600">
                          {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(
                        appointment.status,
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function InfoBox({ icon: Icon, label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
      <div className="flex items-center gap-2 text-slate-400 mb-2">
        <Icon size={15} />
        <span className="text-xs uppercase font-bold">{label}</span>
      </div>

      <p className="text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}
