import { useState, useEffect } from "react";
import API from "../services/api";
import "./Resume.css";

// ======================================
// INITIAL RESUME DATA
// ======================================

const initialResume = {
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    summary: "",
    degree: "",
    college: "",
    graduationYear: "",
    skills: "",
    experience: "",
    projects: "",
    certifications: "",
};

// ======================================
// NORMALIZE API DATA
// FIX: ARRAY / STRING MISMATCH
// ======================================

const toResumeText = (value) => {
    if (Array.isArray(value)) {
        return value
            .map((item) => String(item ?? ""))
            .join(", ");
    }

    if (value === null || value === undefined) {
        return "";
    }

    return String(value);
};

const normalizeResume = (data = {}) => {
    const normalized = { ...initialResume };

    Object.keys(initialResume).forEach((key) => {
        normalized[key] = toResumeText(
            data[key] ?? initialResume[key]
        );
    });

    return normalized;
};

// ======================================
// SAFE URL HELPER
// ======================================

const getSafeUrl = (url) => {
    const value = toResumeText(url).trim();

    if (!value) return "";

    try {
        const formattedUrl = /^https?:\/\//i.test(value)
            ? value
            : `https://${value}`;

        const parsedUrl = new URL(formattedUrl);

        if (
            (parsedUrl.protocol === "http:" ||
                parsedUrl.protocol === "https:") &&
            parsedUrl.hostname.includes(".")
        ) {
            return parsedUrl.href;
        }

        return "";
    } catch {
        return "";
    }
};

// ======================================
// MAIN COMPONENT
// ======================================

