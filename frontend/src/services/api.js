import axios from "axios";

// ======================================
// AXIOS API CONFIGURATION
// ======================================

const API = axios.create({

    baseURL: "http://localhost:5000/api",

    timeout: 30000,

});

// ======================================
// REQUEST INTERCEPTOR
// AUTOMATIC JWT TOKEN ATTACHMENT
// ======================================

API.interceptors.request.use(

    (config) => {

        const token = localStorage.getItem("token");

        if (token) {

            config.headers.Authorization = `Bearer ${token}`;

        }

        return config;

    },

    (error) => {

        return Promise.reject(error);

    }

);

// ======================================
// RESPONSE INTERCEPTOR
// GLOBAL ERROR HANDLING
// ======================================

API.interceptors.response.use(

    (response) => {

        return response;

    },

    (error) => {

        // Unauthorized Access

        if (error.response?.status === 401) {

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            // Redirect to login

            if (window.location.pathname !== "/login") {

                window.location.href = "/login";

            }

        }

        return Promise.reject(error);

    }

);

// ======================================
// EXPORT API
// ======================================

export default API;