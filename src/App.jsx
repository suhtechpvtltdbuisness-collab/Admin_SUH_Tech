import React, { Suspense, lazy } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

const ComingSoon = ({ title }) => (
  <div className="p-10">
    <h1 className="text-3xl font-bold mb-2">{title}</h1>
    <p className="text-gray-600">This page is under construction.</p>
  </div>
);

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
  </div>
);

import Layout from "./components/Layout";

// Lazy loaded components
const Home = lazy(() => import("./pages/Home"));
const CompanyExpenses = lazy(() => import("./pages/expenses/CompanyExpenses"));
const CompanySales = lazy(() => import("./pages/expenses/CompanySales"));
const EmployeeSalary = lazy(() => import("./pages/expenses/EmployeeSalary"));
const Invoices = lazy(() => import("./pages/expenses/Invoices"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const EmployeeAttendance = lazy(() => import("./pages/EmployeeAttendance"));
const JobsPage = lazy(() => import("./pages/JobsPage"));
const MessagesPage = lazy(() => import("./pages/Messages"));
const NewsletterPage = lazy(() => import("./pages/NewsletterPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ClientsPage = lazy(() => import("./pages/ClientsPage"));
const ClientViewPage = lazy(() => import("./pages/ClientViewPage"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const Login = lazy(() => import("./pages/auth/Login"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const EmployeePage = lazy(() => import("./pages/employee/EmployeePage"));
const EmployeeViewPage = lazy(() => import("./pages/employee/EmployeeViewPage"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const Settings = lazy(() => import("./pages/Settings"));

import "./App.css";

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
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
            <Route path="clients" element={<ClientsPage />} />
            <Route path="client/:id" element={<ClientViewPage />} />
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
      </Suspense>
    </Router>
  );
}
