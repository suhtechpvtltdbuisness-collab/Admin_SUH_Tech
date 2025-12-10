import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import EmployeeSalary from "./pages/expenses/EmployeeSalary";
import CompanySales from "./pages/expenses/CompanySales";
import CompanyExpenses from "./pages/expenses/CompanyExpenses";
import Invoices from "./pages/expenses/Invoices";

import Dashboard from "./pages/Dashboard";
import EmployeePage from "./pages/employee/EmployeePage";
import EmployeeViewPage from "./pages/employee/EmployeeViewPage";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";

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

          {/* EMPLOYEE ROUTES */}
          <Route path="/employees" element={<EmployeePage />} />
          <Route path="/employee/:id" element={<EmployeeViewPage />} />
        </Route>

        {/* DIRECT PAGES (current file) */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

      </Routes>
    </Router>
  );
}
