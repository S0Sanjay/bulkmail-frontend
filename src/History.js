import { useState, useEffect } from "react"
import axios from "axios"

function History({ backendUrl }) {

    const [historyList, sethistoryList] = useState([])
    const [loading, setloading] = useState(true)

    useEffect(function() {
        fetchHistory()
    }, [])

    function fetchHistory() {
        setloading(true)
        axios.get(backendUrl + "/history")
        .then(function(data) {
            console.log("History data:", data.data)
            sethistoryList(data.data)
            setloading(false)
        })
        .catch(function(err) {
            console.log("Error fetching history:", err)
            setloading(false)
        })
    }

    return (
        <div className="bg-gray-100 min-h-screen px-5 py-5">
            <h2 className="text-center text-xl font-bold text-gray-800 mb-4">Email History</h2>

            {loading && (
                <p className="text-center text-gray-500">Loading...</p>
            )}

            {!loading && historyList.length === 0 && (
                <p className="text-center text-gray-500">No emails sent yet!</p>
            )}

            {!loading && historyList.map(function(item, index) {
                return (
                    <div key={index} className="bg-white rounded-md px-4 py-3 mb-3 shadow-sm">

                        <div className="flex justify-between items-center mb-1">
                            <p className="font-bold text-blue-900">{item.subject}</p>
                            <span className={`text-sm px-2 py-1 rounded-md ${item.status === "success" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                                {item.status}
                            </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-1">{item.message}</p>

                        <p className="text-sm text-blue-700">
                            Sent to: {item.emailList.length} recipient(s)
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                            {new Date(item.sentAt).toLocaleString()}
                        </p>

                    </div>
                )
            })}

            <div className="text-center mt-4">
                <button
                    onClick={fetchHistory}
                    className="bg-gray-900 text-white px-4 py-2 rounded-md font-medium"
                >
                    Refresh
                </button>
            </div>

        </div>
    )
}

export default History;