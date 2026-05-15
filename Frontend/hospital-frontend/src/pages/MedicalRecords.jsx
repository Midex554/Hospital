import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import api from "../api/api";

function MedicalRecords() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      const token = localStorage.getItem("token");

      const response = await api.get("/medical-records", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRecords(response.data);
    };

    fetchRecords();
  }, []);

  return (
    <DashboardLayout title="Medical Records">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Medical Records</h2>

        <table className="w-full">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Patient</th>
              <th className="p-3 text-left">Diagnosis</th>
              <th className="p-3 text-left">Treatment</th>
              <th className="p-3 text-left">Prescription</th>
            </tr>
          </thead>

          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b">
                <td className="p-3">{record.id}</td>
                <td className="p-3">
                  {record.patient?.firstName} {record.patient?.lastName}
                </td>
                <td className="p-3">{record.diagnosis}</td>
                <td className="p-3">{record.treatment}</td>
                <td className="p-3">{record.prescription}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default MedicalRecords;
