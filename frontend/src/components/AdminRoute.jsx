import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {

    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("user") || "null");
    } catch (error) {
        user = null;
    }

    if (!user || user.role?.toLowerCase() !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;

};

export default AdminRoute;