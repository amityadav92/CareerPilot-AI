const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing in .env");
    }

    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
            algorithm: "HS256"
        }
    );

};

const isValidEmail = (email) => {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return (
        typeof email === "string" &&
        email.length <= 254 &&
        emailRegex.test(email)
    );

};

exports.registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.body || {};

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });

        }

        if (
            typeof name !== "string" ||
            name.trim().length < 2 ||
            name.trim().length > 50
        ) {

            return res.status(400).json({
                success: false,
                message: "Name must be between 2 and 50 characters"
            });

        }

        if (typeof email !== "string") {

            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });

        }

        const normalizedEmail = email.toLowerCase().trim();

        if (!isValidEmail(normalizedEmail)) {

            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });

        }

        if (
            typeof password !== "string" ||
            password.length < 6 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {

            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters and cannot exceed 72 UTF-8 bytes"
            });

        }

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "User already exists"
            });

        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({

            name: name.trim(),

            email: normalizedEmail,

            password: hashedPassword

        });

        const token = generateToken(user._id);

        return res.status(201).json({

            success: true,

            message: "User registered successfully",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }

        });

    } catch (error) {

        console.error("Registration Error:", error.message);

        if (error.code === 11000) {

            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });

        }

        if (error.name === "ValidationError") {

            return res.status(400).json({
                success: false,
                message: error.message
            });

        }

        return res.status(500).json({

            success: false,

            message: "Server error during registration"

        });

    }

};

exports.loginUser = async (req, res) => {

    try {

        const { email, password } = req.body || {};

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });

        }

        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid input format"
            });

        }

        const normalizedEmail = email.toLowerCase().trim();

        if (!isValidEmail(normalizedEmail)) {

            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });

        }

        if (Buffer.byteLength(password, "utf8") > 72) {

            return res.status(400).json({
                success: false,
                message: "Invalid password"
            });

        }

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }

        const token = generateToken(user._id);

        return res.status(200).json({

            success: true,

            message: "Login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }

        });

    } catch (error) {

        console.error("Login Error:", error.message);

        return res.status(500).json({

            success: false,

            message: "Server error during login"

        });

    }

};

exports.getMe = async (req, res) => {

    try {

        if (!req.user || !req.user._id) {

            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });

        }

        const user = await User.findById(req.user._id)
            .select("-password");

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        return res.status(200).json({

            success: true,

            message: "User profile fetched successfully",

            user

        });

    } catch (error) {

        console.error("Profile Error:", error.message);

        return res.status(500).json({

            success: false,

            message: "Server error while fetching profile"

        });

    }

};
