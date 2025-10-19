import "../styles/styles.css";
import React, { useEffect, useState } from "react";
import { supabase } from "../database/supabaseClient"; // Assuming path
import { useNavigate } from "react-router-dom"; // Assuming you're using react-router-dom

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [totalTimeInUsers, setTotalTimeInUsers] = useState(0); // State to store the count of TimeIn users
  const [totalTimeOutUsers, setTotalTimeOutUsers] = useState(0); // State to store the count of TimeOut users
  const navigate = useNavigate(); // Initialize navigate function

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
  }, [navigate]); // Add navigate to dependency array

  useEffect(() => {
    const fetchTotalTimeInUsers = async () => {
      // Calling the RPC function
      const { data, error } = await supabase.rpc("timeInCounting");

      if (error) {
        console.error("Error fetching total TimeIn users:", error);
      } else {
        // Ensure that the data contains the count returned by the function
        setTotalTimeInUsers(data || 0); // Set the total count of users with valid time_in
        console.log("Total TimeIn Users:", data); // For debugging purposes
      }
    };

    const fetchTotalTimeOutUsers = async () => {
      // Calling the RPC function
      const { data, error } = await supabase.rpc("timeOutCounting");

      if (error) {
        console.error("Error fetching total TimeOut users:", error);
      } else {
        // Ensure that the data contains the count returned by the function
        setTotalTimeOutUsers(data || 0); // Set the total count of users with valid time_out
        console.log("Total TimeOut Users:", data); // For debugging purposes
      }
    };

    fetchTotalTimeInUsers();
    fetchTotalTimeOutUsers();
  }, []); // This effect runs only once when the component mounts

  return (
    <div className="flex h-screen-md w-full border border-amber-400 rounded-3xl p-2">
      {/* Sidebar */}
      <div className="w-64 bg-transparent text-gray-100 p-5 flex-shrink-0">
        {/* Avatar Section */}
        <div className="flex items-center mb-6">
          {/* Avatar Image */}
          <img
            src="/avatar.jpg" // Path relative to the 'public' folder
            alt="User Avatar"
            className="w-16 h-16 rounded-full border-2 border-amber-400 mr-4"
          />
          {/* User Name (if available) */}
          <div className="text-lg font-semibold text-gray-100">
            "Niko Polistico"
          </div>
        </div>
        <ul>
          <li className="mb-4 border border-amber-400 rounded-3xl p-2">
            <a href="/register" className="hover:text-blue-300">
              Generate QRCode
            </a>
          </li>
          <li className="mb-4 border border-amber-400 rounded-3xl p-2">
            <a href="/signin" className="hover:text-blue-300">
              SignIn
            </a>
          </li>
          <li className="mb-4 border border-amber-400 rounded-3xl p-2">
            <a href="/signout" className="hover:text-blue-300">
              SignOut
            </a>
          </li>
          <li className="mb-4 border border-amber-400 rounded-3xl p-2">
            <a href="/logout" className="hover:text-blue-300">
              Logout
            </a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-8 overflow-auto">
        <h1 className="text-3xl font-semibold text-gray-100 mb-8 border-b border-amber-400 pb-4">
          Welcome to Your Dashboard
        </h1>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-lg shadow-lg">
            <h3 className="text-xl text-gray-700 mb-2">Total TimeIn Users</h3>
            <p className="text-3xl font-semibold text-blue-600">
              {totalTimeInUsers}
            </p>{" "}
            {/* Display the fetched count */}
          </div>
          <div className="p-6 rounded-lg shadow-lg">
            <h3 className="text-xl text-gray-700 mb-2">Total TimeOut Users</h3>
            <p className="text-3xl font-semibold text-blue-600">
              {totalTimeOutUsers}
            </p>{" "}
          </div>
          <div className="p-6 rounded-lg shadow-lg">
            <h3 className="text-xl text-gray-700 mb-2">Total Pass</h3>
            <p className="text-3xl font-semibold text-blue-600">5</p>
          </div>
          <div className="p-6 rounded-lg shadow-lg">
            <h3 className="text-xl text-gray-700 mb-2">Total Not Pass</h3>
            <p className="text-3xl font-semibold text-blue-600">5</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
