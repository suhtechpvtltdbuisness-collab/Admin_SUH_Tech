import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import CompanyExpenses from "./pages/expenses/CompanyExpenses";
import CompanySales from "./pages/expenses/CompanySales";
import EmployeeSalary from "./pages/expenses/EmployeeSalary";
import Invoices from "./pages/expenses/Invoices";

import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";
import EmployeePage from "./pages/employee/EmployeePage";
import EmployeeViewPage from "./pages/employee/EmployeeViewPage";

import "./App.css";

export default function App() {
  return (
    <Router>
      <Routes>

        {/* MAIN LAYOUT ROUTES (incoming file) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />

          <Route path="expenses/salary" element={<EmployeeSalary />} />
          <Route path="expenses/sales" element={<CompanySales />} />
          <Route path="expenses/company-expenses" element={<CompanyExpenses />} />
          <Route path="expenses/invoices" element={<Invoices />} />
        </Route>

        {/* DIRECT PAGES (current file) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<EmployeePage />} />

        {/* EMPLOYEE VIEW PAGE */}
        <Route path="/employee/:id" element={<EmployeeViewPage />} />

        {/* AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

      </Routes>
    </Router>
  );
}
