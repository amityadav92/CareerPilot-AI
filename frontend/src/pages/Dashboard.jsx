import { useNavigate } from "react-router-dom";
import {
    logout,
    getStoredUser
} from "../services/authService";

import "./Dashboard.css";

function Dashboard() {

    const navigate = useNavigate();

    const user = getStoredUser() || {};

    const profileFields = [
        user.name,
        user.email,
        user.phone,
        user.location,
        user.education,
        user.skills?.length > 0
    ];

    const completedFields = profileFields.filter(Boolean).length;

    const profileCompletion = Math.round(
        (completedFields / profileFields.length) * 100
    );

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const quickActions = [
        {
            icon: "👤",
            title: "My Profile",
            description: "Update your personal information.",
            button: "Edit Profile →",
            path: "/profile"
        },
        {
            icon: "📄",
            title: "Resume Builder",
            description: "Create and manage your professional resume.",
            button: "Build Resume →",
            path: "/resume"
        },
        {
            icon: "🤖",
            title: "AI Resume Analyzer",
            description: "Analyze your resume and get AI suggestions.",
            button: "Analyze Resume →",
            path: "/resume-analyzer"
        },
        {
            icon: "🎯",
            title: "Job Matcher",
            description: "Find how well your resume matches a job.",
            button: "Match Jobs →",
            path: "/job-matcher"
        },
        {
            icon: "💼",
            title: "Job Tracker",
            description: "Track and manage your job applications.",
            button: "Track Applications →",
            path: "/job-tracker"
        }
    ];

    return (

        <div className="dashboard-page">

            <div className="dashboard-header">

                <div>
                    <h1>Dashboard</h1>

                    <p>
                        Welcome back! Here's your career overview.
                    </p>
                </div>

                <button
                    className="dashboard-logout"
                    onClick={handleLogout}
                    type="button"
                >
                    Logout ↗
                </button>

            </div>

            <div className="welcome-card">

                <div>

                    <span className="welcome-tag">
                        CAREERPILOT AI
                    </span>

                    <h2>
                        Welcome back, {user.name || "User"}! 👋
                    </h2>

                    <p>
                        Build your professional identity and take
                        the next step towards your dream career.
                    </p>

                    <button
                        onClick={() => navigate("/resume")}
                        className="welcome-button"
                        type="button"
                    >
                        Create Your Resume →
                    </button>

                </div>

                <div className="welcome-icon">
                    🚀
                </div>

            </div>

            <div className="dashboard-stats">

                <div className="stat-card">

                    <div className="stat-icon purple">
                        👤
                    </div>

                    <h3>Profile Completion</h3>

                    <h2>{profileCompletion}%</h2>

                    <div className="progress-bar">

                        <div
                            style={{
                                width: `${profileCompletion}%`
                            }}
                        ></div>

                    </div>

                </div>

                <div className="stat-card">

                    <div className="stat-icon blue">
                        📄
                    </div>

                    <h3>Resume Builder</h3>

                    <h2>Ready</h2>

                    <p>Start building your resume</p>

                </div>

                <div className="stat-card">

                    <div className="stat-icon green">
                        🎯
                    </div>

                    <h3>Career Profile</h3>

                    <h2>
                        {user.name ? "Active" : "Pending"}
                    </h2>

                    <p>Your career journey starts here</p>

                </div>

            </div>

            <div className="dashboard-content">

                <div className="dashboard-box">

                    <h2>Quick Actions</h2>

                    <p className="box-subtitle">
                        Manage your career in one place.
                    </p>

                    <div className="quick-actions">

                        {quickActions.map((action) => (

                            <div
                                className="action-card"
                                key={action.path}
                                onClick={() => navigate(action.path)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" ||
                                        event.key === " "
                                    ) {
                                        event.preventDefault();
                                        navigate(action.path);
                                    }
                                }}
                            >

                                <span>{action.icon}</span>

                                <h3>{action.title}</h3>

                                <p>{action.description}</p>

                                <b>{action.button}</b>

                            </div>

                        ))}

                    </div>

                </div>

                <div className="dashboard-box account-box">

                    <h2>Account Information</h2>

                    <div className="account-item">

                        <span>Full Name</span>

                        <strong>
                            {user.name || "Not available"}
                        </strong>

                    </div>

                    <div className="account-item">

                        <span>Email Address</span>

                        <strong>
                            {user.email || "Not available"}
                        </strong>

                    </div>

                    <div className="account-item">

                        <span>Account Status</span>

                        <strong className="active-status">
                            ● Active
                        </strong>

                    </div>

                    <button
                        className="profile-button"
                        onClick={() => navigate("/profile")}
                        type="button"
                    >
                        Manage Profile →
                    </button>

                </div>

            </div>

        </div>

    );

}

export default Dashboard;