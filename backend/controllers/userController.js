const User = require("../models/User");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const handleError = (res, error, operation) => {

    console.error(`${operation} Error:`, error);

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

    if (error.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID"
        });
    }

    return res.status(500).json({
        success: false,
        message: `Server error while ${operation.toLowerCase()}`
    });

};

const deleteFile = async (filePath) => {

    if (!filePath) return;

    try {

        await fs.promises.unlink(filePath);

    } catch (error) {

        if (error.code !== "ENOENT") {
            console.error("File Delete Error:", error.message);
        }

    }

};

const getProfileImagePath = (imageUrl) => {

    if (
        typeof imageUrl !== "string" ||
        !imageUrl.startsWith("/uploads/profile/")
    ) {
        return null;
    }

    const filename = path.basename(imageUrl);

    if (!filename || filename === "." || filename === "..") {
        return null;
    }

    const uploadDir = path.resolve(
        __dirname,
        "../uploads/profile"
    );

    const filePath = path.resolve(uploadDir, filename);

    if (path.dirname(filePath) !== uploadDir) {
        return null;
    }

    return filePath;

};

const isValidEmail = (email) => {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return (
        typeof email === "string" &&
        email.length <= 254 &&
        emailRegex.test(email)
    );

};

const getAuthenticatedUserId = (req) => {

    return req.user?._id || null;

};

exports.getUserProfile = async (req, res) => {

    try {

        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const user = await User.findById(userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({

            success: true,

            message: "Profile fetched successfully",

            user

        });

    } catch (error) {

        return handleError(
            res,
            error,
            "Fetching Profile"
        );

    }

};

exports.updateProfile = async (req, res) => {

    try {

        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const { name, email } = req.body || {};

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (name === undefined && email === undefined) {

            return res.status(400).json({
                success: false,
                message: "Please provide name or email"
            });

        }

        if (name !== undefined) {

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

            user.name = name.trim();

        }

        if (email !== undefined) {

            if (typeof email !== "string") {

                return res.status(400).json({
                    success: false,
                    message: "Valid email is required"
                });

            }

            const normalizedEmail = email.toLowerCase().trim();

            if (!isValidEmail(normalizedEmail)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid email address"
                });

            }

            const existingUser = await User.findOne({

                email: normalizedEmail,

                _id: { $ne: user._id }

            });

            if (existingUser) {

                return res.status(409).json({
                    success: false,
                    message: "Email already registered"
                });

            }

            user.email = normalizedEmail;

        }

        await user.save();

        return res.status(200).json({

            success: true,

            message: "Profile updated successfully",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                skills: user.skills,
                education: user.education,
                experience: user.experience
            }

        });

    } catch (error) {

        return handleError(
            res,
            error,
            "Updating Profile"
        );

    }

};

exports.updateSkills = async (req, res) => {

    try {

        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const { skills } = req.body || {};

        if (!Array.isArray(skills)) {

            return res.status(400).json({
                success: false,
                message: "Skills must be an array"
            });

        }

        if (skills.length > 50) {

            return res.status(400).json({
                success: false,
                message: "Maximum 50 skills are allowed"
            });

        }

        if (!skills.every(skill => typeof skill === "string")) {

            return res.status(400).json({
                success: false,
                message: "Every skill must be a string"
            });

        }

        const cleanedSkills = skills
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0);

        if (cleanedSkills.some(skill => skill.length > 50)) {

            return res.status(400).json({
                success: false,
                message: "Each skill cannot exceed 50 characters"
            });

        }

        const uniqueSkills = [...new Set(cleanedSkills)];

        const user = await User.findByIdAndUpdate(

            userId,

            {
                $set: {
                    skills: uniqueSkills
                }
            },

            {
                new: true,
                runValidators: true
            }

        ).select("-password");

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        return res.status(200).json({

            success: true,

            message: "Skills updated successfully",

            skills: user.skills

        });

    } catch (error) {

        return handleError(
            res,
            error,
            "Updating Skills"
        );

    }

};

