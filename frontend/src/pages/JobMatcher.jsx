import { useState } from "react";
import jsPDF from "jspdf";
import API from "../services/api";
import "./JobMatcher.css";

function JobMatcher() {

    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const handleFileChange = (e) => {

        const selected = e.target.files?.[0];

        setError("");
        setResult(null);

        if (!selected) {
            setFile(null);
            return;
        }

        if (
            selected.type !== "application/pdf" ||
            !selected.name.toLowerCase().endsWith(".pdf")
        ) {
            setFile(null);
            e.target.value = "";

            setError("Please select a valid PDF resume.");
            return;
        }

        if (selected.size > 5 * 1024 * 1024) {
            setFile(null);
            e.target.value = "";

            setError("PDF size must be less than 5 MB.");
            return;
        }

        setFile(selected);
    };

    const handleJobMatch = async () => {

        setError("");

        if (!file) {
            setError("Please upload your PDF resume first.");
            return;
        }

        if (!jobDescription.trim()) {
            setError("Please enter the job description.");
            return;
        }

        if (jobDescription.trim().length < 50) {
            setError(
                "Job description must contain at least 50 characters."
            );
            return;
        }

        if (jobDescription.trim().length > 15000) {
            setError("Job description is too long.");
            return;
        }

        setLoading(true);
        setResult(null);

        try {

            const formData = new FormData();

            formData.append("resume", file);

            formData.append(
                "jobDescription",
                jobDescription.trim()
            );

            const response = await API.post(
                "/resume-analyzer/job-match",
                formData
            );

            if (
                response.data?.success &&
                response.data?.result
            ) {

                setResult(response.data.result);

            } else {

                setError(
                    response.data?.message ||
                    "Job matching failed. Please try again."
                );
            }

        } catch (err) {

            console.error("Job Matcher Error:", err);

            const status = err.response?.status;

            if (status === 429) {

                setError(
                    "Gemini API free quota reached. Please try again after quota resets."
                );

            } else if (status === 503) {

                setError(
                    "AI service is currently busy. Please try again later."
                );

            } else {

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Unable to match your resume. Please try again."
                );
            }

        } finally {

            setLoading(false);
        }
    };

    const score = Math.min(
        100,
        Math.max(
            0,
            Number(result?.matchScore) || 0
        )
    );

    const getMatchLabel = () => {

        if (score >= 80) return "Excellent Match";

        if (score >= 60) return "Good Match";

        if (score >= 40) return "Moderate Match";

        return "Low Match";
    };

    const renderList = (items, emptyMessage) => {

        if (!Array.isArray(items) || items.length === 0) {

            return (
                <p className="jm-empty">
                    {emptyMessage}
                </p>
            );
        }

        return (

            <ul className="jm-list">

                {items.map((item, index) => (

                    <li key={`${item}-${index}`}>
                        {item}
                    </li>

                ))}

            </ul>
        );
    };

    const handleDownloadPDF = () => {

        if (!result) return;

        try {

            const pdf = new jsPDF();

            const pageWidth =
                pdf.internal.pageSize.getWidth();

            const pageHeight =
                pdf.internal.pageSize.getHeight();

            const margin = 18;

            const contentWidth =
                pageWidth - margin * 2;

            let y = 20;

            const addText = (
                text,
                fontSize = 11,
                color = [60, 70, 90]
            ) => {

                pdf.setFontSize(fontSize);
                pdf.setTextColor(...color);

                const lines = pdf.splitTextToSize(
                    String(text || ""),
                    contentWidth
                );

                const lineHeight = fontSize * 0.5;

                if (
                    y + lines.length * lineHeight >
                    pageHeight - 20
                ) {

                    pdf.addPage();
                    y = 20;
                }

                pdf.text(lines, margin, y);

                y += lines.length * lineHeight + 5;
            };

            const addSection = (title, items) => {

                if (y > pageHeight - 45) {

                    pdf.addPage();
                    y = 20;
                }

                pdf.setFont("helvetica", "bold");

                addText(
                    title,
                    15,
                    [81, 69, 205]
                );

                pdf.setFont("helvetica", "normal");

                if (
                    Array.isArray(items) &&
                    items.length > 0
                ) {

                    items.forEach((item) => {

                        addText("• " + item, 10);

                    });

                } else {

                    addText(
                        "No information available.",
                        10
                    );
                }

                y += 5;
            };

            pdf.setFillColor(81, 69, 205);

            pdf.rect(
                0,
                0,
                pageWidth,
                42,
                "F"
            );

            pdf.setTextColor(255, 255, 255);

            pdf.setFont("helvetica", "bold");

            pdf.setFontSize(21);

            pdf.text(
                "CareerPilot AI",
                margin,
                18
            );

            pdf.setFontSize(12);

            pdf.text(
                "AI Job Matching Report",
                margin,
                29
            );

            y = 55;

            pdf.setFont("helvetica", "bold");

            addText(
                `JOB MATCH SCORE: ${score}%`,
                19,
                [81, 69, 205]
            );

            pdf.setFont("helvetica", "normal");

            addText(
                `Match Level: ${result.matchLevel || getMatchLabel()}`
            );

            addText(
                `Generated: ${new Date().toLocaleDateString()}`
            );

            addText(
                `Resume: ${file?.name || "Uploaded Resume"}`
            );

            y += 5;

            addSection(
                "MATCHED SKILLS",
                result.matchedSkills
            );

            addSection(
                "MISSING SKILLS",
                result.missingSkills
            );

            addSection(
                "CANDIDATE STRENGTHS",
                result.strengths
            );

            addSection(
                "IMPROVEMENT SUGGESTIONS",
                result.improvementSuggestions
            );

            addSection(
                "AI MATCHING SUMMARY",
                result.summary
                    ? [result.summary]
                    : []
            );

            const totalPages =
                pdf.internal.getNumberOfPages();

            for (
                let i = 1;
                i <= totalPages;
                i++
            ) {

                pdf.setPage(i);

                pdf.setFontSize(9);

                pdf.setTextColor(
                    140,
                    140,
                    140
                );

                pdf.text(
                    "CareerPilot AI | Job Matching Report",
                    margin,
                    pageHeight - 10
                );

                pdf.text(
                    `Page ${i} of ${totalPages}`,
                    pageWidth - margin,
                    pageHeight - 10,
                    {
                        align: "right"
                    }
                );
            }

            pdf.save(
                "CareerPilot_AI_Job_Match_Report.pdf"
            );

        } catch (err) {

            console.error(
                "PDF Download Error:",
                err
            );

            setError(
                "Unable to generate PDF report."
            );
        }
    };

    const handleReset = () => {

        setFile(null);
        setJobDescription("");
        setResult(null);
        setError("");

        const input = document.getElementById(
            "job-resume-upload"
        );

        if (input) {
            input.value = "";
        }
    };

    return (

        <div className="job-matcher-page">

            <div className="jm-header">

                <div>

                    <span className="jm-badge">
                        ✨ AI POWERED TOOL
                    </span>

                    <h1>AI Job Matcher</h1>

                    <p>
                        Compare your resume with job requirements
                        and discover how well you match the role.
                    </p>

                </div>

            </div>

            {!result && (

                <div className="jm-main-card">

                    <div className="jm-upload-icon">
                        🎯
                    </div>

                    <h2>
                        Find Your Perfect Job Match
                    </h2>

                    <p className="jm-description">
                        Upload your resume and paste the job
                        description to get an AI-powered matching report.
                    </p>

                    <div className="jm-form-group">

                        <label>
                            📄 Upload Your Resume
                        </label>

                        <label
                            className="jm-upload-box"
                            htmlFor="job-resume-upload"
                        >

                            <input
                                id="job-resume-upload"
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handleFileChange}
                                disabled={loading}
                            />

                            <span>📤</span>

                            <strong>
                                {file
                                    ? file.name
                                    : "Choose Your PDF Resume"}
                            </strong>

                            <small>
                                PDF format • Maximum 5 MB
                            </small>

                        </label>

                        {file && (

                            <div className="jm-file-success">

                                ✅ Resume selected successfully!

                                <button
                                    type="button"
                                    onClick={() => {
                                        setFile(null);

                                        const input =
                                            document.getElementById(
                                                "job-resume-upload"
                                            );

                                        if (input) {
                                            input.value = "";
                                        }
                                    }}
                                >
                                    Remove
                                </button>

                            </div>

                        )}

                    </div>

                    <div className="jm-form-group">

                        <label htmlFor="job-description">
                            💼 Job Description
                        </label>

                        <textarea
                            id="job-description"
                            className="jm-textarea"
                            placeholder={`Paste the complete job description here...

Example:

We are looking for a Full Stack Developer with knowledge of React.js, Node.js, Express.js, MongoDB, JavaScript and REST APIs.

Requirements:
- Strong JavaScript fundamentals
- Experience with React.js
- Knowledge of Node.js and Express
- Database knowledge
- Problem solving skills`}
                            value={jobDescription}
                            onChange={(e) => {

                                setJobDescription(
                                    e.target.value
                                );

                                setError("");
                                setResult(null);
                            }}
                            rows={9}
                            maxLength={15000}
                            disabled={loading}
                        />

                        <div className="jm-character-count">

                            <span>
                                Minimum 50 characters required
                            </span>

                            <span>
                                {jobDescription.length}/15000
                            </span>

                        </div>

                    </div>

                    {error && (

                        <div
                            className="jm-error"
                            role="alert"
                        >
                            ⚠️ {error}
                        </div>

                    )}

                    <button
                        type="button"
                        className="jm-analyze-button"
                        onClick={handleJobMatch}
                        disabled={
                            loading ||
                            !file ||
                            jobDescription.trim().length < 50
                        }
                    >

                        {loading
                            ? "⏳ AI is Matching Your Resume..."
                            : "🚀 Find My Job Match"}

                    </button>

                    {loading && (

                        <div
                            className="jm-loading"
                            aria-live="polite"
                        >

                            <div className="jm-spinner"></div>

                            <p>
                                AI is comparing your resume
                                with job requirements...
                            </p>

                            <small>
                                Please wait. This may take a few seconds.
                            </small>

                        </div>

                    )}

                </div>

            )}

            {result && (

                <div className="jm-results">

                    <div className="jm-results-header">

                        <div>

                            <span className="jm-badge">
                                📊 MATCHING COMPLETED
                            </span>

                            <h2>
                                Job Matching Report
                            </h2>

                            <p>
                                Here is your detailed job compatibility report.
                            </p>

                        </div>

                        <button
                            type="button"
                            className="jm-reset-button"
                            onClick={handleReset}
                        >
                            + New Job Match
                        </button>

                    </div>

                    <div className="jm-score-card">

                        <div
                            className="jm-score-circle"
                            style={{
                                "--score": `${score * 3.6}deg`
                            }}
                        >

                            <div className="jm-score-inner">

                                <strong>
                                    {score}%
                                </strong>

                                <span>
                                    Match Score
                                </span>

                            </div>

                        </div>

                        <div className="jm-score-details">

                            <span className="jm-score-label">
                                YOUR JOB COMPATIBILITY
                            </span>

                            <h3>
                                {result.matchLevel || getMatchLabel()}
                            </h3>

                            <p>
                                Your resume has a{" "}
                                <strong>{score}%</strong>{" "}
                                compatibility with this job description.
                            </p>

                            <p>
                                {result.summary ||
                                    "AI job matching analysis completed."}
                            </p>

                        </div>

                    </div>

                    <div className="jm-result-grid">

                        <div className="jm-result-card jm-matched-card">

                            <h3>
                                ✅ Matched Skills
                            </h3>

                            {renderList(
                                result.matchedSkills,
                                "No matched skills identified."
                            )}

                        </div>

                        <div className="jm-result-card jm-missing-card">

                            <h3>
                                ⚠️ Missing Skills
                            </h3>

                            {renderList(
                                result.missingSkills,
                                "No missing skills identified."
                            )}

                        </div>

                        <div className="jm-result-card jm-strength-card">

                            <h3>
                                💪 Candidate Strengths
                            </h3>

                            {renderList(
                                result.strengths,
                                "No strengths identified."
                            )}

                        </div>

                        <div className="jm-result-card jm-suggestions-card">

                            <h3>
                                🚀 Improvement Suggestions
                            </h3>

                            {renderList(
                                result.improvementSuggestions,
                                "No suggestions available."
                            )}

                        </div>

                    </div>

                    <div className="jm-summary-card">

                        <h3>
                            📝 AI Matching Summary
                        </h3>

                        <p>
                            {result.summary ||
                                "No summary available."}
                        </p>

                    </div>

                    <div className="jm-download-section">

                        <button
                            type="button"
                            className="jm-download-button"
                            onClick={handleDownloadPDF}
                        >
                            📥 Download Job Match Report (PDF)
                        </button>

                    </div>

                    <div className="jm-footer">

                        <span>
                            ✨ Powered by Gemini AI
                        </span>

                        <span>
                            CareerPilot AI
                        </span>

                    </div>

                    <button
                        type="button"
                        className="jm-reset-button jm-bottom-reset"
                        onClick={handleReset}
                    >
                        Analyze Another Job
                    </button>

                </div>

            )}

        </div>

    );
}

export default JobMatcher;