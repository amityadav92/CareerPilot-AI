import API from "./api";

// ======================================
// 1. GET ADMIN DASHBOARD STATISTICS
// ======================================

export const getAdminStats = async () => {
    const response = await API.get("/admin/stats");

    return response.data;
};


// ======================================
// 2. GET ALL USERS
// SEARCH + FILTER + PAGINATION
// ======================================

export const getAllUsers = async (params = {}) => {
    const response = await API.get("/admin/users", {
        params: {
            search: params.search || "",
            role: params.role || "",
            page: params.page || 1,
            limit: params.limit || 10,
        },
    });

    return response.data;
};


// ======================================
// 3. GET SINGLE USER
// ======================================

export const getUserById = async (userId) => {
    const response = await API.get(
        `/admin/users/${userId}`
    );

    return response.data;
};


// ======================================
// 4. UPDATE USER ROLE
// ======================================

export const updateUserRole = async (userId, role) => {
    const response = await API.patch(
        `/admin/users/${userId}/role`,
        { role }
    );

    return response.data;
};


// ======================================
// 5. DELETE USER
// ======================================

export const deleteUser = async (userId) => {
    const response = await API.delete(
        `/admin/users/${userId}`
    );

    return response.data;
};