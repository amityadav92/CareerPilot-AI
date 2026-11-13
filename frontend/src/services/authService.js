import API from "./api";

// ======================================
// USER REGISTRATION
// ======================================

export const register = async (userData) => {
    try {
        const response = await API.post(
            "/auth/register",
            userData
        );

        // Save JWT Token
        if (response.data.token) {
            localStorage.setItem(
                "token",
                response.data.token
            );
        }

        // Save User Details
        if (response.data.user) {
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );
        }

        return response.data;

    } catch (error) {
        console.error(
            "Registration Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


// ======================================
// USER LOGIN
// ======================================

export const login = async (credentials) => {
    try {
        const response = await API.post(
            "/auth/login",
            credentials
        );

        // Save JWT Token
        if (response.data.token) {
            localStorage.setItem(
                "token",
                response.data.token
            );
        }

        // Save User Details
        if (response.data.user) {
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );
        }

        return response.data;

    } catch (error) {
        console.error(
            "Login Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


// ======================================
// GET LOGGED-IN USER
// ======================================

export const getMe = async () => {
    try {
        const response = await API.get("/auth/me");

        if (response.data.user) {
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );
        }

        return response.data;

    } catch (error) {
        console.error(
            "Get User Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


// ======================================
// LOGOUT USER
// ======================================

export const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

};


// ======================================
// CHECK AUTHENTICATION
// ======================================

export const isAuthenticated = () => {

    return Boolean(localStorage.getItem("token"));

};


// ======================================
// GET STORED USER
// ======================================

export const getStoredUser = () => {

    try {
        const user = localStorage.getItem("user");

        return user ? JSON.parse(user) : null;

    } catch (error) {
        console.error("User Data Error:", error);

        return null;
    }

};
