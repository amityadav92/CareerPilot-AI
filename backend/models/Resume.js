const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        name: {
            type: String,
            default: "",
            trim: true,
            maxlength: 100
        },

        email: {
            type: String,
            default: "",
            trim: true,
            lowercase: true,
            maxlength: 254
        },

        phone: {
            type: String,
            default: "",
            trim: true,
            maxlength: 20
        },

        location: {
            type: String,
            default: "",
            trim: true,
            maxlength: 150
        },

        linkedin: {
            type: String,
            default: "",
            trim: true,
            maxlength: 500
        },

        github: {
            type: String,
            default: "",
            trim: true,
            maxlength: 500
        },

        summary: {
            type: String,
            default: "",
            trim: true,
            maxlength: 3000
        },

        degree: {
            type: String,
            default: "",
            trim: true,
            maxlength: 200
        },

        college: {
            type: String,
            default: "",
            trim: true,
            maxlength: 300
        },

        graduationYear: {
            type: String,
            default: "",
            trim: true,
            maxlength: 10
        },

        skills: {
            type: String,
            default: "",
            trim: true,
            maxlength: 2000
        },

        experience: {
            type: String,
            default: "",
            trim: true,
            maxlength: 5000
        },

        projects: {
            type: String,
            default: "",
            trim: true,
            maxlength: 5000
        },

        certifications: {
            type: [String],
            default: [],
            validate: {
                validator: function (value) {
                    return value.length <= 50;
                },
                message: "Maximum 50 certifications are allowed."
            }
        }
    },

    {
        timestamps: true
    }
);

const Resume = mongoose.model("Resume", resumeSchema);

module.exports = Resume;