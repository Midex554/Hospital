import { useEffect, useState } from "react";
import DashboardLayout from "../LAYOUT/DashboardLayout";
import api from "../api/api";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [deletePatientId, setDeletePatientId] = useState(null);
  const [editPatient, setEditPatient] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState(null);
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    phone: "",
    email: "",
    bloodGroup: "",
    address: "",
  });
  const [popupMessage, setPopupMessage] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/patients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPatients(response.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) =>
    `${patient.firstName} ${patient.lastName} ${patient.email} ${patient.phone}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.delete(`/patients/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPatients(patients.filter((patient) => patient.id !== id));
      setPopupMessage({
        type: "success",
        text: "Patient data deleted Successfully",
      });
    } catch (error) {
      setPopupMessage({
        type: "error",
        text: error.response?.data?.message || "Patient Cannot be deleted ",
      });

      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleEditChange = (e) => {
    setEditPatient({
      ...editPatient,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdatePatient = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.put(
        `/patients/${editPatient.id}`,
        editPatient,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPatients(
        patients.map((patient) =>
          patient.id === editPatient.id ? response.data : patient,
        ),
      );

      setEditPatient(null);
    } catch (error) {
      alert("Failed to update patient");
    }
  };

  const handleNewPatientChange = (e) => {
    setNewPatient({
      ...newPatient,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreatePatient = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.post("/patients", newPatient, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPatients([...patients, response.data]);
      setShowAddModal(false);

      setNewPatient({
        firstName: "",
        lastName: "",
        gender: "",
        phone: "",
        email: "",
        bloodGroup: "",
        address: "",
      });

      setPopupMessage({
        type: "success",
        text: "Patient created successfully",
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setPopupMessage({
        type: "error",
        text: "Patient not created",
      });

      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Patients">
        <div className="text-center text-xl font-semibold">
          Loading patients...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Patients">
      {message && (
        <div
          className={`fixed top-5 right-5 z-[9999] px-6 py-3 rounded-xl shadow-lg text-white ${
            message.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {message.text}
        </div>
      )}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Patient List</h2>

        <input
          type="text"
          placeholder="Search patients..."
          className="w-full border p-3 rounded mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded cursor-pointer transition"
          >
            Add Patient
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Gender</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Blood Group</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-6 text-gray-500">
                    No patients found
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b">
                    <td className="p-3">{patient.id}</td>

                    <td className="p-3">
                      {patient.firstName} {patient.lastName}
                    </td>

                    <td className="p-3">{patient.gender}</td>
                    <td className="p-3">{patient.phone}</td>
                    <td className="p-3">{patient.bloodGroup}</td>

                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer transition"
                        >
                          View
                        </button>

                        <button
                          onClick={() => setEditPatient(patient)}
                          className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded cursor-pointer transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => setDeletePatientId(patient.id)}
                          className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded cursor-pointer transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[500px] relative">
            <button
              onClick={() => setSelectedPatient(null)}
              className="absolute top-3 right-3 text-red-500 text-xl cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-6">Patient Details</h2>

            <div className="space-y-3">
              <p>
                <strong>Name:</strong> {selectedPatient.firstName}{" "}
                {selectedPatient.lastName}
              </p>
              <p>
                <strong>Email:</strong> {selectedPatient.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedPatient.phone}
              </p>
              <p>
                <strong>Gender:</strong> {selectedPatient.gender}
              </p>
              <p>
                <strong>Blood Group:</strong> {selectedPatient.bloodGroup}
              </p>
              <p>
                <strong>Address:</strong> {selectedPatient.address}
              </p>
            </div>
          </div>
        </div>
      )}

      {deletePatientId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[400px] text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-500">
              Delete Patient
            </h2>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this patient data?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeletePatientId(null)}
                className="bg-gray-300 hover:bg-gray-400 transition px-5 py-2 rounded cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  handleDelete(deletePatientId);
                  setDeletePatientId(null);
                }}
                className="bg-red-500 hover:bg-red-700 text-white transition px-5 py-2 rounded cursor-pointer"
              >
                Delete Data
              </button>
            </div>
          </div>
        </div>
      )}

      {editPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[500px]">
            <h2 className="text-2xl font-bold mb-6">Edit Patient</h2>

            <div className="space-y-4">
              <input
                type="text"
                name="firstName"
                value={editPatient.firstName || ""}
                onChange={handleEditChange}
                placeholder="First Name"
                className="w-full border p-3 rounded"
              />

              <input
                type="text"
                name="lastName"
                value={editPatient.lastName || ""}
                onChange={handleEditChange}
                placeholder="Last Name"
                className="w-full border p-3 rounded"
              />

              <input
                type="email"
                name="email"
                value={editPatient.email || ""}
                onChange={handleEditChange}
                placeholder="Email"
                className="w-full border p-3 rounded"
              />

              <input
                type="text"
                name="phone"
                value={editPatient.phone || ""}
                onChange={handleEditChange}
                placeholder="Phone"
                className="w-full border p-3 rounded"
              />

              <input
                type="text"
                name="bloodGroup"
                value={editPatient.bloodGroup || ""}
                onChange={handleEditChange}
                placeholder="Blood Group"
                className="w-full border p-3 rounded"
              />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setEditPatient(null)}
                className="bg-gray-300 hover:bg-gray-400 px-5 py-2 rounded cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdatePatient}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[500px]">
            <h2 className="text-2xl font-bold mb-6">Add Patient</h2>

            <div className="space-y-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={newPatient.firstName}
                onChange={handleNewPatientChange}
                className="w-full border p-3 rounded"
              />

              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={newPatient.lastName}
                onChange={handleNewPatientChange}
                className="w-full border p-3 rounded"
              />

              <select
                name="gender"
                value={newPatient.gender}
                onChange={handleNewPatientChange}
                className="w-full border p-3 rounded"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={newPatient.phone}
                onChange={handleNewPatientChange}
                className="w-full border p-3 rounded"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={newPatient.email}
                onChange={handleNewPatientChange}
                className="w-full border p-3 rounded"
              />

              <select
                name="bloodGroup"
                value={newPatient.bloodGroup}
                onChange={handleNewPatientChange}
                className="w-full border p-3 rounded"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>

              <input
                type="text"
                name="address"
                placeholder="Address"
                value={newPatient.address}
                onChange={handleNewPatientChange}
                className="w-full border p-3 rounded"
              />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-gray-300 hover:bg-gray-400 px-5 py-2 rounded cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleCreatePatient}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded cursor-pointer"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {popupMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[400px] text-center">
            <h2
              className={`text-2xl font-bold mb-4 ${
                popupMessage.type === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {popupMessage.type === "success" ? "Success" : "Error"}
            </h2>

            <p className="text-gray-600 mb-6">{popupMessage.text}</p>

            <button
              onClick={() => setPopupMessage(null)}
              className={`px-5 py-2 rounded text-white transition ${
                popupMessage.type === "success"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Patients;
