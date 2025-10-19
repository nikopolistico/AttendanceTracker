import React, { useState, useRef } from "react";
import QRScanner from "../../utils/QRScanner"; // Assuming path
import "../../styles/styles.css";
import { supabase } from "../../database/supabaseClient"; // Assuming path
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

function SignOut() {
  const [idNumber, setIdNumber] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [yearlevel, setYearlevel] = useState("");
  const [section, setSection] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [studentId, setStudentId] = useState(null); // Store student id
  const [duration, setDuration] = useState(""); // Track duration
  const [timeOut, setTimeOut] = useState(null); // Track time_out
  const qrCodeRef = useRef(null);
  const navigate = useNavigate(); // Initialize navigate for redirection

  // Function to calculate duration between time_in and time_out
  function calculateDuration(timeInString, timeOutString) {
    const [inHours, inMinutes, inSeconds] = timeInString.split(":").map(Number);
    const [outHours, outMinutes, outSeconds] = timeOutString
      .split(":")
      .map(Number);

    let timeInInSeconds = inHours * 3600 + inMinutes * 60 + inSeconds;
    let timeOutInSeconds = outHours * 3600 + outMinutes * 60 + outSeconds;

    if (timeOutInSeconds < timeInInSeconds) {
      timeOutInSeconds += 24 * 3600;
    }

    const durationInSeconds = timeOutInSeconds - timeInInSeconds;

    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;

    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
    };
  }
  // Handle QR code scan and populate student info
  const handleScannedData = async (result) => {
    if (result) {
      // Populate form fields with the scanned data
      setIdNumber(result.idNumber || "");
      setName(result.name || "");
      setAddress(result.address || "");
      setYearlevel(result.yearlevel || "");
      setSection(result.section || "");

      // Call the get_student_by_id_number function from Supabase
      const { data, error } = await supabase.rpc("get_student_by_id_number", {
        p_id_number: result.idNumber || "adsa", // Ensure the parameter name matches the one in the PostgreSQL function
      });

      if (error) {
        console.error("Error fetching student ID:", error);
        alert("Error fetching student data.");
        return;
      }

      // Check if data is returned
      if (data && data.length > 0) {
        const studentId = data[0].id; // Get student ID from fetched data
        setStudentId(studentId);
        // Ensure you don't reference `data` before initialization
        const timeOut = new Date().toLocaleTimeString();
        setTimeOut(timeOut); // Set the `time_out`

        const { data: timeData, error: timeError } = await supabase
          .from("timeintimeout")
          .select("*")
          .eq("student_id", studentId)
          .order("id", { ascending: false })
          .limit(1);

        if (timeError) {
          console.error("Error fetching time in record:", timeError);
          alert("Error fetching time in record.");
          return;
        }

        // Update the time_out and duration for this student
        const { data: updateData, error: updateError } = await supabase
          .from("timeintimeout")
          .update({
            time_out: timeOut, // Update time_out with the current time
          })
          .eq("student_id", studentId);

        if (updateError) {
          console.error("Error updating time out:", updateError);
          alert("Error updating time out.");
          return;
        }

        const { data: timeData1, error: timeError1 } = await supabase
          .from("timeintimeout")
          .select("*")
          .eq("student_id", studentId)
          .order("id", { ascending: false })
          .limit(1);

        if (timeError1) {
          console.error("Error fetching time in record:", timeError1);
          alert("Error fetching time in record.");
          return;
        }

        console.log("Fetched Time Data for Duration Calculation:", timeData1);
        const { hours, minutes, seconds } = calculateDuration(
          timeData1[0].time_in,
          timeData1[0].time_out
        );
        const duration = `${hours}:${minutes}:${seconds}`;
        setDuration(duration);
        console.log("Calculated Duration:", duration);
        // Update the time_out and duration for this student
        const { data: updateData1, error: updateError1 } = await supabase
          .from("timeintimeout")
          .update({
            duration: duration, // Update duration with the calculated duration
          })
          .eq("student_id", studentId);

        if (updateError1) {
          console.error("Error updating time out:", updateError);
          alert("Error updating time out.");
          return;
        }
        alert("Time out recorded successfully!");
        // Hide the scanner after successful scan
        setShowScanner(false);
      } else {
        alert("Student not found in the database.");
      }
    }
  };

  // Back button functionality
  const handleBackClick = () => {
    navigate("/dashboard"); // Navigate back to dashboard
  };

  // Back button functionality
  const handleToTimeIn = () => {
    navigate("/signin"); // Navigate to time in page
  };

  return (
    <div className="container ">
      <button
        onClick={handleBackClick}
        className="text-end border border-amber-400 rounded-3xl p-2 mr-2"
      >
        Back to Dashboard
      </button>

      <button
        onClick={handleToTimeIn}
        className="text-end border border-amber-400 rounded-3xl p-2"
      >
        Back to Time In
      </button>
      <h1 className="text-2xl font-semibold text-center text-gray-700 mb-4 col-span-2">
        SignOut Attendance
      </h1>

      {/* Tabs for Time In and Time Out */}
      <div className="container mx-auto p-4 bg-gray border border-amber-200 rounded-lg shadow-sm">
        {/* QR Scanner */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowScanner(!showScanner)}
            className="w-full p-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 text-sm"
          >
            {showScanner ? "Close QR Scanner" : "Scan QR Code"}
          </button>
        </div>
        {/* QR Scanner Modal/Section */}
        {showScanner && (
          <div className="mt-4">
            <p className="text-center font-bold mb-2 text-sm">
              Point your camera at a QR code.
            </p>
            <QRScanner onScan={handleScannedData} />
          </div>
        )}
      </div>
    </div>
  );
}

export default SignOut;
