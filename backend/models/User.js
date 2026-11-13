const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(

    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must contain at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: [254, "Email is too long"],
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please enter a valid email address"
            ]
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must contain at least 6 characters"],
            maxlength: [72, "Password cannot exceed 72 characters"]
        },

        profileImage: {
            type: String,
            default: "",
            maxlength: [500, "Profile image path is too long"]
        },

        skills: {
            type: [
                {
                    type: String,
                    trim: true,
                    maxlength: 50
                }
            ],
            default: []
        },

        education: {
            type: String,
            default: "",
            maxlength: [1000, "Education information is too long"]
        },

        experience: {
            type: String,
            default: "",
            maxlength: [3000, "Experience information is too long"]
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        }

    },

    {
        timestamps: true
    }

);

module.exports = mongoose.model("User", userSchema);