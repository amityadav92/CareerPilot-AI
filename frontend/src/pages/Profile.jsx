import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";
import { logout } from "../services/authService";

import "./Profile.css";

const API_BASE_URL =
    API.defaults?.baseURL || "http://localhost:5000/api";

const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, "");

function Profile() {

    const navigate = useNavigate();

    const fileInputRef = useRef(null);

    const [user, setUser] = useState({});

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [uploading, setUploading] = useState(false);

    const [imageFile, setImageFile] = useState(null);

    const [imagePreview, setImagePreview] = useState("");

    const [message, setMessage] = useState({
        type: "",
        text: "",
    });

    const [personal, setPersonal] = useState({
        name: "",
        email: "",
    });

    const [skills, setSkills] = useState("");

    const [education, setEducation] = useState("");

    const [experience, setExperience] = useState("");

    const [password, setPassword] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const getImageUrl = (imagePath) => {

        if (!imagePath) return "";

        if (imagePath.startsWith("http")) {
            return imagePath;
        }

        return `${BACKEND_URL}${imagePath}`;
    };

    const fetchProfile = async () => {

        try {

            setLoading(true);

            const response = await API.get("/users/profile");

            const profile = response.data.user;

            if (!profile) {
                throw new Error("Profile data not found");
            }

            setUser(profile);

            setPersonal({
                name: profile.name || "",
                email: profile.email || "",
            });

            setSkills(
                Array.isArray(profile.skills)
                    ? profile.skills.join(", ")
                    : ""
            );

            setEducation(profile.education || "");

            setExperience(profile.experience || "");

            localStorage.setItem(
                "user",
                JSON.stringify(profile)
            );

            setMessage({
                type: "",
                text: "",
            });

        } catch (error) {

            console.error("Profile Fetch Error:", error);

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Unable to fetch profile.",
            });

            if (error.response?.status === 401) {

                logout();

                navigate("/login");
            }

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        fetchProfile();

    }, []);

    const handleImageSelect = (e) => {

        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {

            setMessage({
                type: "error",
                text: "Only JPG, JPEG, PNG and WEBP images are allowed.",
            });

            e.target.value = "";

            return;
        }

        if (file.size > 2 * 1024 * 1024) {

            setMessage({
                type: "error",
                text: "Image size must be less than 2 MB.",
            });

            e.target.value = "";

            return;
        }

        setImageFile(file);

        setImagePreview(URL.createObjectURL(file));

        setMessage({
            type: "",
            text: "",
        });
    };

    const handleImageUpload = async () => {

        if (!imageFile) {

            setMessage({
                type: "error",
                text: "Please select an image first.",
            });

            return;
        }

        try {

            setUploading(true);

            setMessage({
                type: "",
                text: "",
            });

            const formData = new FormData();

            formData.append("profileImage", imageFile);

            const response = await API.post(
                "/users/profile/upload",
                formData
            );

            if (response.data.success) {

                const updatedUser = {
                    ...user,
                    ...(response.data.user || {}),
                    profileImage: response.data.profileImage,
                };

                setUser(updatedUser);

                localStorage.setItem(
                    "user",
                    JSON.stringify(updatedUser)
                );

                setImageFile(null);

                setImagePreview("");

                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }

                setMessage({
                    type: "success",
                    text:
                        response.data.message ||
                        "Profile image uploaded successfully!",
                });
            }

        } catch (error) {

            console.error("Image Upload Error:", error);

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to upload profile image.",
            });

        } finally {

            setUploading(false);
        }
    };

    const handleCancelImage = () => {

        setImageFile(null);

        setImagePreview("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handlePersonalUpdate = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);

            setMessage({ type: "", text: "" });

            const response = await API.put(
                "/users/profile",
                {
                    name: personal.name,
                    email: personal.email,
                }
            );

            setMessage({
                type: "success",
                text:
                    response.data.message ||
                    "Personal information updated successfully!",
            });

            await fetchProfile();

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to update personal information.",
            });

        } finally {

            setSaving(false);
        }
    };

    const handleSkillsUpdate = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);

            setMessage({ type: "", text: "" });

            const skillsArray = skills
                .split(",")
                .map((skill) => skill.trim())
                .filter((skill) => skill !== "");

            const response = await API.put(
                "/users/skills",
                {
                    skills: skillsArray,
                }
            );

            const updatedUser = {
                ...user,
                skills: skillsArray,
            };

            setUser(updatedUser);

            localStorage.setItem(
                "user",
                JSON.stringify(updatedUser)
            );

            setMessage({
                type: "success",
                text:
                    response.data.message ||
                    "Skills updated successfully!",
            });

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to update skills.",
            });

        } finally {

            setSaving(false);
        }
    };

    const handleEducationUpdate = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);

            setMessage({ type: "", text: "" });

            const response = await API.put(
                "/users/education",
                {
                    education,
                }
            );

            const updatedUser = {
                ...user,
                education,
            };

            setUser(updatedUser);

            localStorage.setItem(
                "user",
                JSON.stringify(updatedUser)
            );

            setMessage({
                type: "success",
                text:
                    response.data.message ||
                    "Education updated successfully!",
            });

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to update education.",
            });

        } finally {

            setSaving(false);
        }
    };

    const handleExperienceUpdate = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);

            setMessage({ type: "", text: "" });

            const response = await API.put(
                "/users/experience",
                {
                    experience,
                }
            );

            const updatedUser = {
                ...user,
                experience,
            };

            setUser(updatedUser);

            localStorage.setItem(
                "user",
                JSON.stringify(updatedUser)
            );

            setMessage({
                type: "success",
                text:
                    response.data.message ||
                    "Experience updated successfully!",
            });

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to update experience.",
            });

        } finally {

            setSaving(false);
        }
    };

    const handlePasswordUpdate = async (e) => {

        e.preventDefault();

        if (
            !password.currentPassword ||
            !password.newPassword ||
            !password.confirmPassword
        ) {

            setMessage({
                type: "error",
                text: "Please fill all password fields.",
            });

            return;
        }

        if (password.newPassword.length < 6) {

            setMessage({
                type: "error",
                text: "New password must be at least 6 characters.",
            });

            return;
        }

        if (password.newPassword !== password.confirmPassword) {

            setMessage({
                type: "error",
                text: "New password and confirm password do not match.",
            });

            return;
        }

        try {

            setSaving(true);

            setMessage({ type: "", text: "" });

            const response = await API.put(
                "/users/change-password",
                {
                    currentPassword: password.currentPassword,
                    newPassword: password.newPassword,
                }
            );

            setPassword({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setMessage({
                type: "success",
                text:
                    response.data.message ||
                    "Password changed successfully!",
            });

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to change password.",
            });

        } finally {

            setSaving(false);
        }
    };

    const handleLogout = () => {

        logout();

        navigate("/login");
    };

    if (loading) {

        return (
            <div className="profile-loading">

                <div className="loader"></div>

                <p>Loading your profile...</p>

            </div>
        );
    }

    return (

        <div className="profile-page">

            <div className="profile-header">

                <div>
                    <h1>My Profile</h1>

                    <p>
                        Manage your personal information and account settings.
                    </p>
                </div>

                <button
                    className="profile-logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

            {message.text && (

                <div className={`profile-message ${message.type}`}>

                    {message.text}

                </div>
            )}

            <div className="profile-overview">

                <div className="profile-avatar-section">

                    <div className="profile-avatar">

                        {imagePreview || user.profileImage ? (

                            <img
                                src={
                                    imagePreview ||
                                    getImageUrl(user.profileImage)
                                }
                                alt="Profile"
                                className="profile-avatar-image"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />

                        ) : (

                            <span>
                                {user.name
                                    ? user.name.charAt(0).toUpperCase()
                                    : "U"}
                            </span>

                        )}

                    </div>

                    <button
                        type="button"
                        className="profile-camera-btn"
                        onClick={() => fileInputRef.current?.click()}
                        title="Change profile photo"
                    >
                        ✎
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageSelect}
                        hidden
                    />

                </div>

                <div className="profile-overview-info">

                    <h2>{user.name || "User Name"}</h2>

                    <p>{user.email || "No email available"}</p>

                    <span className="profile-role">
                        {user.role || "Student"}
                    </span>

                    {imageFile && (

                        <div className="profile-image-actions">

                            <button
                                type="button"
                                className="profile-upload-btn"
                                onClick={handleImageUpload}
                                disabled={uploading}
                            >
                                {uploading
                                    ? "Uploading..."
                                    : "Upload Photo"}
                            </button>

                            <button
                                type="button"
                                className="profile-cancel-btn"
                                onClick={handleCancelImage}
                                disabled={uploading}
                            >
                                Cancel
                            </button>

                        </div>

                    )}

                    {!imageFile && (

                        <p className="profile-photo-hint">
                            JPG, PNG or WEBP • Maximum 2 MB
                        </p>

                    )}

                </div>

            </div>

            <section className="profile-card">

                <div className="profile-card-heading">

                    <h2>Personal Information</h2>

                    <p>Update your basic account information.</p>

                </div>

                <form onSubmit={handlePersonalUpdate}>

                    <div className="profile-form-grid">

                        <div className="profile-form-group">

                            <label>Full Name</label>

                            <input
                                type="text"
                                value={personal.name}
                                onChange={(e) =>
                                    setPersonal({
                                        ...personal,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Enter your full name"
                                required
                            />

                        </div>

                        <div className="profile-form-group">

                            <label>Email Address</label>

                            <input
                                type="email"
                                value={personal.email}
                                onChange={(e) =>
                                    setPersonal({
                                        ...personal,
                                        email: e.target.value,
                                    })
                                }
                                placeholder="Enter your email"
                                required
                            />

                        </div>

                    </div>

                    <button
                        type="submit"
                        className="profile-save-btn"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : "Save Personal Information"}
                    </button>

                </form>

            </section>

            <section className="profile-card">

                <div className="profile-card-heading">

                    <h2>My Skills</h2>

                    <p>Add or update your technical skills.</p>

                </div>

                <form onSubmit={handleSkillsUpdate}>

                    <div className="profile-form-group">

                        <label>Skills</label>

                        <textarea
                            rows="3"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="Example: HTML, CSS, JavaScript, React.js, Node.js"
                        />

                        <small>
                            Separate multiple skills using commas.
                        </small>

                    </div>

                    <div className="profile-skill-tags">

                        {skills
                            .split(",")
                            .map((skill) => skill.trim())
                            .filter((skill) => skill !== "")
                            .map((skill, index) => (

                                <span key={index}>
                                    {skill}
                                </span>

                            ))}

                    </div>

                    <button
                        type="submit"
                        className="profile-save-btn"
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Update Skills"}
                    </button>

                </form>

            </section>

            <section className="profile-card">

                <div className="profile-card-heading">

                    <h2>Education</h2>

                    <p>Manage your educational details.</p>

                </div>

                <form onSubmit={handleEducationUpdate}>

                    <div className="profile-form-group">

                        <label>Education Details</label>

                        <textarea
                            rows="4"
                            value={education}
                            onChange={(e) => setEducation(e.target.value)}
                            placeholder="Enter your college, degree, branch and graduation year"
                        />

                    </div>

                    <button
                        type="submit"
                        className="profile-save-btn"
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Update Education"}
                    </button>

                </form>

            </section>

            <section className="profile-card">

                <div className="profile-card-heading">

                    <h2>Experience</h2>

                    <p>Add your internship and work experience.</p>

                </div>

                <form onSubmit={handleExperienceUpdate}>

                    <div className="profile-form-group">

                        <label>Experience Details</label>

                        <textarea
                            rows="5"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            placeholder="Enter your internship, company name, role and experience details"
                        />

                    </div>

                    <button
                        type="submit"
                        className="profile-save-btn"
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Update Experience"}
                    </button>

                </form>

            </section>

            <section className="profile-card">

                <div className="profile-card-heading">

                    <h2>Change Password</h2>

                    <p>Update your account password securely.</p>

                </div>

                <form onSubmit={handlePasswordUpdate}>

                    <div className="profile-form-grid">

                        <div className="profile-form-group">

                            <label>Current Password</label>

                            <input
                                type="password"
                                value={password.currentPassword}
                                onChange={(e) =>
                                    setPassword({
                                        ...password,
                                        currentPassword: e.target.value,
                                    })
                                }
                                placeholder="Enter current password"
                                autoComplete="current-password"
                            />

                        </div>

                        <div className="profile-form-group">

                            <label>New Password</label>

                            <input
                                type="password"
                                value={password.newPassword}
                                onChange={(e) =>
                                    setPassword({
                                        ...password,
                                        newPassword: e.target.value,
                                    })
                                }
                                placeholder="Enter new password"
                                autoComplete="new-password"
                            />

                        </div>

                        <div className="profile-form-group">

                            <label>Confirm New Password</label>

                            <input
                                type="password"
                                value={password.confirmPassword}
                                onChange={(e) =>
                                    setPassword({
                                        ...password,
                                        confirmPassword: e.target.value,
                                    })
                                }
                                placeholder="Confirm new password"
                                autoComplete="new-password"
                            />

                        </div>

                    </div>

                    <button
                        type="submit"
                        className="profile-save-btn"
                        disabled={saving}
                    >
                        {saving ? "Updating..." : "Change Password"}
                    </button>

                </form>

            </section>

            <div className="profile-footer">

                <p>CareerPilot AI • Profile Management</p>

            </div>

        </div>
    );
}

export default Profile;