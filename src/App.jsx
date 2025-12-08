import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import EmployeePage from "./pages/EmployeePage";
import EmployeeViewPage from "./pages/EmployeeViewPage";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<EmployeePage />} />

        {/* EMPLOYEE VIEW PAGE */}
        <Route path="/employee/:id" element={<EmployeeViewPage />} />
        
        {/* login  */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}
