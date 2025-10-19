import React, { useState } from "react";
import { supabase } from "../../database/supabaseClient"; // Import your Supabase client
import { useNavigate } from "react-router-dom"; // Import useNavigate for React Router v6
import { FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons for email and password visibility
import DOMPurify from "dompurify"; // For input sanitization

const LoginForm = () => {
  const [email, setEmail] = useState(""); // Store email input
  const [password, setPassword] = useState(""); // Store password input
  const [error, setError] = useState(null); // Store error message
  const [loading, setLoading] = useState(false); // Loading state
  const [showPassword, setShowPassword] = useState(false); // Track password visibility
  const navigate = useNavigate(); // Initialize navigate for redirection

  // Sanitize input function
  const sanitizeInput = (input) => {
    return DOMPurify.sanitize(input); // Sanitize input fields
  };

  // Validate email
  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
  };

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission

    setLoading(true); // Set loading state to true
    setError(null); // Clear any previous errors

    // Sanitize and validate the email and password
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    if (!validateEmail(sanitizedEmail)) {
      setError("Please enter a valid email.");
      setLoading(false);
      return;
    }

    try {
      // Call Supabase login function to sign in with email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword,
      });

      if (error) {
        throw error; // If there's an error, throw it to handle it in the catch block
      }

      console.log("User logged in:", data);
      navigate("/dashboard"); // Redirect to home page
    } catch (error) {
      setError(error.message); // Show error message if login fails
      console.error("Error logging in:", error.message);
    } finally {
      setLoading(false); // Set loading state to false once login is complete
    }
  };

  return (
    <div className="login-form border border-amber-400 p-8 rounded-lg shadow-lg max-w-lg mx-auto mt-10 text-white">
      <h2 className="text-center mb-6 text-3xl font-semibold">
        Login My Admin
      </h2>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-6">
        {/* Email Field */}
        <div className="relative">
          <label htmlFor="email" className="block text-sm font-medium">
            Email:
          </label>
          <div className="flex items-center border border-gray-300 rounded-md">
            <FaEnvelope className="ml-2 text-gray-400" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update email state on change
              required
              className="w-full p-2 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              placeholder="Enter your email"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="relative">
          <label htmlFor="password" className="block text-sm font-medium">
            Password:
          </label>
          <div className="flex items-center border border-gray-300 rounded-md">
            <input
              type={showPassword ? "text" : "password"} // Toggle password visibility
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Update password state on change
              required
              className="w-full p-2 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              placeholder="Enter your password"
            />
            {/* Password visibility toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="mr-2 text-gray-400"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading} // Disable button while loading
          className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
        >
          {loading ? "Logging in..." : "Login"} {/* Show loading text */}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
