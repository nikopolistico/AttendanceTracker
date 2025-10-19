import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../../database/supabaseClient"; // Assuming path
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { QRCodeCanvas } from "qrcode.react"; // Changed from QRCodeSVG
import "../../styles/styles.css";

function Registration() {
  const [idNumber, setIdNumber] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [yearlevel, setYearlevel] = useState("");
  const [section, setSection] = useState("");
  const [qrData, setQrData] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [qrCodeImagePath, setQrCodeImagePath] = useState(null);
  const [studentSaved, setStudentSaved] = useState(false);
  const [user, setUser] = useState(null); // Store the authenticated user
  const [loadingUser, setLoadingUser] = useState(true); // To handle loading state
  const qrCodeRef = useRef(null);
  const navigate = useNavigate(); // Initialize navigate for redirection

  // Check if the user is authenticated
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        navigate("/login"); // Redirect to login page if not authenticated
      } else {
        setUser(session?.user || null); // Set the user if authenticated
      }
      setLoadingUser(false); // Set loading to false once the session is fetched
    };
    getSession();
  }, []);

  // Handle form submission and QR code generation
  const handleSubmit = (e) => {
    e.preventDefault();
    const dataString = JSON.stringify({
      idNumber,
      name,
      address,
      yearlevel,
      section,
    });
    setQrData(dataString);
  };

  // Download the QR code
  const downloadQRCode = () => {
    const qrCodeElement = qrCodeRef.current;

    if (qrCodeElement) {
      const canvas = qrCodeElement.querySelector("canvas");
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "qr-code.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      console.error("QR Code element not found.");
    }
  };

  // Save the student data and QR code to the database
  const saveQRCodeToDatabase = async (qrCodeImagePath) => {
    if (qrCodeImagePath) {
      const { data, error } = await supabase
        .from("students") // Replace with your table name
        .insert([
          {
            idNumber,
            name,
            address,
            yearlevel,
            section,
            qrCodePath: qrCodeImagePath, // Save the QR code image path to the database
          },
        ]);

      if (error) {
        console.error("Error saving data to database:", error);
        alert("Error saving data. Check console for details.");
      } else {
        alert("Student data and QR code saved successfully!");
        setStudentSaved(true); // Set the flag to true when saving is successful
      }
    } else {
      alert("No QR code to save.");
    }
  };

  // Cancel the save and clear the form
  const cancelSave = () => {
    setQrData("");
    setQrCodeImagePath(null);
    setStudentSaved(false); // Reset saved flag on cancel
  };

  const saveQRCodeImage = async () => {
    // Ensure user is authenticated
    if (!user || !user.id) {
      alert("User is not authenticated or user ID is missing.");
      return;
    }

    const qrCodeElement = qrCodeRef.current;
    if (qrCodeElement) {
      const canvas = qrCodeElement.querySelector("canvas");
      const dataUrl = canvas.toDataURL("image/png"); // Get base64 image

      // Convert base64 image to a file (Blob)
      const byteCharacters = atob(dataUrl.split(",")[1]);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset++) {
        const byteArray = new Uint8Array(1);
        byteArray[0] = byteCharacters.charCodeAt(offset);
        byteArrays.push(byteArray);
      }
      const blob = new Blob(byteArrays, { type: "image/png" });

      const fileName = `qr-code-${Date.now()}.png`; // Using timestamp as file name to avoid name collisions

      // If you want to upload to a custom folder like "images" or the root folder, you can do so
      const folderPath = `images`; // You can change this if you want to use different folder names

      // Upload QR code image to Supabase storage
      const { data, error } = await supabase.storage
        .from("qr-codes") // Ensure this matches your Supabase bucket name
        .upload(`${folderPath}/${fileName}`, blob, {
          cacheControl: "3600",
          upsert: false,
          contentType: "image/png",
        });

      if (error) {
        console.error("Error uploading QR code:", error);
        alert("Error uploading QR code. Check console for details.");
        return;
      }

      // Once uploaded, save the path to the image in the database
      const qrCodeImagePath = data.path;
      setQrCodeImagePath(qrCodeImagePath); // Update state with file path
      console.log("QR Code uploaded to Supabase:", qrCodeImagePath);
      saveQRCodeToDatabase(qrCodeImagePath);
    } else {
      console.error("QR Code element not found.");
    }
  };

  // Loading State: If user is not authenticated yet, show loading or redirect message
  if (loadingUser) {
    return <div>Loading...</div>;
  }

  // Back button functionality
  const handleBackClick = () => {
    navigate("/dashboard"); // Navigate back to dashboard
  };
  return (
    <div className="container mx-auto p-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
      <button
        onClick={handleBackClick}
        className="mb-4 border border-amber-400 rounded-3xl p-2"
      >
        Back to Dashboard
      </button>
      <h1 className="text-2xl font-semibold text-center text-gray-700 mb-4 col-span-2">
        Student Registration
      </h1>
      {/* Form Section */}
      <div className="border border-amber-200 rounded-lg p-4 shadow-md max-w-sm mx-auto">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="idNumber"
              className="block text-xs font-medium text-gray-600"
            >
              Student ID Number:
            </label>
            <input
              type="text"
              id="idNumber"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-medium text-gray-600"
            >
              Name:
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-xs font-medium text-gray-600"
            >
              Address:
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="yearlevel"
              className="block text-xs font-medium text-gray-600"
            >
              Year Level:
            </label>
            <input
              type="text"
              id="yearlevel"
              value={yearlevel}
              onChange={(e) => setYearlevel(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="section"
              className="block text-xs font-medium text-gray-600"
            >
              Section:
            </label>
            <input
              type="text"
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          >
            Generate QR Code
          </button>
        </form>
      </div>

      {/* QR Code Section */}
      <div className="border border-amber-200 rounded-lg p-4 shadow-md max-w-md mx-auto">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Your QR Code:
        </h3>
        {qrData && (
          <div className="text-center" ref={qrCodeRef}>
            <QRCodeCanvas value={qrData} size={200} className="mx-auto mb-4" />
            <button
              onClick={downloadQRCode}
              className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
            >
              Download QR Code
            </button>

            <div className="mt-4 flex justify-between">
              <button
                onClick={saveQRCodeImage} // Save to Supabase Storage
                className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
              >
                Save to Database
              </button>
              <button
                onClick={cancelSave}
                className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {studentSaved && (
          <p className="text-green-500 mt-4 text-center">
            Student saved successfully!
          </p>
        )}
      </div>
    </div>
  );
}

export default Registration;
