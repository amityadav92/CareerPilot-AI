import { useEffect, useState } from "react";
import API from "../services/api";
import "./JobTracker.css";

const INITIAL_FORM = {
    companyName: "",
    jobRole: "",
    location: "",
    jobType: "Full Time",
    salary: "",
    appliedDate: "",
    interviewDate: "",
    status: "Applied",
    jobDescription: "",
    jobLink: "",
    notes: ""
};

function JobTracker() {

    const [applications, setApplications] = useState([]);
    const [formData, setFormData] = useState(INITIAL_FORM);

    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get("/jobs");

            setApplications(response.data.applications || []);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load applications."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({ ...INITIAL_FORM });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            const payload = {
                ...formData,
                appliedDate: formData.appliedDate || undefined,
                interviewDate: formData.interviewDate || undefined
            };

            if (editingId) {

                await API.put(
                    `/jobs/${editingId}`,
                    payload
                );

                setSuccess("Application updated successfully!");

            } else {

                await API.post("/jobs", payload);

                setSuccess("Application added successfully!");

            }

            resetForm();

            await fetchApplications();

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Something went wrong."
            );

        } finally {
            setSubmitting(false);
        }
    };

    const formatDateForInput = (date) => {

        if (!date) return "";

        const parsedDate = new Date(date);

        if (isNaN(parsedDate.getTime())) return "";

        return parsedDate.toISOString().split("T")[0];
    };

    const handleEdit = (application) => {

        setEditingId(application._id);

        setFormData({
            companyName: application.companyName || "",
            jobRole: application.jobRole || "",
            location: application.location || "",
            jobType: application.jobType || "Full Time",
            salary: application.salary || "",

            appliedDate: formatDateForInput(
                application.appliedDate
            ),

            interviewDate: formatDateForInput(
                application.interviewDate
            ),

            status: application.status || "Applied",
            jobDescription: application.jobDescription || "",
            jobLink: application.jobLink || "",
            notes: application.notes || ""
        });

        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this application?"
        );

        if (!confirmDelete) return;

        try {

            setError("");
            setSuccess("");

            await API.delete(`/jobs/${id}`);

            setSuccess("Application deleted successfully!");

            if (editingId === id) {
                resetForm();
            }

            await fetchApplications();

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to delete application."
            );

        }
    };

    const cancelEdit = () => {

        resetForm();
        setError("");
        setSuccess("");

    };

    const formatDate = (date) => {

        if (!date) return "N/A";

        const parsedDate = new Date(date);

        if (isNaN(parsedDate.getTime())) return "N/A";

        return parsedDate.toLocaleDateString("en-IN");

    };

    const totalApplications = applications.length;

    const shortlisted = applications.filter(
        app => app.status === "Shortlisted"
    ).length;

    const interviews = applications.filter(
        app => app.status === "Interview"
    ).length;

    const selected = applications.filter(
        app => app.status === "Selected"
    ).length;

    return (

        <div className="job-tracker-page">

            <div className="job-tracker-header">

                <div>

                    <span className="job-tracker-badge">
                        CAREER MANAGEMENT
                    </span>

                    <h1>Job Application Tracker</h1>

                    <p>
                        Track your job applications and manage
                        your career journey.
                    </p>

                </div>

            </div>

            {error && (
                <div className="job-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="job-success">
                    {success}
                </div>
            )}

            <div className="job-stats">

                <div className="job-stat-card">
                    <h3>Total Applications</h3>
                    <h2>{totalApplications}</h2>
                </div>

                <div className="job-stat-card">
                    <h3>Shortlisted</h3>
                    <h2>{shortlisted}</h2>
                </div>

                <div className="job-stat-card">
                    <h3>Interviews</h3>
                    <h2>{interviews}</h2>
                </div>

                <div className="job-stat-card">
                    <h3>Selected</h3>
                    <h2>{selected}</h2>
                </div>

            </div>

            <div className="job-form-card">

                <h2>
                    {editingId
                        ? "Update Job Application"
                        : "Add New Job Application"}
                </h2>

                <form onSubmit={handleSubmit}>

                    <div className="job-form-grid">

                        <div className="job-input-group">

                            <label>Company Name *</label>

                            <input
                                type="text"
                                name="companyName"
                                placeholder="e.g. Google"
                                value={formData.companyName}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="job-input-group">

                            <label>Job Role *</label>

                            <input
                                type="text"
                                name="jobRole"
                                placeholder="e.g. Frontend Developer"
                                value={formData.jobRole}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="job-input-group">

                            <label>Location</label>

                            <input
                                type="text"
                                name="location"
                                placeholder="e.g. Bangalore"
                                value={formData.location}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="job-input-group">

                            <label>Job Type</label>

                            <select
                                name="jobType"
                                value={formData.jobType}
                                onChange={handleChange}
                            >

                                <option value="Full Time">Full Time</option>
                                <option value="Part Time">Part Time</option>
                                <option value="Internship">Internship</option>
                                <option value="Remote">Remote</option>
                                <option value="Contract">Contract</option>

                            </select>

                        </div>

                        <div className="job-input-group">

                            <label>Salary / Package</label>

                            <input
                                type="text"
                                name="salary"
                                placeholder="e.g. 6 LPA"
                                value={formData.salary}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="job-input-group">

                            <label>Application Date</label>

                            <input
                                type="date"
                                name="appliedDate"
                                value={formData.appliedDate}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="job-input-group">

                            <label>Interview Date</label>

                            <input
                                type="date"
                                name="interviewDate"
                                value={formData.interviewDate}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="job-input-group">

                            <label>Application Status</label>

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >

                                <option value="Applied">Applied</option>
                                <option value="Shortlisted">Shortlisted</option>
                                <option value="Interview">Interview</option>
                                <option value="Selected">Selected</option>
                                <option value="Rejected">Rejected</option>

                            </select>

                        </div>

                        <div className="job-input-group">

                            <label>Job Link</label>

                            <input
                                type="url"
                                name="jobLink"
                                placeholder="https://company.com/careers"
                                value={formData.jobLink}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="job-input-group">

                            <label>Job Description</label>

                            <input
                                type="text"
                                name="jobDescription"
                                placeholder="Brief job description"
                                value={formData.jobDescription}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="job-input-group">

                            <label>Notes</label>

                            <input
                                type="text"
                                name="notes"
                                placeholder="Additional information"
                                value={formData.notes}
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                    <div className="job-form-actions">

                        <button
                            type="submit"
                            disabled={submitting}
                        >

                            {submitting
                                ? "Please Wait..."
                                : editingId
                                    ? "Update Application"
                                    : "Add Application"}

                        </button>

                        {editingId && (

                            <button
                                type="button"
                                className="job-cancel-btn"
                                onClick={cancelEdit}
                            >
                                Cancel
                            </button>

                        )}

                    </div>

                </form>

            </div>

            <div className="job-list-card">

                <div className="job-list-header">

                    <h2>My Applications</h2>

                    <span>
                        {totalApplications} Applications
                    </span>

                </div>

                {loading && applications.length === 0 ? (

                    <p className="job-empty">
                        Loading applications...
                    </p>

                ) : applications.length === 0 ? (

                    <p className="job-empty">
                        No applications found. Add your first job!
                    </p>

                ) : (

                    <div className="job-table-wrapper">

                        <table className="job-table">

                            <thead>

                                <tr>
                                    <th>Company</th>
                                    <th>Job Role</th>
                                    <th>Location</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>

                            </thead>

                            <tbody>

                                {applications.map((app) => (

                                    <tr key={app._id}>

                                        <td>
                                            <strong>
                                                {app.companyName}
                                            </strong>
                                        </td>

                                        <td>
                                            {app.jobRole}
                                        </td>

                                        <td>
                                            {app.location || "N/A"}
                                        </td>

                                        <td>
                                            {formatDate(app.appliedDate)}
                                        </td>

                                        <td>

                                            <span
                                                className={`job-status ${(app.status || "Applied").toLowerCase()}`}
                                            >
                                                {app.status || "Applied"}
                                            </span>

                                        </td>

                                        <td>

                                            <button
                                                type="button"
                                                className="job-edit-btn"
                                                onClick={() => handleEdit(app)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="job-delete-btn"
                                                onClick={() => handleDelete(app._id)}
                                            >
                                                Delete
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>

    );

}

export default JobTracker;