import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

const ComingSoon = ({ title }) => (
  <div className="p-10">
    <h1 className="text-3xl font-bold mb-2">{title}</h1>
    <p className="text-gray-600">This page is under construction.</p>
  </div>
);

import Layout from "./components/Layout";
import Home from "./pages/Home";
import CompanyExpenses from "./pages/expenses/CompanyExpenses";
import CompanySales from "./pages/expenses/CompanySales";
import EmployeeSalary from "./pages/expenses/EmployeeSalary";
import Invoices from "./pages/expenses/Invoices";

import BlogPage from "./pages/BlogPage";
import Dashboard from "./pages/Dashboard";
import EmployeeAttendance from "./pages/EmployeeAttendance";
import JobsPage from "./pages/JobsPage";
import MessagesPage from "./pages/Messages";
import NewsletterPage from "./pages/NewsletterPage";
import ProjectsPage from "./pages/ProjectsPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";
import EmployeePage from "./pages/employee/EmployeePage";
import EmployeeViewPage from "./pages/employee/EmployeeViewPage";
import MyProfile from "./pages/MyProfile";
import Settings from "./pages/Settings";

import "./App.css";

export default function App() {
  return (
    <Router>
      <Routes>

        {/* MAIN LAYOUT ROUTES (incoming file) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="home" element={<Home />} />

          <Route path="expenses/salary" element={<EmployeeSalary />} />
          <Route path="expenses/sales" element={<CompanySales />} />
          <Route path="expenses/company-expenses" element={<CompanyExpenses />} />
          <Route path="expenses/invoices" element={<Invoices />} />

          <Route path="jobs" element={<JobsPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="newsletter" element={<NewsletterPage />} />
          <Route path="messages" element={<MessagesPage />} />

          {/* EMPLOYEE ROUTES - Now inside Layout */}
          <Route path="employees" element={<EmployeePage />} />
          <Route path="employee/:id" element={<EmployeeViewPage />} />
          <Route path="employee-attendance" element={<EmployeeAttendance />} />

          <Route path="profile" element={<MyProfile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* AUTH ROUTES - Outside Layout (no sidebar needed) */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

      </Routes>
    </Router>
  );
}
