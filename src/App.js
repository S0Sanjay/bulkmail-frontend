import axios from "axios";
import { useState } from "react";
import * as XLSX from "xlsx";
import History from "./History";
const BACKEND_URL = "https://bulkmail-backend-one.vercel.app/";

function App() {
  const [subject, setsubject] = useState("");
  const [msg, setmsg] = useState("");
  const [emailList, setemailList] = useState([]);
  const [status, setstatus] = useState(false);
  const [resultMsg, setresultMsg] = useState("");
  const [showHistory, setshowHistory] = useState(false);

  function handlesubject(evt) {
    setsubject(evt.target.value);
  }

  function handlemsg(evt) {
    setmsg(evt.target.value);
  }

  function handlefile(event) {
    const file = event.target.files[0];
    console.log(file);
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const emailData = XLSX.utils.sheet_to_json(worksheet, { header: "A" });
      const totalemail = emailData.map(function (item) {
        return item.A;
      });
      console.log(totalemail);
      setemailList(totalemail);
    };
    reader.readAsBinaryString(file);
  }

  function send() {
    if (!subject || !msg || emailList.length === 0) {
      setresultMsg("Please fill subject, message and upload an email list!");
      return;
    }

    setstatus(true);
    setresultMsg("");

    axios
      .post(BACKEND_URL + "/sendemail", {
        subject: subject,
        message: msg,
        emailList: emailList,
      })
      .then(function (data) {
        console.log(data.data);
        if (data.data.success === true) {
          setresultMsg("Emails Sent Successfully!");
          setstatus(false);
          setsubject("");
          setmsg("");
          setemailList([]);
        } else {
          setresultMsg("Failed to send emails. Try again!");
          setstatus(false);
        }
      })
      .catch(function (err) {
        console.log("Error:", err);
        setresultMsg("Something went wrong!");
        setstatus(false);
      });
  }

  return (
    <div>
      {/* header */}
      <div className="bg-gray-900 text-white text-center">
        <h1 className="text-2xl font-medium px-5 py-3">BulkMail</h1>
      </div>

      <div className="bg-gray-700 text-white text-center">
        <h1 className="font-medium px-5 py-3">
          Send bulk emails to multiple people at once using an Excel file
        </h1>
      </div>

      {/* nav buttons */}
      <div className="bg-gray-500 text-white text-center flex justify-center gap-4 py-2">
        <button
          onClick={() => setshowHistory(false)}
          className={`px-4 py-1 rounded-md font-medium ${!showHistory ? "bg-white text-gray-900" : "text-white"}`}
        >
          Send Mail
        </button>
        <button
          onClick={() => setshowHistory(true)}
          className={`px-4 py-1 rounded-md font-medium ${showHistory ? "bg-white text-gray-900" : "text-white"}`}
        >
          History
        </button>
      </div>

      {/* show history page or send mail page */}
      {showHistory ? (
        <History backendUrl={BACKEND_URL} />
      ) : (
        <div className="bg-gray-100 flex flex-col items-center text-black px-5 py-5 min-h-screen">
          {/* subject input */}
          <input
            type="text"
            onChange={handlesubject}
            value={subject}
            className="w-[80%] py-2 px-2 outline-none border border-gray-400 rounded-md mb-3 bg-white"
            placeholder="Enter email subject..."
          />

          {/* message textarea */}
          <textarea
            onChange={handlemsg}
            value={msg}
            className="w-[80%] h-32 py-2 outline-none px-2 border border-gray-400 rounded-md bg-white"
            placeholder="Enter the email message...."
          ></textarea>

          {/* file upload */}
          <div className="mt-4 text-center">
            <p className="mb-2 font-medium text-gray-700">
              Upload Excel file with email list (.xlsx)
            </p>
            <input
              type="file"
              onChange={handlefile}
              accept=".xlsx,.xls"
              className="border-4 border-dashed border-gray-400 py-4 px-4 bg-white"
            />
          </div>

          <p className="mt-3 font-medium text-gray-700">
            Total Emails in file: {emailList.length}
          </p>

          {/* show success or error message */}
          {resultMsg && (
            <p
              className={`mt-3 font-medium px-4 py-2 rounded-md ${resultMsg.includes("Successfully") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {resultMsg}
            </p>
          )}

          <button
            onClick={send}
            className="mt-4 bg-gray-900 py-2 px-6 text-white font-medium rounded-md"
          >
            {status ? "Sending..." : "Send Emails"}
          </button>
        </div>
      )}

      <div className="bg-gray-200 text-center p-4 text-sm text-gray-600">
        BulkMail App - Full Stack Project
      </div>
    </div>
  );
}

export default App;
