const mongoose = require("mongoose");
const JobApplication = require("../models/JobApplication");

const createApplication = async (req, res) => {
    try {
        const {
            companyName,
            jobRole,
            location,
            jobType,
            salary,
            status,
            appliedDate,
            interviewDate,
            jobDescription,
            jobLink,
            notes
        } = req.body;

        if (!companyName || !jobRole) {
            return res.status(400).json({
                success: false,
                message: "Company name and job role are required"
            });
        }

        const application = await JobApplication.create({
            user: req.user._id,
            companyName,
            jobRole,
            location,
            jobType,
            salary,
            status,
            appliedDate,
            interviewDate,
            jobDescription,
            jobLink,
            notes
        });

        res.status(201).json({
            success: true,
            message: "Job application added successfully",
            application
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getApplications = async (req, res) => {
    try {
        const applications = await JobApplication.find({
            user: req.user._id
        }).sort({ appliedDate: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            applications
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID"
            });
        }

        const application = await JobApplication.findOne({
            _id: id,
            user: req.user._id
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Job application not found"
            });
        }

        res.status(200).json({
            success: true,
            application
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateApplication = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID"
            });
        }

        const allowedFields = [
            "companyName",
            "jobRole",
            "location",
            "jobType",
            "salary",
            "status",
            "appliedDate",
            "interviewDate",
            "jobDescription",
            "jobLink",
            "notes"
        ];

        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide fields to update"
            });
        }

        const application = await JobApplication.findOneAndUpdate(
            {
                _id: id,
                user: req.user._id
            },
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Job application not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Job application updated successfully",
            application
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID"
            });
        }

        const application = await JobApplication.findOneAndDelete({
            _id: id,
            user: req.user._id
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Job application not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Job application deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createApplication,
    getApplications,
    getApplicationById,
    updateApplication,
    deleteApplication
};