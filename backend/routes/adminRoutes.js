const express = require("express");

const router = express.Router();

const {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    getAdminStats
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");

const { adminOnly } = require("../middleware/roleMiddleware");

router.use(protect);
router.use(adminOnly);

router.get("/stats", getAdminStats);

router.get("/users", getAllUsers);

router.get("/users/:id", getUserById);

router.patch("/users/:id/role", updateUserRole);

router.delete("/users/:id", deleteUser);

module.exports = router;