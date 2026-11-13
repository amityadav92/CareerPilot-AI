const express = require("express");

const router = express.Router();

const {
    saveResume,
    getResume,
    updateResume,
    deleteResume
} = require("../controllers/resumeController");

const { protect } = require("../middleware/authMiddleware");

router.post("/save", protect, saveResume);

router.get("/", protect, getResume);

router.put("/", protect, updateResume);

router.delete("/", protect, deleteResume);

module.exports = router;