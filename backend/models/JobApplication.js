const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(

    {

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
            index: true
        },

        companyName: {
            type: String,
            required: [true, "Company name is required"],
            trim: true,
            maxlength: [100, "Company name cannot exceed 100 characters"]
        },

        jobRole: {
            type: String,
            required: [true, "Job role is required"],
            trim: true,
            maxlength: [100, "Job role cannot exceed 100 characters"]
        },

        location: {
            type: String,
            trim: true,
            default: "Not Specified",
            maxlength: [150, "Location cannot exceed 150 characters"]
        },

        jobType: {
            type: String,
            enum: [
                "Full Time",
                "Part Time",
                "Internship",
                "Contract",
                "Remote"
            ],
            default: "Full Time"
        },

        salary: {
            type: String,
            trim: true,
            default: "",
            maxlength: [100, "Salary information is too long"]
        },

        status: {
            type: String,
            enum: [
                "Applied",
                "Shortlisted",
                "Interview",
                "Selected",
                "Rejected"
            ],
            default: "Applied"
        },

        appliedDate: {
            type: Date,
            default: Date.now
        },

        interviewDate: {
            type: Date,
            default: null
        },

        jobDescription: {
            type: String,
            trim: true,
            maxlength: [15000, "Job description cannot exceed 15000 characters"],
            default: ""
        },

        jobLink: {
            type: String,
            trim: true,
            maxlength: [2000, "Job link cannot exceed 2000 characters"],
            default: ""
        },

        notes: {
            type: String,
            trim: true,
            maxlength: [5000, "Notes cannot exceed 5000 characters"],
            default: ""
        }

    },

    {
        timestamps: true
    }

);

jobApplicationSchema.index({
    user: 1,
    createdAt: -1
});

const JobApplication = mongoose.model(
    "JobApplication",
    jobApplicationSchema
);

module.exports = JobApplication;