function Resume() {
    const [resume, setResume] = useState(initialResume);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [hasSavedResume, setHasSavedResume] =
        useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ======================================
    // FETCH RESUME
    // ======================================

    useEffect(() => {
        let isMounted = true;

        const fetchResume = async () => {
            try {
                setLoading(true);

                const response = await API.get("/resume");

                if (!isMounted) return;

                if (
                    response.data.success &&
                    response.data.resume
                ) {
                    setResume(
                        normalizeResume(response.data.resume)
                    );

                    setHasSavedResume(true);
                } else {
                    setResume({ ...initialResume });
                    setHasSavedResume(false);
                }
            } catch (err) {
                if (!isMounted) return;

                if (err.response?.status === 404) {
                    setResume({ ...initialResume });
                    setHasSavedResume(false);
                } else {
                    setError(
                        err.response?.data?.message ||
                        "Failed to load resume. Please try again."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchResume();

        return () => {
            isMounted = false;
        };
    }, []);

    // ======================================
    // HANDLE INPUT CHANGE
    // ======================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setResume((prev) => ({
            ...prev,
            [name]: value,
        }));

        setMessage("");
        setError("");
    };

    // ======================================
    // VALIDATE RESUME
    // ======================================

    const validateResume = () => {
        if (!resume.name.trim()) {
            return "Please enter your full name.";
        }

        if (resume.name.trim().length < 2) {
            return "Name must contain at least 2 characters.";
        }

        if (!resume.email.trim()) {
            return "Please enter your email address.";
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(resume.email.trim())) {
            return "Please enter a valid email address.";
        }

        // PHONE VALIDATION

        if (resume.phone.trim()) {
            const phoneRegex = /^\+?[\d\s()-]{7,20}$/;

            if (!phoneRegex.test(resume.phone.trim())) {
                return "Please enter a valid phone number.";
            }

            const digits = resume.phone.replace(/\D/g, "");

            if (digits.length < 7 || digits.length > 15) {
                return "Phone number must contain 7-15 digits.";
            }
        }

        // GRADUATION YEAR

        if (resume.graduationYear.trim()) {
            const year = Number(resume.graduationYear.trim());

            if (
                !/^\d{4}$/.test(resume.graduationYear.trim()) ||
                year < 1900 ||
                year > 2100
            ) {
                return "Please enter a valid graduation year.";
            }
        }

        // LINKEDIN

        if (
            resume.linkedin.trim() &&
            !getSafeUrl(resume.linkedin)
        ) {
            return "Please enter a valid LinkedIn URL.";
        }

        // GITHUB

        if (
            resume.github.trim() &&
            !getSafeUrl(resume.github)
        ) {
            return "Please enter a valid GitHub URL.";
        }

        return "";
    };

    // ======================================
    // SAVE / UPDATE RESUME
    // ======================================

    const handleSave = async (e) => {
        if (e) {
            e.preventDefault();
        }

        if (saving || deleting) return;

        setMessage("");
        setError("");

        const validationError = validateResume();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSaving(true);

            const resumeData = {
                ...normalizeResume(resume),

                name: resume.name.trim(),
                email: resume.email.trim(),
                phone: resume.phone.trim(),
                location: resume.location.trim(),
                linkedin: resume.linkedin.trim(),
                github: resume.github.trim(),
            };

            const response = await API.post(
                "/resume/save",
                resumeData
            );

            if (response.data.success) {
                if (response.data.resume) {
                    setResume(
                        normalizeResume(response.data.resume)
                    );
                } else {
                    setResume(
                        normalizeResume(resumeData)
                    );
                }

                setHasSavedResume(true);

                setMessage(
                    response.data.message ||
                    "Resume saved successfully!"
                );
            } else {
                setError(
                    response.data.message ||
                    "Failed to save resume."
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to save resume. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    // ======================================
    // DELETE RESUME
    // ======================================

    const handleDelete = async () => {
        if (!hasSavedResume) {
            setError("No saved resume available to delete.");
            return;
        }

        if (saving || deleting) return;

        const confirmDelete = window.confirm(
            "Are you sure you want to permanently delete your saved resume?"
        );

        if (!confirmDelete) return;

        try {
            setDeleting(true);

            setMessage("");
            setError("");

            const response = await API.delete("/resume");

            if (response.data.success) {
                setResume({ ...initialResume });

                setHasSavedResume(false);

                setMessage(
                    response.data.message ||
                    "Resume deleted successfully!"
                );
            } else {
                setError(
                    response.data.message ||
                    "Failed to delete resume."
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete resume. Please try again."
            );
        } finally {
            setDeleting(false);
        }
    };

    // ======================================
    // DOWNLOAD PDF / PRINT
    // ======================================

    const handlePrint = () => {
        if (saving || deleting) return;

        setMessage("");
        setError("");

        window.print();
    };

    // ======================================
    // LOADING SCREEN
    // ======================================

    if (loading) {
        return (
            <div className="resume-page">
                <div
                    className="resume-loading"
                    role="status"
                    aria-live="polite"
                >
                    <div className="resume-spinner"></div>

                    <h2>Loading Resume...</h2>

                    <p>
                        Please wait while we fetch your data.
                    </p>
                </div>
            </div>
        );
    }

    // ======================================
    // MAIN UI
    // ======================================

    return (
        <div className="resume-page">

            {/* HEADER */}

            <div className="resume-header">

                <div className="resume-header-content">
                    <h1>Resume Builder</h1>

                    <p>
                        Create and manage your professional resume.
                    </p>
                </div>

                <div className="resume-header-actions">

                    <button
                        type="button"
                        className="resume-save-btn"
                        onClick={handleSave}
                        disabled={saving || deleting}
                    >
                        {saving
                            ? "Saving..."
                            : hasSavedResume
                                ? "Update Resume"
                                : "Save Resume"
                        }
                    </button>

                    <button
                        type="button"
                        className="resume-download-btn"
                        onClick={handlePrint}
                        disabled={saving || deleting}
                    >
                        Download PDF
                    </button>

                    <button
                        type="button"
                        className="resume-delete-btn"
                        onClick={handleDelete}
                        disabled={
                            !hasSavedResume ||
                            deleting ||
                            saving
                        }
                    >
                        {deleting
                            ? "Deleting..."
                            : "Delete Resume"
                        }
                    </button>

                </div>
            </div>

            {/* SUCCESS MESSAGE */}

            {message && (
                <div
                    className="resume-success-message"
                    role="status"
                    aria-live="polite"
                >
                    {message}
                </div>
            )}

            {/* ERROR MESSAGE */}

            {error && (
                <div
                    className="resume-error-message"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {/* MAIN LAYOUT */}

            <div className="resume-layout">

                {/* LEFT SIDE - RESUME FORM */}

                <div className="resume-form">

                    <form
                        onSubmit={handleSave}
                        noValidate
                    >

                        {/* PERSONAL INFORMATION */}

                        <section className="resume-card">

                            <h2>Personal Information</h2>

                            <div className="resume-input-grid">

                                <div className="resume-field">
                                    <label htmlFor="resume-name">
                                        Full Name
                                    </label>

                                    <input
                                        id="resume-name"
                                        type="text"
                                        name="name"
                                        value={resume.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        autoComplete="name"
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                <div className="resume-field">
                                    <label htmlFor="resume-email">
                                        Email Address
                                    </label>

                                    <input
                                        id="resume-email"
                                        type="email"
                                        name="email"
                                        value={resume.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                        maxLength={150}
                                        required
                                    />
                                </div>

                                <div className="resume-field">
                                    <label htmlFor="resume-phone">
                                        Phone Number
                                    </label>

                                    <input
                                        id="resume-phone"
                                        type="tel"
                                        name="phone"
                                        value={resume.phone}
                                        onChange={handleChange}
                                        placeholder="Enter phone number"
                                        autoComplete="tel"
                                        maxLength={20}
                                    />
                                </div>

                                <div className="resume-field">
                                    <label htmlFor="resume-location">
                                        Location
                                    </label>

                                    <input
                                        id="resume-location"
                                        type="text"
                                        name="location"
                                        value={resume.location}
                                        onChange={handleChange}
                                        placeholder="City, State"
                                        autoComplete="address-level2"
                                        maxLength={100}
                                    />
                                </div>

                                <div className="resume-field">
                                    <label htmlFor="resume-linkedin">
                                        LinkedIn URL
                                    </label>

                                    <input
                                        id="resume-linkedin"
                                        type="text"
                                        inputMode="url"
                                        name="linkedin"
                                        value={resume.linkedin}
                                        onChange={handleChange}
                                        placeholder="https://linkedin.com/in/username"
                                        autoComplete="url"
                                    />
                                </div>

                                <div className="resume-field">
                                    <label htmlFor="resume-github">
                                        GitHub URL
                                    </label>

                                    <input
                                        id="resume-github"
                                        type="text"
                                        inputMode="url"
                                        name="github"
                                        value={resume.github}
                                        onChange={handleChange}
                                        placeholder="https://github.com/username"
                                    />
                                </div>

                            </div>
                        </section>

                        {/* PROFESSIONAL SUMMARY */}

                        <section className="resume-card">

                            <h2>Professional Summary</h2>

                            <div className="resume-field">

                                <label htmlFor="resume-summary">
                                    Summary
                                </label>

                                <textarea
                                    id="resume-summary"
                                    name="summary"
                                    value={resume.summary}
                                    onChange={handleChange}
                                    placeholder="Write your professional summary..."
                                    rows="4"
                                    maxLength={1500}
                                />

                            </div>
                        </section>

                        {/* EDUCATION */}

                        <section className="resume-card">

                            <h2>Education</h2>

                            <div className="resume-field">

                                <label htmlFor="resume-degree">
                                    Degree
                                </label>

                                <input
                                    id="resume-degree"
                                    type="text"
                                    name="degree"
                                    value={resume.degree}
                                    onChange={handleChange}
                                    placeholder="B.Tech in Information Technology"
                                    maxLength={150}
                                />

                            </div>

                            <div className="resume-field">

                                <label htmlFor="resume-college">
                                    College / University
                                </label>

                                <input
                                    id="resume-college"
                                    type="text"
                                    name="college"
                                    value={resume.college}
                                    onChange={handleChange}
                                    placeholder="College name"
                                    maxLength={200}
                                />

                            </div>

                            <div className="resume-field">

                                <label htmlFor="resume-year">
                                    Graduation Year
                                </label>

                                <input
                                    id="resume-year"
                                    type="text"
                                    name="graduationYear"
                                    value={resume.graduationYear}
                                    onChange={handleChange}
                                    placeholder="2027"
                                    inputMode="numeric"
                                    maxLength={4}
                                />

                            </div>
                        </section>

                        {/* TECHNICAL SKILLS */}

                        <section className="resume-card">

                            <h2>Technical Skills</h2>

                            <div className="resume-field">

                                <label htmlFor="resume-skills">
                                    Skills
                                </label>

                                <textarea
                                    id="resume-skills"
                                    name="skills"
                                    value={resume.skills}
                                    onChange={handleChange}
                                    placeholder="React.js, JavaScript, Node.js, MongoDB..."
                                    rows="3"
                                    maxLength={2000}
                                />

                                <small>
                                    Separate skills using commas.
                                </small>

                            </div>
                        </section>

                        {/* EXPERIENCE */}

                        <section className="resume-card">

                            <h2>Experience / Internship</h2>

                            <div className="resume-field">

                                <label htmlFor="resume-experience">
                                    Work Experience
                                </label>

                                <textarea
                                    id="resume-experience"
                                    name="experience"
                                    value={resume.experience}
                                    onChange={handleChange}
                                    placeholder="Enter your internship or work experience..."
                                    rows="5"
                                    maxLength={3000}
                                />

                            </div>
                        </section>

                        {/* PROJECTS */}

                        <section className="resume-card">

                            <h2>Projects</h2>

                            <div className="resume-field">

                                <label htmlFor="resume-projects">
                                    Project Details
                                </label>

                                <textarea
                                    id="resume-projects"
                                    name="projects"
                                    value={resume.projects}
                                    onChange={handleChange}
                                    placeholder="Enter your project details..."
                                    rows="5"
                                    maxLength={3000}
                                />

                            </div>
                        </section>

                        {/* CERTIFICATIONS */}

                        <section className="resume-card">

                            <h2>Certifications</h2>

                            <div className="resume-field">

                                <label htmlFor="resume-certifications">
                                    Certification Details
                                </label>

                                <textarea
                                    id="resume-certifications"
                                    name="certifications"
                                    value={toResumeText(
                                        resume.certifications
                                    )}
                                    onChange={handleChange}
                                    placeholder="Enter your certifications..."
                                    rows="3"
                                    maxLength={2000}
                                />

                            </div>
                        </section>

                        {/* BOTTOM SAVE BUTTON */}

                        <button
                            type="submit"
                            className="resume-save-btn resume-bottom-save"
                            disabled={saving || deleting}
                        >
                            {saving
                                ? "Saving Resume..."
                                : hasSavedResume
                                    ? "Update Resume"
                                    : "Save Resume"
                            }
                        </button>

                    </form>
                </div>

                {/* RIGHT SIDE - LIVE PREVIEW */}

                <div className="resume-preview-wrapper">

                    <div className="resume-preview-heading">

                        <h2>Live Preview</h2>

                        <span>
                            Updates automatically
                        </span>

                    </div>

                    <div
                        className="resume-preview"
                        id="resume-preview"
                    >

                        {/* RESUME HEADER */}

                        <div className="preview-header">

                            <h1>
                                {resume.name || "Your Name"}
                            </h1>

                            {(resume.email || resume.phone) && (
                                <p>
                                    {resume.email}

                                    {resume.email && resume.phone && " | "}

                                    {resume.phone}
                                </p>
                            )}

                            {resume.location && (
                                <p>{resume.location}</p>
                            )}

                            {(resume.linkedin || resume.github) && (
                                <p className="preview-links">

                                    {resume.linkedin && (
                                        <a
                                            href={
                                                getSafeUrl(resume.linkedin) ||
                                                undefined
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            LinkedIn
                                        </a>
                                    )}

                                    {resume.linkedin &&
                                        resume.github && " | "}

                                    {resume.github && (
                                        <a
                                            href={
                                                getSafeUrl(resume.github) ||
                                                undefined
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            GitHub
                                        </a>
                                    )}

                                </p>
                            )}

                        </div>

                        {/* PROFESSIONAL SUMMARY */}

                        {resume.summary.trim() && (
                            <div className="preview-section">

                                <h3>PROFESSIONAL SUMMARY</h3>

                                <p>{resume.summary}</p>

                            </div>
                        )}

                        {/* EDUCATION */}

                        {(resume.degree ||
                            resume.college ||
                            resume.graduationYear) && (

                            <div className="preview-section">

                                <h3>EDUCATION</h3>

                                {resume.degree && (
                                    <h4>{resume.degree}</h4>
                                )}

                                {resume.college && (
                                    <p>{resume.college}</p>
                                )}

                                {resume.graduationYear && (
                                    <p>{resume.graduationYear}</p>
                                )}

                            </div>
                        )}

                        {/* TECHNICAL SKILLS */}

                        {resume.skills.trim() && (
                            <div className="preview-section">

                                <h3>TECHNICAL SKILLS</h3>

                                <p>{resume.skills}</p>

                            </div>
                        )}

                        {/* EXPERIENCE */}

                        {resume.experience.trim() && (
                            <div className="preview-section">

                                <h3>EXPERIENCE</h3>

                                <p>{resume.experience}</p>

                            </div>
                        )}

                        {/* PROJECTS */}

                        {resume.projects.trim() && (
                            <div className="preview-section">

                                <h3>PROJECTS</h3>

                                <p>{resume.projects}</p>

                            </div>
                        )}

                        {/* CERTIFICATIONS */}

                        {toResumeText(
                            resume.certifications
                        ).trim() && (

                            <div className="preview-section">

                                <h3>CERTIFICATIONS</h3>

                                <p>
                                    {toResumeText(
                                        resume.certifications
                                    )}
                                </p>

                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Resume;