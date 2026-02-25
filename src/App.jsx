import React, { Suspense, lazy } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";

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

// Guard: redirect to /login if no auth token is present
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

import Layout from "./components/layout/Layout";

// Lazy loaded components
const Home = lazy(() => import("./pages/dashboard/Home"));
const CompanyExpenses = lazy(() => import("./pages/finance/CompanyExpenses"));
const CompanySales = lazy(() => import("./pages/finance/CompanySales"));
const EmployeeSalary = lazy(() => import("./pages/finance/EmployeeSalary"));
const Invoices = lazy(() => import("./pages/finance/Invoices"));
const BlogPage = lazy(() => import("./pages/content/BlogPage"));
const Dashboard = lazy(() => import("./pages/dashboard/DashboardPage"));
const EmployeeAttendance = lazy(() => import("./pages/hrms/EmployeeAttendance"));
const JobsPage = lazy(() => import("./pages/jobs/JobsPage"));
const MessagesPage = lazy(() => import("./pages/messages/MessagesPage"));
const NewsletterPage = lazy(() => import("./pages/content/NewsletterPage"));
const ProjectsPage = lazy(() => import("./pages/projects/ProjectsPage"));
const ClientsPage = lazy(() => import("./pages/clients/ClientsPage"));
const ClientViewPage = lazy(() => import("./pages/clients/ClientViewPage"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const Login = lazy(() => import("./pages/auth/Login"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const EmployeePage = lazy(() => import("./pages/hrms/EmployeePage"));
const EmployeeViewPage = lazy(() => import("./pages/hrms/EmployeeViewPage"));
const MyProfile = lazy(() => import("./pages/settings/MyProfile"));
const Settings = lazy(() => import("./pages/settings/SettingsPage"));

import "./App.css";

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* MAIN LAYOUT ROUTES (incoming file) */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
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
