import React, { useState, useRef } from "react";
import QRScanner from "../../utils/QRScanner"; // Assuming path
import "../../styles/styles.css";
import { supabase } from "../../database/supabaseClient"; // Assuming path
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

function SignIn() {
  const [idNumber, setIdNumber] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [yearlevel, setYearlevel] = useState("");
  const [section, setSection] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [studentId, setStudentId] = useState(null); // Store student id
  const [timeIn, setTimeIn] = useState(null); // Track time_in
  const [isScanningIn, setIsScanningIn] = useState(true); // Flag to track timeIn or timeOut (True = timeIn, False = timeOut)
  const qrCodeRef = useRef(null);
  const navigate = useNavigate(); // Initialize navigate for redirection

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
        const studentId = data[0].id; // Assuming 'id' is the primary key field
        setStudentId(studentId);

        // Ensure you don't reference `data` before initialization
        const time = new Date().toLocaleTimeString();
        setTimeIn(time); // Set the `time_in`

        // Insert the time_in record in the database
        const { data: timeData, error: timeError } = await supabase
          .from("timeintimeout")
          .insert([
            {
              student_id: studentId, // Use the student's ID as a foreign key
              time_in: time, // Insert time_in
            },
          ]);

        if (timeError) {
          console.error("Error tracking attendance:", timeError);
          alert("Error tracking attendance or already signed in.");
        } else {
          console.log("Attendance tracked successfully:", timeData);
          alert("Attendance Sign In successfully!");
        }

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
  const handleToTimeOut = () => {
    navigate("/signout"); // Navigate to timeout page
  };

  return (
    <div className="container">
      <div className="divide-fuchsia-50 gap-3"> 
        <button
          onClick={handleBackClick}
          className="text-end border border-amber-400 rounded-3xl p-2 mr-2"
        >
          Back to Dashboard
        </button>

        <button
          onClick={handleToTimeOut}
          className="text-end border border-amber-400 rounded-3xl p-2"
        >
          Back to Timeout
        </button>
      </div>
      <h1 className="text-2xl font-semibold text-center text-gray-700 mb-4 col-span-2">
        SignIn Attendance
      </h1>
      {/* Tabs for Time In and Time Out */}
      <div className="col-span-2 lg:col-span-1 max-w-lg mx-auto p-4 bg-gray border border-amber-200 rounded-lg shadow-sm">
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

export default SignIn;
