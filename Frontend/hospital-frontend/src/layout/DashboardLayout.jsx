import { NavLink, useNavigate } from "react-router-dom";

function DashboardLayout({ title, children }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-blue-700 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">MediCore HMS</h1>

        <nav className="space-y-3">
          <p className="font-semibold mb-4">Role: {role}</p>

          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `block p-2 rounded ${
                isActive ? "bg-blue-900" : "hover:bg-blue-800"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/patients"
            className={({ isActive }) =>
              `block p-2 rounded ${
                isActive ? "bg-blue-900" : "hover:bg-blue-800"
              }`
            }
          >
            Patients
          </NavLink>

          <NavLink
            to="/appointments"
            className={({ isActive }) =>
              `block p-2 rounded ${
                isActive ? "bg-blue-900" : "hover:bg-blue-800"
              }`
            }
          >
            Appointments
          </NavLink>

          <NavLink
            to="/medical-records"
            className={({ isActive }) =>
              `block p-2 rounded ${
                isActive ? "bg-blue-900" : "hover:bg-blue-800"
              }`
            }
          >
            Medical Records
          </NavLink>

          <NavLink
            to="/billing"
            className={({ isActive }) =>
              `block p-2 rounded ${
                isActive ? "bg-blue-900" : "hover:bg-blue-800"
              }`
            }
          >
            Billing
          </NavLink>
        </nav>
      </aside>

      <main className="flex-1">
        <header className="bg-white shadow p-5 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{title}</h2>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </header>

        <section className="p-6">{children}</section>
      </main>
    </div>
  );
}

export default DashboardLayout;
