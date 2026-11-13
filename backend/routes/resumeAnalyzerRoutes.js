const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const {
    extractResumeText,
    analyzeResume,
    matchJobDescription
} = require("../controllers/resumeAnalyzerController");

router.post(
    "/extract",
    upload.single("resume"),
    extractResumeText
);

router.post(
    "/analyze",
    upload.single("resume"),
    analyzeResume
);

router.post(
    "/job-match",
    upload.single("resume"),
    matchJobDescription
);

module.exports = router;