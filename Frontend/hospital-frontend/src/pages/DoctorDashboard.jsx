import { useNavigate } from "react-router-dom";
function DoctorDashboard() {
   const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        navigate("/");
    };

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-5">
                 Admin Dashboard
            </h1>

            <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-5 py-2 rounded"
                >
                    Logout
                </button>
           </div>
    );
}

export default DoctorDashboard;