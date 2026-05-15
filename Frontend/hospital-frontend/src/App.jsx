import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import ReceptionistDashboard from "./pages/ReceptionistDashboard";
import Patients from "./pages/Patients";
import ProtectedRoute from "./components/ProtectedRoute";
import Appointment from "./pages/Appointment";
import MedicalRecords from "./pages/MedicalRecords";
import Billing from "./pages/Billing";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRole="DOCTOR">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patients"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <Patients />
          </ProtectedRoute>
        }
      />

      <Route
        path="/medical-records"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <MedicalRecords />
          </ProtectedRoute>
        }
      />

      <Route
        path="/billing"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <Billing />
          </ProtectedRoute>
        }
      />

      <Route
        path="/appointments"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <Appointment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/receptionist"
        element={
          <ProtectedRoute allowedRole="RECEPTIONIST">
            <ReceptionistDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
