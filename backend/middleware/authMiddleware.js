const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {

    try {

        if (!process.env.JWT_SECRET) {

            console.error("JWT_SECRET is missing");

            return res.status(500).json({
                success: false,
                message: "Server authentication configuration error"
            });

        }

        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login."
            });

        }

        const token = authHeader.substring(7).trim();

        if (!token) {

            return res.status(401).json({
                success: false,
                message: "Authentication token is missing"
            });

        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            {
                algorithms: ["HS256"]
            }
        );

        if (
            !decoded ||
            typeof decoded !== "object" ||
            typeof decoded.id !== "string"
        ) {

            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });

        }

        if (!/^[a-fA-F0-9]{24}$/.test(decoded.id)) {

            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });

        }

        const user = await User.findById(decoded.id)
            .select("-password");

        if (!user) {

            return res.status(401).json({
                success: false,
                message: "User not found. Please login again."
            });

        }

        req.user = user;

        return next();

    } catch (error) {

        if (error.name === "TokenExpiredError") {

            return res.status(401).json({
                success: false,
                message: "Session expired. Please login again."
            });

        }

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "NotBeforeError"
        ) {

            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });

        }

        console.error(
            "Authentication Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Authentication server error"
        });

    }

};

module.exports = { protect };