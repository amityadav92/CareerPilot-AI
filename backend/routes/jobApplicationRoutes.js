const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
    createApplication,
    getApplications,
    getApplicationById,
    updateApplication,
    deleteApplication
} = require("../controllers/jobApplicationController");

router.use(protect);

router.post("/", createApplication);

router.get("/", getApplications);

router.get("/:id", getApplicationById);

router.put("/:id", updateApplication);

router.delete("/:id", deleteApplication);

module.exports = router;