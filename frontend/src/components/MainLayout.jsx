import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout, getStoredUser } from "../services/authService";
import "./MainLayout.css";

function MainLayout() {

    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const user = getStoredUser() || {};

    const isAdmin = user.role?.toLowerCase() === "admin";

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const handleLogout = () => {

        closeSidebar();

        logout();

        navigate("/login", { replace: true });

    };

    const menuItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: "🏠"
        },
        {
            name: "My Profile",
            path: "/profile",
            icon: "👤"
        },
        {
            name: "Resume Builder",
            path: "/resume",
            icon: "📄"
        },
        {
            name: "AI Resume Analyzer",
            path: "/resume-analyzer",
            icon: "🤖"
        },
        {
            name: "Job Matcher",
            path: "/job-matcher",
            icon: "🎯"
        },
        {
            name: "Job Tracker",
            path: "/job-tracker",
            icon: "💼"
        }
    ];

    useEffect(() => {

        const handleEscape = (event) => {

            if (event.key === "Escape") {
                closeSidebar();
            }

        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };

    }, []);

    return (

        <div className="app-layout">

            <header className="mobile-topbar">

                <button
                    className="mobile-menu-btn"
                    type="button"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    aria-label="Toggle navigation menu"
                    aria-expanded={isSidebarOpen}
                    aria-controls="app-sidebar"
                >

                    {isSidebarOpen ? "✕" : "☰"}

                </button>

                <h2>🚀 CareerPilot</h2>

            </header>

            {isSidebarOpen && (

                <div
                    className="sidebar-overlay"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />

            )}

            <aside
                id="app-sidebar"
                className={`app-sidebar ${isSidebarOpen ? "open" : ""}`}
            >

                <div className="sidebar-brand">

                    <h2>🚀 CareerPilot</h2>

                    <span>AI Career Platform</span>

                </div>

                <div className="sidebar-user">

                    <div className="sidebar-avatar">

                        {user.name
                            ? user.name.charAt(0).toUpperCase()
                            : "U"}

                    </div>

                    <div className="sidebar-user-info">

                        <h4>{user.name || "User"}</h4>

                        <p>{user.email || "Welcome"}</p>

                    </div>

                </div>

                <div className="sidebar-menu">

                    <p className="sidebar-heading">
                        MAIN MENU
                    </p>

                    {menuItems.map((item) => (

                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={closeSidebar}
                            className={({ isActive }) =>
                                isActive
                                    ? "sidebar-link active"
                                    : "sidebar-link"
                            }
                        >

                            <span className="sidebar-icon">
                                {item.icon}
                            </span>

                            <span>
                                {item.name}
                            </span>

                        </NavLink>

                    ))}

                    {isAdmin && (

                        <>

                            <p className="sidebar-heading">
                                ADMINISTRATION
                            </p>

                            <NavLink
                                to="/admin"
                                onClick={closeSidebar}
                                className={({ isActive }) =>
                                    isActive
                                        ? "sidebar-link active"
                                        : "sidebar-link"
                                }
                            >

                                <span className="sidebar-icon">
                                    🛡️
                                </span>

                                <span>
                                    Admin Panel
                                </span>

                            </NavLink>

                        </>

                    )}

                </div>

                <div className="sidebar-bottom">

                    <button
                        onClick={handleLogout}
                        className="sidebar-logout"
                        type="button"
                    >

                        🚪 Logout

                    </button>

                    <p>
                        CareerPilot AI © 2026
                    </p>

                </div>

            </aside>

            <main className="app-main">

                <Outlet />

            </main>

        </div>

    );

}

export default MainLayout;