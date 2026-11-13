import { useEffect, useState } from "react";
import API from "../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {

    const [statistics, setStatistics] = useState({});
    const [recentUsers, setRecentUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    const [updatingUser, setUpdatingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);

    const limit = 10;

    const fetchDashboardStats = async () => {

        try {

            const response = await API.get("/admin/stats");

            if (response.data.success) {

                setStatistics(response.data.statistics || {});

                setRecentUsers(response.data.recentUsers || []);

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Failed to load dashboard statistics."
            );

        }

    };

    const fetchAllUsers = async () => {

        try {

            setUsersLoading(true);
            setError("");

            const response = await API.get("/admin/users", {

                params: {
                    search,
                    role,
                    page,
                    limit
                }

            });

            if (response.data.success) {

                setAllUsers(response.data.users || []);

                setTotalUsers(response.data.totalUsers || 0);

                setTotalPages(response.data.totalPages || 1);

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Failed to load users."
            );

        } finally {

            setUsersLoading(false);

        }

    };

    const fetchDashboardData = async () => {

        try {

            setLoading(true);
            setError("");

            await Promise.all([
                fetchDashboardStats(),
                fetchAllUsers()
            ]);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        if (loading) return;

        const timer = setTimeout(() => {

            fetchAllUsers();

        }, 400);

        return () => clearTimeout(timer);

    }, [search, role, page]);

    useEffect(() => {

        fetchDashboardData();

    }, []);

    const handleSearch = (e) => {

        setSearch(e.target.value);
        setPage(1);

    };

    const handleRoleFilter = (e) => {

        setRole(e.target.value);
        setPage(1);

    };

    const handleUpdateRole = async (userId, newRole) => {

        const confirmUpdate = window.confirm(
            `Are you sure you want to change this user's role to ${newRole}?`
        );

        if (!confirmUpdate) return;

        try {

            setUpdatingUser(userId);
            setError("");
            setSuccess("");

            const response = await API.patch(
                `/admin/users/${userId}/role`,
                {
                    role: newRole
                }
            );

            if (response.data.success) {

                setSuccess(
                    response.data.message ||
                    "User role updated successfully."
                );

                await Promise.all([
                    fetchAllUsers(),
                    fetchDashboardStats()
                ]);

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to update user role."
            );

            await fetchAllUsers();

        } finally {

            setUpdatingUser(null);

        }

    };

    const handleDeleteUser = async (userId) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this user? This action cannot be undone."
        );

        if (!confirmDelete) return;

        try {

            setDeletingUser(userId);
            setError("");
            setSuccess("");

            const response = await API.delete(
                `/admin/users/${userId}`
            );

            if (response.data.success) {

                setSuccess(
                    response.data.message ||
                    "User deleted successfully."
                );

                await fetchDashboardStats();

                if (allUsers.length === 1 && page > 1) {

                    setPage((prev) => prev - 1);

                } else {

                    await fetchAllUsers();

                }

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to delete user."
            );

        } finally {

            setDeletingUser(null);

        }

    };

    const handleRefresh = async () => {

        setSuccess("");
        setError("");

        await fetchDashboardData();

    };

    if (loading) {

        return (

            <div className="admin-loading">

                Loading Dashboard...

            </div>

        );

    }

    return (

        <div className="admin-dashboard">

            <div className="admin-header">

                <div>

                    <h1>Admin Dashboard</h1>

                    <p>
                        Manage CareerPilot AI platform
                    </p>

                </div>

                <button
                    onClick={handleRefresh}
                    disabled={usersLoading}
                >
                    Refresh Data
                </button>

            </div>

            {success && (

                <div className="admin-success">

                    {success}

                </div>

            )}

            {error && (

                <div className="admin-error">

                    {error}

                </div>

            )}

            <div className="admin-stats-grid">

                <div className="admin-stat-card">

                    <h3>Total Users</h3>

                    <h2>
                        {statistics.totalUsers || 0}
                    </h2>

                </div>

                <div className="admin-stat-card">

                    <h3>Total Admins</h3>

                    <h2>
                        {statistics.totalAdmins || 0}
                    </h2>

                </div>

                <div className="admin-stat-card">

                    <h3>Normal Users</h3>

                    <h2>
                        {statistics.totalNormalUsers || 0}
                    </h2>

                </div>

                <div className="admin-stat-card">

                    <h3>New Users (7 Days)</h3>

                    <h2>
                        {statistics.newUsersLast7Days || 0}
                    </h2>

                </div>

            </div>

            <section className="admin-section">

                <h2>Recent Registered Users</h2>

                <div className="admin-table-wrapper">

                    <table>

                        <thead>

                            <tr>

                                <th>Name</th>

                                <th>Email</th>

                                <th>Role</th>

                                <th>Joined</th>

                            </tr>

                        </thead>

                        <tbody>

                            {recentUsers.length > 0 ? (

                                recentUsers.map((user) => (

                                    <tr key={user._id}>

                                        <td>{user.name}</td>

                                        <td>{user.email}</td>

                                        <td>

                                            <span className={`role-badge ${user.role}`}>

                                                {user.role}

                                            </span>

                                        </td>

                                        <td>

                                            {user.createdAt

                                                ? new Date(
                                                    user.createdAt
                                                ).toLocaleDateString()

                                                : "N/A"

                                            }

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>

                                    <td colSpan="4">

                                        No recent users found.

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </section>

            <section className="admin-section">

                <h2>User Management</h2>

                <div className="admin-user-controls">

                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={handleSearch}
                    />

                    <select
                        value={role}
                        onChange={handleRoleFilter}
                    >

                        <option value="">
                            All Roles
                        </option>

                        <option value="user">
                            Normal User
                        </option>

                        <option value="admin">
                            Admin
                        </option>

                    </select>

                </div>

                <div className="admin-table-wrapper">

                    <table>

                        <thead>

                            <tr>

                                <th>Name</th>

                                <th>Email</th>

                                <th>Role</th>

                                <th>Action</th>

                            </tr>

                        </thead>

                        <tbody>

                            {usersLoading ? (

                                <tr>

                                    <td colSpan="4">

                                        Loading users...

                                    </td>

                                </tr>

                            ) : allUsers.length > 0 ? (

                                allUsers.map((user) => (

                                    <tr key={user._id}>

                                        <td>{user.name}</td>

                                        <td>{user.email}</td>

                                        <td>

                                            <select
                                                value={user.role}
                                                disabled={updatingUser === user._id}
                                                onChange={(e) =>

                                                    handleUpdateRole(
                                                        user._id,
                                                        e.target.value
                                                    )

                                                }
                                            >

                                                <option value="user">
                                                    User
                                                </option>

                                                <option value="admin">
                                                    Admin
                                                </option>

                                            </select>

                                        </td>

                                        <td>

                                            <button
                                                className="delete-user-btn"
                                                disabled={deletingUser === user._id}
                                                onClick={() =>
                                                    handleDeleteUser(user._id)
                                                }
                                            >

                                                {deletingUser === user._id

                                                    ? "Deleting..."

                                                    : "Delete"

                                                }

                                            </button>

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>

                                    <td colSpan="4">

                                        No users found.

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

                <div className="admin-pagination">

                    <div>

                        Showing {allUsers.length} of {totalUsers} users

                    </div>

                    <div className="pagination-buttons">

                        <button
                            disabled={page <= 1 || usersLoading}
                            onClick={() =>
                                setPage((prev) => prev - 1)
                            }
                        >

                            Previous

                        </button>

                        <span>

                            Page {page} of {totalPages}

                        </span>

                        <button
                            disabled={page >= totalPages || usersLoading}
                            onClick={() =>
                                setPage((prev) => prev + 1)
                            }
                        >

                            Next

                        </button>

                    </div>

                </div>

            </section>

        </div>

    );

}

export default AdminDashboard;