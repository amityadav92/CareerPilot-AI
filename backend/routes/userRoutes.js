const express = require("express");

const router = express.Router();

const {
    getUserProfile,
    updateProfile,
    updateSkills,
    updateEducation,
    updateExperience,
    changePassword,
    uploadProfileImage
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

router.use(protect);

router.get("/profile", getUserProfile);

router.put("/profile", updateProfile);

router.post(
    "/profile/upload",
    upload.single("profileImage"),
    uploadProfileImage
);

router.put("/skills", updateSkills);

router.put("/education", updateEducation);

router.put("/experience", updateExperience);

router.put("/change-password", changePassword);

module.exports = router;