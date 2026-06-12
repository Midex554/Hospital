import { useEffect, useMemo, useState } from "react";
import { Send, RefreshCw, MessageCircle, UserRound } from "lucide-react";
import api from "../api/api";
import DashboardLayout from "../layout/DashboardLayout";

export default function ChatPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = (localStorage.getItem("role") || user?.role || "").toUpperCase();

  const [appointments, setAppointments] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [currentChatUserId, setCurrentChatUserId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const showToast = (type, text) => {
    setToast({ type, message: text });
    setTimeout(() => setToast(null), 3000);
  };

  const uniqueAppointments = useMemo(() => {
    const map = new Map();

    appointments.forEach((appointment) => {
      const patientId = appointment.patient?.id;

      if (patientId && !map.has(patientId)) {
        map.set(patientId, appointment);
      }
    });

    return Array.from(map.values());
  }, [appointments]);

  const fetchAllMessages = async () => {
    try {
      const res = await api.get("/chat", {
        headers: authHeader(),
      });

      setAllMessages(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("All chat messages error:", error.response?.data || error);
    }
  };

  const fetchApprovedAppointments = async () => {
    try {
      let url = "";

      if (role === "PATIENT") {
        url = `/appointments/patient/${user.id}/approved`;
      } else if (role === "DOCTOR") {
        url = `/appointments/doctor/${user.id}`;
      } else {
        showToast("error", "Only doctors and patients can use chat");
        return;
      }

      const res = await api.get(url, {
        headers: authHeader(),
      });

      const data = Array.isArray(res.data) ? res.data : [];

      const approvedOnly = data.filter(
        (appointment) => appointment.status === "Approved",
      );

      setAppointments(approvedOnly);

      if (role === "PATIENT" && approvedOnly.length > 0) {
        const appointment = approvedOnly[0];

        setCurrentChatUserId(appointment.patient?.id);

        setSelectedPerson({
          id: appointment.doctor?.id,
          role: "DOCTOR",
          name: `Dr. ${appointment.doctor?.firstName || ""} ${
            appointment.doctor?.lastName || ""
          }`,
        });
      }
    } catch (error) {
      console.error(
        "Approved appointment error:",
        error.response?.data || error,
      );
      showToast("error", "Failed to load approved appointment");
    }
  };

  const fetchConversation = async () => {
    if (!currentChatUserId || !selectedPerson?.id) return;

    setLoading(true);

    try {
      const res = await api.get("/chat/conversation", {
        headers: authHeader(),
        params: {
          senderId: currentChatUserId,
          receiverId: selectedPerson.id,
        },
      });

      setMessages(Array.isArray(res.data) ? res.data : []);
      fetchAllMessages();
    } catch (error) {
      console.error("Fetch chat error:", error.response?.data || error);
      showToast("error", "Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!currentChatUserId || !selectedPerson?.id) {
      showToast("error", "No approved doctor/patient selected");
      return;
    }

    if (!message.trim()) {
      showToast("error", "Message cannot be empty");
      return;
    }

    try {
      const payload = {
        senderId: currentChatUserId,
        senderRole: role,
        receiverId: selectedPerson.id,
        receiverRole: selectedPerson.role,
        message: message.trim(),
        attachmentUrl: "",
      };

      const res = await api.post("/chat/send", payload, {
        headers: authHeader(),
      });

      setMessages((prev) => [...prev, res.data]);
      setAllMessages((prev) => [...prev, res.data]);
      setMessage("");
    } catch (error) {
      console.error("Send chat error:", error.response?.data || error);
      showToast("error", "Failed to send message");
    }
  };

  const getPatientChatPreview = (appointment) => {
    const doctorId = appointment.doctor?.id;
    const patientId = appointment.patient?.id;

    const conversation = allMessages
      .filter(
        (msg) =>
          (Number(msg.senderId) === Number(patientId) &&
            Number(msg.receiverId) === Number(doctorId)) ||
          (Number(msg.senderId) === Number(doctorId) &&
            Number(msg.receiverId) === Number(patientId)),
      )
      .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));

    const lastMessage = conversation[conversation.length - 1];

    const unreadCount = conversation.filter(
      (msg) =>
        Number(msg.senderId) === Number(patientId) &&
        Number(msg.receiverId) === Number(doctorId) &&
        selectedPerson?.id !== patientId,
    ).length;

    return {
      lastMessage: lastMessage?.message || "Tap to open chat",
      unreadCount,
      time: lastMessage?.sentAt
        ? new Date(lastMessage.sentAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
    };
  };

  useEffect(() => {
    fetchApprovedAppointments();
    fetchAllMessages();
  }, []);

  useEffect(() => {
    if (currentChatUserId && selectedPerson?.id) {
      fetchConversation();
    }
  }, [currentChatUserId, selectedPerson]);

  return (
    <DashboardLayout title="Chat">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 lg:col-span-1">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <MessageCircle size={22} />
            </div>

            <div>
              <h2 className="font-extrabold text-slate-800 dark:text-white">Chat Access</h2>
              <p className="text-xs text-slate-400">
                Approved consultations only
              </p>
            </div>
          </div>

          {role === "PATIENT" ? (
            selectedPerson ? (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-xs text-slate-500 dark:text-slate-400">Assigned Doctor</p>
                <h3 className="font-bold text-blue-700 mt-1">
                  {selectedPerson.name}
                </h3>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No approved doctor yet. Wait for doctor approval.
              </p>
            )
          ) : (
            <div className="space-y-2">
              {uniqueAppointments.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No approved patients yet.
                </p>
              ) : (
                uniqueAppointments.map((appointment) => {
                  const patient = appointment.patient;
                  const preview = getPatientChatPreview(appointment);
                  const active = selectedPerson?.id === patient?.id;

                  return (
                    <button
                      key={patient?.id}
                      onClick={() => {
                        setCurrentChatUserId(appointment.doctor?.id);

                        setSelectedPerson({
                          id: patient?.id,
                          role: "PATIENT",
                          name: `${patient?.firstName || ""} ${
                            patient?.lastName || ""
                          }`,
                        });
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition ${
                        active
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-100 dark:border-slate-700 hover:bg-blue-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                              active
                                ? "bg-white dark:bg-slate-900/20 text-white"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            <UserRound size={19} />
                          </div>

                          <div className="min-w-0">
                            <p className="font-bold truncate">
                              {patient?.firstName} {patient?.lastName}
                            </p>

                            <p
                              className={`text-xs truncate mt-0.5 ${
                                active ? "text-white/80" : "text-slate-400"
                              }`}
                            >
                              {preview.lastMessage}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {preview.time && (
                            <span
                              className={`text-[10px] ${
                                active ? "text-white/70" : "text-slate-400"
                              }`}
                            >
                              {preview.time}
                            </span>
                          )}

                          {preview.unreadCount > 0 && !active && (
                            <span className="min-w-6 h-6 px-2 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">
                              {preview.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden lg:col-span-3">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">
                {selectedPerson
                  ? `Chat with ${selectedPerson.name}`
                  : "Consultation Chat"}
              </h2>
              <p className="text-xs text-slate-400">
                Patient and doctor conversation
              </p>
            </div>

            <button
              onClick={fetchConversation}
              disabled={!selectedPerson}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold disabled:opacity-50"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          <div className="h-[500px] overflow-y-auto p-5 space-y-3 bg-slate-50 dark:bg-slate-800">
            {!selectedPerson ? (
              <EmptyChat
                title="No chat selected"
                text="Chat becomes available after doctor approval."
              />
            ) : loading ? (
              <p className="text-center text-slate-500 dark:text-slate-400">Loading chat...</p>
            ) : messages.length === 0 ? (
              <EmptyChat
                title="No messages yet"
                text="Start the consultation conversation."
              />
            ) : (
              messages.map((msg) => {
                const mine =
                  Number(msg.senderId) === Number(currentChatUserId) &&
                  msg.senderRole === role;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                        mine
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.message}</p>

                      <p
                        className={`text-[10px] mt-2 ${
                          mine ? "text-blue-100" : "text-slate-400"
                        }`}
                      >
                        {msg.sentAt
                          ? new Date(msg.sentAt).toLocaleString()
                          : ""}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="flex gap-3">
              <input
                value={message}
                disabled={!selectedPerson}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                placeholder={
                  selectedPerson
                    ? "Type message..."
                    : "Chat is available after approval"
                }
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100 dark:bg-slate-800"
              />

              <button
                onClick={sendMessage}
                disabled={!selectedPerson}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50"
              >
                <Send size={16} />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function EmptyChat({ title, text }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <MessageCircle className="text-slate-300 mb-3" size={42} />
      <h3 className="font-bold text-slate-700 dark:text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 mt-1">{text}</p>
    </div>
  );
}

function Toast({ type, message }) {
  const styles =
    type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white";

  return (
    <div
      className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-lg text-sm font-semibold ${styles}`}
    >
      {message}
    </div>
  );
}
