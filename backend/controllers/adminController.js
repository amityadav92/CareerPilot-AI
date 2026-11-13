const User = require("../models/User");
const mongoose = require("mongoose");

const getAllUsers = async (req, res) => {
    try {
        const {
            search = "",
            role = "",
            page = 1,
            limit = 10
        } = req.query;

        const currentPage = Math.max(1, Number(page) || 1);
        const usersLimit = Math.min(100, Math.max(1, Number(limit) || 10));

        const filter = {};

        if (typeof search !== "string" || typeof role !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid search or role parameter"
            });
        }

        if (search.trim()) {
            const escapedSearch = search.trim().replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.$or = [
                {
                    name: {
                        $regex: escapedSearch,
                        $options: "i"
                    }
                },
                {
                    email: {
                        $regex: escapedSearch,
                        $options: "i"
                    }
                }
            ];
        }

        if (role) {
            if (!["admin", "user"].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid role filter"
                });
            }

            filter.role = role;
        }

        const [users, totalUsers] = await Promise.all([
            User.find(filter)
                .select("-password")
                .sort({ createdAt: -1 })
                .skip((currentPage - 1) * usersLimit)
                .limit(usersLimit)
                .lean(),

            User.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            totalUsers,
            currentPage,
            totalPages: Math.ceil(totalUsers / usersLimit),
            usersPerPage: usersLimit,
            users
        });

    } catch (error) {
        console.error("Get All Users Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            user
        });

    } catch (error) {
        console.error("Get User Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch user details"
        });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        if (!["admin", "user"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be admin or user"
            });
        }

        if (req.user._id.toString() === id) {
            return res.status(403).json({
                success: false,
                message: "You cannot change your own role"
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.role === "admin" && role === "user") {
            const totalAdmins = await User.countDocuments({
                role: "admin"
            });

            if (totalAdmins <= 1) {
                return res.status(403).json({
                    success: false,
                    message: "Cannot remove the last admin"
                });
            }
        }

        user.role = role;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "User role updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Update Role Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update user role"
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        if (req.user._id.toString() === id) {
            return res.status(403).json({
                success: false,
                message: "You cannot delete your own account"
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.role === "admin") {
            const totalAdmins = await User.countDocuments({
                role: "admin"
            });

            if (totalAdmins <= 1) {
                return res.status(403).json({
                    success: false,
                    message: "Cannot delete the last admin"
                });
            }
        }

        await User.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("Delete User Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete user"
        });
    }
};

const getAdminStats = async (req, res) => {
    try {
        const lastSevenDays = new Date();
        lastSevenDays.setDate(lastSevenDays.getDate() - 7);

        const [
            totalUsers,
            totalAdmins,
            totalNormalUsers,
            recentUsers,
            newUsersLast7Days
        ] = await Promise.all([
            User.countDocuments(),

            User.countDocuments({
                role: "admin"
            }),

            User.countDocuments({
                role: "user"
            }),

            User.find()
                .select("-password")
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),

            User.countDocuments({
                createdAt: {
                    $gte: lastSevenDays
                }
            })
        ]);

        return res.status(200).json({
            success: true,
            message: "Admin dashboard statistics fetched successfully",
            statistics: {
                totalUsers,
                totalAdmins,
                totalNormalUsers,
                newUsersLast7Days
            },
            recentUsers
        });

    } catch (error) {
        console.error("Admin Dashboard Stats Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics"
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    getAdminStats
};
