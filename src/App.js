import axios from "axios";
import { useState } from "react";
import * as XLSX from "xlsx";

const BACKEND_URL = "https://your-backend.vercel.app";

function App() {
  const [tab, setTab] = useState("send");
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");
  const [emailList, setEmailList] = useState([]);
  const [manualEmail, setManualEmail] = useState("");
  const [status, setStatus] = useState(null); 
  const [errors, setErrors] = useState({});
  const [adminKey, setAdminKey] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const parsed = XLSX.utils.sheet_to_json(worksheet, { header: "A" });
      const emails = parsed.map((item) => item.A).filter(Boolean);
      setEmailList(emails);
    };
    reader.readAsBinaryString(file);
  }

  function addManualEmail() {
    const trimmed = manualEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setErrors((e) => ({ ...e, manual: "Invalid email address." }));
      return;
    }
    if (emailList.includes(trimmed)) {
      setErrors((e) => ({ ...e, manual: "Email already added." }));
      return;
    }
    setEmailList((prev) => [...prev, trimmed]);
    setManualEmail("");
    setErrors((e) => ({ ...e, manual: "" }));
  }

  function removeEmail(index) {
    setEmailList((prev) => prev.filter((_, i) => i !== index));
  }

  function validate() {
    const newErrors = {};
    if (!subject.trim()) newErrors.subject = "Subject is required.";
    if (!msg.trim()) newErrors.msg = "Email body is required.";
    if (emailList.length === 0) newErrors.emailList = "Add at least one recipient.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function send() {
    if (!validate()) return;
    setStatus("sending");
    axios
      .post(`${BACKEND_URL}/sendemail`, { subject, message: msg, emailList })
      .then((res) => {
        if (res.data.success) {
          setStatus("success");
          setSubject("");
          setMsg("");
          setEmailList([]);
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("failed"));
  }

  function handleLogin() {
    if (!adminKey.trim()) {
      setLoginError("Please enter the admin key.");
      return;
    }
    setIsLoggedIn(true);
    setLoginError("");
    setTab("history");
    fetchHistory(adminKey);
  }

  function fetchHistory(key) {
    setHistoryLoading(true);
    axios
      .get(`${BACKEND_URL}/history`, {
        headers: { "x-admin-key": key || adminKey },
      })
      .then((res) => {
        setHistory(res.data);
        setHistoryLoading(false);
      })
      .catch(() => {
        setHistory([]);
        setHistoryLoading(false);
      });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {}
      <nav className="bg-blue-950 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wide">📧 BulkMail</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setTab("send")}
            className={`px-4 py-1 rounded-md font-medium transition ${
              tab === "send" ? "bg-white text-blue-950" : "hover:bg-blue-800"
            }`}
          >
            Send Mail
          </button>
          <button
            onClick={() => setTab(isLoggedIn ? "history" : "login")}
            className={`px-4 py-1 rounded-md font-medium transition ${
              tab === "history" || tab === "login"
                ? "bg-white text-blue-950"
                : "hover:bg-blue-800"
            }`}
          >
            History
          </button>
        </div>
      </nav>

      {}
      {tab === "send" && (
        <div className="max-w-2xl mx-auto mt-10 bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-blue-950 mb-6">Send Bulk Emails</h2>

          {}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
            />
            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
          </div>

          {}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Body</label>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Enter the email body..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-32 outline-none focus:border-blue-500"
            />
            {errors.msg && <p className="text-red-500 text-xs mt-1">{errors.msg}</p>}
          </div>

          {}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Upload Recipients (Excel - Column A)
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFile}
              className="border-2 border-dashed border-blue-300 rounded-md px-4 py-3 w-full cursor-pointer"
            />
          </div>

          {}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Add Email Manually
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addManualEmail()}
                placeholder="example@email.com"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
              />
              <button
                onClick={addManualEmail}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            {errors.manual && <p className="text-red-500 text-xs mt-1">{errors.manual}</p>}
          </div>

          {}
          {emailList.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Recipients ({emailList.length})
              </p>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {emailList.map((email, i) => (
                  <span
                    key={i}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  >
                    {email}
                    <button
                      onClick={() => removeEmail(i)}
                      className="text-red-500 font-bold hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          {errors.emailList && <p className="text-red-500 text-xs mb-3">{errors.emailList}</p>}

          {}
          {status === "success" && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-md mb-4">
              ✅ Emails sent successfully!
            </div>
          )}
          {status === "failed" && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md mb-4">
              ❌ Failed to send emails. Please try again.
            </div>
          )}

          {}
          <button
            onClick={send}
            disabled={status === "sending"}
            className="w-full bg-blue-950 text-white py-3 rounded-md font-semibold hover:bg-blue-800 disabled:opacity-60 transition"
          >
            {status === "sending" ? "Sending..." : "Send Emails"}
          </button>
        </div>
      )}

      {}
      {tab === "login" && (
        <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-blue-950 mb-6">Admin Login</h2>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Key</label>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Enter admin key..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500 mb-3"
          />
          {loginError && <p className="text-red-500 text-xs mb-3">{loginError}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-blue-950 text-white py-3 rounded-md font-semibold hover:bg-blue-800 transition"
          >
            Login
          </button>
        </div>
      )}

      {}
      {tab === "history" && isLoggedIn && (
        <div className="max-w-4xl mx-auto mt-10 bg-white rounded-xl shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-950">Email History</h2>
            <button
              onClick={() => fetchHistory()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              Refresh
            </button>
          </div>

          {historyLoading ? (
            <p className="text-gray-500 text-center py-10">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No history found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-blue-950 text-white">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Subject</th>
                    <th className="px-4 py-3 text-left">Recipients</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record, i) => (
                    <tr key={record._id} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3">{record.subject}</td>
                      <td className="px-4 py-3">{record.emailList.length} emails</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            record.status === "success"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(record.sentAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
