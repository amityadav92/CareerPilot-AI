import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ======================================
// IMPORT PAGES
// ======================================

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Resume from "./pages/Resume";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import JobMatcher from "./pages/JobMatcher";
import JobTracker from "./pages/JobTracker";
import AdminDashboard from "./pages/AdminDashboard";

// ======================================
// IMPORT COMPONENTS
// ======================================

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import MainLayout from "./components/MainLayout";

// ======================================
// IMPORT CSS
// ======================================

import "./App.css";

// ======================================
// MAIN APP COMPONENT
// ======================================

function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* DEFAULT ROUTE */}

                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                {/* PUBLIC ROUTES */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* PROTECTED ROUTES */}

                <Route element={<ProtectedRoute />}>

                    {/* MAIN LAYOUT */}

                    <Route element={<MainLayout />}>

                        {/* ==================================
                            ADMIN ONLY ROUTE
                        ================================== */}

                        <Route element={<AdminRoute />}>

                            <Route
                                path="/admin"
                                element={<AdminDashboard />}
                            />

                        </Route>

                        {/* ==================================
                            USER DASHBOARD
                        ================================== */}

                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />

                        {/* USER PROFILE */}

                        <Route
                            path="/profile"
                            element={<Profile />}
                        />

                        {/* RESUME BUILDER */}

                        <Route
                            path="/resume"
                            element={<Resume />}
                        />

                        {/* AI RESUME ANALYZER */}

                        <Route
                            path="/resume-analyzer"
                            element={<ResumeAnalyzer />}
                        />

                        {/* AI JOB MATCHER */}

                        <Route
                            path="/job-matcher"
                            element={<JobMatcher />}
                        />

                        {/* JOB APPLICATION TRACKER */}

                        <Route
                            path="/job-tracker"
                            element={<JobTracker />}
                        />

                    </Route>

                </Route>

                {/* PAGE NOT FOUND */}

                <Route
                    path="*"
                    element={<Navigate to="/login" replace />}
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;