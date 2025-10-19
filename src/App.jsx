// App.jsx

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

// Import your views or components
import Dashboard from "./views/DashboardView";
import Registration from "./views/login/RegistrationOfStudents";
import SignIn from "./views/AttendanceChecker/SignIn";
import LoginForm from "./views/login/loginUserRegistered";
import SignOut from "./views/AttendanceChecker/SignOut";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<LoginForm />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signout" element={<SignOut />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