exports.updateEducation = async (req, res) => {

    try {

        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const { education } = req.body || {};

        if (
            typeof education !== "string" ||
            education.length > 1000
        ) {

            return res.status(400).json({
                success: false,
                message: "Education must be a string and cannot exceed 1000 characters"
            });

        }

        const user = await User.findByIdAndUpdate(

            userId,

            {
                $set: {
                    education: education.trim()
                }
            },

            {
                new: true,
                runValidators: true
            }

        ).select("-password");

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        return res.status(200).json({

            success: true,

            message: "Education updated successfully",

            education: user.education

        });

    } catch (error) {

        return handleError(
            res,
            error,
            "Updating Education"
        );

    }

};

exports.updateExperience = async (req, res) => {

    try {

        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const { experience } = req.body || {};

        if (
            typeof experience !== "string" ||
            experience.length > 3000
        ) {

            return res.status(400).json({
                success: false,
                message: "Experience must be a string and cannot exceed 3000 characters"
            });

        }

        const user = await User.findByIdAndUpdate(

            userId,

            {
                $set: {
                    experience: experience.trim()
                }
            },

            {
                new: true,
                runValidators: true
            }

        ).select("-password");

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        return res.status(200).json({

            success: true,

            message: "Experience updated successfully",

            experience: user.experience

        });

    } catch (error) {

        return handleError(
            res,
            error,
            "Updating Experience"
        );

    }

};

exports.changePassword = async (req, res) => {

    try {

        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const { currentPassword, newPassword } = req.body || {};

        if (!currentPassword || !newPassword) {

            return res.status(400).json({
                success: false,
                message: "Both passwords are required"
            });

        }

        if (
            typeof currentPassword !== "string" ||
            typeof newPassword !== "string"
        ) {

            return res.status(400).json({
                success: false,
                message: "Passwords must be strings"
            });

        }

        if (
            newPassword.length < 6 ||
            Buffer.byteLength(newPassword, "utf8") > 72
        ) {

            return res.status(400).json({
                success: false,
                message: "New password must contain at least 6 characters and cannot exceed 72 UTF-8 bytes"
            });

        }

        if (Buffer.byteLength(currentPassword, "utf8") > 72) {

            return res.status(400).json({
                success: false,
                message: "Invalid current password"
            });

        }

        const user = await User.findById(userId);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {

            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });

        }

        const isSamePassword = await bcrypt.compare(
            newPassword,
            user.password
        );

        if (isSamePassword) {

            return res.status(400).json({
                success: false,
                message: "New password must be different"
            });

        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            12
        );

        user.password = hashedPassword;

        await user.save();

        return res.status(200).json({

            success: true,

            message: "Password changed successfully"

        });

    } catch (error) {

        return handleError(
            res,
            error,
            "Changing Password"
        );

    }

};

exports.uploadProfileImage = async (req, res) => {

    let newImagePath = null;

    try {

        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "Please upload a profile image"
            });

        }

        newImagePath = req.file.path;

        if (!newImagePath || !req.file.filename) {

            return res.status(500).json({
                success: false,
                message: "Profile image storage configuration is invalid"
            });

        }

        const user = await User.findById(userId);

        if (!user) {

            await deleteFile(newImagePath);

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        const oldImagePath = getProfileImagePath(
            user.profileImage
        );

        const imageUrl = `/uploads/profile/${req.file.filename}`;

        user.profileImage = imageUrl;

        await user.save();

        if (
            oldImagePath &&
            path.resolve(oldImagePath) !== path.resolve(newImagePath)
        ) {

            await deleteFile(oldImagePath);

        }

        return res.status(200).json({

            success: true,

            message: "Profile image uploaded successfully",

            profileImage: user.profileImage,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                skills: user.skills,
                education: user.education,
                experience: user.experience
            }

        });

    } catch (error) {

        if (newImagePath) {
            await deleteFile(newImagePath);
        }

        return handleError(
            res,
            error,
            "Uploading Profile Image"
        );

    }

};