const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const resumeAnalyzerRoutes = require("./routes/resumeAnalyzerRoutes");
const jobApplicationRoutes = require("./routes/jobApplicationRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({
    extended: true,
    limit: "10mb"
}));

app.use((req, res, next) => {

    if (process.env.NODE_ENV !== "production") {

        console.log(
            `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
        );

    }

    next();
});

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        message: "CareerPilot AI Backend is Running 🚀"
    });

});

app.get("/api/health", (req, res) => {

    res.status(200).json({
        success: true,
        message: "CareerPilot AI API is Healthy",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString()
    });

});

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/resume", resumeRoutes);

app.use("/api/resume-analyzer", resumeAnalyzerRoutes);

app.use("/api/jobs", jobApplicationRoutes);

app.use("/api/admin", adminRoutes);

app.use((req, res) => {

    res.status(404).json({

        success: false,
        message: "API Route Not Found",

        path: req.originalUrl

    });

});

app.use((err, req, res, next) => {

    console.error("SERVER ERROR:", err);

    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.status || err.statusCode || 500;

    res.status(statusCode).json({

        success: false,

        message:
            statusCode === 500
                ? "Internal Server Error"
                : err.message || "Something went wrong"

    });

});

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {

    try {

        await connectDB();

        console.log("MongoDB Connected Successfully!");

        server = app.listen(PORT, () => {

            console.log("================================");
            console.log("CareerPilot AI Server Started");
            console.log(`Port: ${PORT}`);
            console.log(`URL: http://localhost:${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
            console.log("================================");

        });

    } catch (error) {

        console.error(
            "Server Startup Failed:",
            error.message
        );

        process.exit(1);

    }

};

const shutdownServer = (signal) => {

    console.log(`${signal} received. Shutting down server...`);

    if (server) {

        server.close(() => {

            console.log("Server closed successfully.");

            process.exit(0);

        });

    } else {

        process.exit(0);

    }

};

process.on("SIGTERM", () => {
    shutdownServer("SIGTERM");
});

process.on("SIGINT", () => {
    shutdownServer("SIGINT");
});

startServer();