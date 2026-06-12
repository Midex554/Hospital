import DashboardLayout from "../layout/DashboardLayout";

function ReceptionistDashboard() {
  return (
    <DashboardLayout title="Receptionist Dashboard">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Receptionist Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Receptionist workspace will manage patients, appointments, and billing.</p>
      </div>
    </DashboardLayout>
  );
}

export default ReceptionistDashboard;
