import DashboardLayout from "../layout/DashboardLayout";

function DoctorDashboard() {
  return (
    <DashboardLayout title="Doctor Dashboard">
      <div className="bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-slate-800">Doctor Dashboard</h1>
        <p className="text-slate-500 mt-2">Doctor workspace will show assigned appointments and medical records.</p>
      </div>
    </DashboardLayout>
  );
}

export default DoctorDashboard;
