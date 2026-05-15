import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import api from "../api/api";

function Billing() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const fetchBills = async () => {
      const token = localStorage.getItem("token");

      const response = await api.get("/bills", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBills(response.data);
    };

    fetchBills();
  }, []);

  return (
    <DashboardLayout title="Billings">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Billing Records</h2>

        <table className="w-full">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Patient</th>
              <th className="p-3 text-left">Bill Name</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {bills.map((bill) => (
              <tr key={bill.id} className="border-b">
                <td className="p-3">{bill.id}</td>
                <td className="p-3">
                  {bill.patient?.firstName} {bill.patient?.lastName}
                </td>
                <td className="p-3">{bill.billName}</td>
                <td className="p-3">₦{bill.amount}</td>
                <td className="p-3">{bill.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Billing;
