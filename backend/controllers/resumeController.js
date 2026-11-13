const Resume = require("../models/Resume");

const allowedResumeFields = [
    "name",
    "email",
    "phone",
    "location",
    "linkedin",
    "github",
    "summary",
    "degree",
    "college",
    "graduationYear",
    "skills",
    "experience",
    "projects",
    "certifications"
];

const filterResumeData = (data) => {

    const filteredData = {};

    allowedResumeFields.forEach((field) => {

        if (
            Object.prototype.hasOwnProperty.call(data, field)
        ) {
            filteredData[field] = data[field];
        }

    });

    return filteredData;
};

const handleError = (res, error, operation) => {

    console.error(`${operation} ERROR:`, error);

    if (
        error.name === "ValidationError" ||
        error.name === "CastError"
    ) {

        return res.status(400).json({
            success: false,
            message: "Invalid resume data.",
            error: error.message
        });

    }

    return res.status(500).json({
        success: false,
        message: `${operation} failed.`,
        error: error.message
    });

};

exports.saveResume = async (req, res) => {

    try {

        const resumeData = filterResumeData(req.body);

        if (Object.keys(resumeData).length === 0) {

            return res.status(400).json({
                success: false,
                message: "Please provide valid resume fields."
            });

        }

        const resume = await Resume.findOneAndUpdate(

            {
                user: req.user._id
            },

            {
                $set: resumeData,

                $setOnInsert: {
                    user: req.user._id
                }
            },

            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }

        );

        return res.status(200).json({

            success: true,

            message: "Resume saved successfully!",

            resume

        });

    } catch (error) {

        return handleError(res, error, "SAVE RESUME");

    }

};

exports.getResume = async (req, res) => {

    try {

        const resume = await Resume.findOne({

            user: req.user._id

        });

        if (!resume) {

            return res.status(200).json({

                success: true,

                message: "No saved resume found. Please create your resume.",

                resume: null

            });

        }

        return res.status(200).json({

            success: true,

            message: "Resume fetched successfully!",

            resume

        });

    } catch (error) {

        return handleError(res, error, "GET RESUME");

    }

};

exports.updateResume = async (req, res) => {

    try {

        const updateData = filterResumeData(req.body);

        if (Object.keys(updateData).length === 0) {

            return res.status(400).json({

                success: false,

                message: "Please provide valid resume fields to update."

            });

        }

        const resume = await Resume.findOneAndUpdate(

            {
                user: req.user._id
            },

            {
                $set: updateData
            },

            {
                new: true,
                runValidators: true
            }

        );

        if (!resume) {

            return res.status(404).json({

                success: false,

                message: "No saved resume found. Please save your resume first."

            });

        }

        return res.status(200).json({

            success: true,

            message: "Resume updated successfully!",

            resume

        });

    } catch (error) {

        return handleError(res, error, "UPDATE RESUME");

    }

};

exports.deleteResume = async (req, res) => {

    try {

        const deletedResume = await Resume.findOneAndDelete({

            user: req.user._id

        });

        if (!deletedResume) {

            return res.status(404).json({

                success: false,

                message: "No saved resume found for this user."

            });

        }

        return res.status(200).json({

            success: true,

            message: "Resume deleted successfully!"

        });

    } catch (error) {

        return handleError(res, error, "DELETE RESUME");

    }

};