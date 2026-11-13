import { useState } from "react";
import jsPDF from "jspdf";
import API from "../services/api";
import "./ResumeAnalyzer.css";

function ResumeAnalyzer() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    // ======================================
    // FILE VALIDATION
    // ======================================

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
            setError("Please select a valid PDF resume.");
            e.target.value = "";
            return;
        }

        if (selected.size > 5 * 1024 * 1024) {
            setFile(null);
            setError("PDF size must be less than 5 MB.");
            e.target.value = "";
            return;
        }

        setFile(selected);
    };

    // ======================================
    // ANALYZE RESUME
    // ======================================

    const handleAnalyze = async () => {
        if (!file) {
            setError("Please upload your PDF resume first.");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("resume", file);

            const response = await API.post(
                "/resume-analyzer/analyze",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            if (
                response.data.success &&
                response.data.analysis
            ) {
                setResult(response.data.analysis);
            } else {
                setError(
                    response.data.message ||
                    "Resume analysis failed."
                );
            }

        } catch (err) {
            console.error("Resume Analyzer Error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to analyze resume. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    // ======================================
    // ATS SCORE
    // ======================================

    const score = Math.min(
        100,
        Math.max(0, Number(result?.atsScore) || 0)
    );

    const getScoreLabel = () => {
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Good";
        if (score >= 40) return "Average";
        return "Needs Improvement";
    };

    // ======================================
    // SECTION SCORES
    // ======================================

    const sectionScores = [
        {
            name: "Contact Information",
            score: result?.sectionScores?.contactInformation
        },
        {
            name: "Education",
            score: result?.sectionScores?.education
        },
        {
            name: "Technical Skills",
            score: result?.sectionScores?.technicalSkills
        },
        {
            name: "Projects",
            score: result?.sectionScores?.projects
        },
        {
            name: "Experience",
            score: result?.sectionScores?.experience
        }
    ];

    const getSectionScore = (value) => {
        return Math.min(
            100,
            Math.max(0, Number(value) || 0)
        );
    };

    // ======================================
    // SAFE ARRAY HANDLER
    // ======================================

    const safeArray = (items) => {
        return Array.isArray(items) ? items : [];
    };

    // ======================================
    // RENDER LIST
    // ======================================

    const renderList = (items, emptyMessage) => {
        const list = safeArray(items);

        if (list.length === 0) {
            return (
                <p className="empty-result">
                    {emptyMessage}
                </p>
            );
        }

        return (
            <ul>
                {list.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        );
    };

    // ======================================
    // RENDER SKILL TAGS
    // ======================================

    const renderTags = (items, emptyMessage) => {
        const list = safeArray(items);

        if (list.length === 0) {
            return (
                <p className="empty-result">
                    {emptyMessage}
                </p>
            );
        }

        return (
            <div className="skill-tags">
                {list.map((item, index) => (
                    <span key={index}>
                        {item}
                    </span>
                ))}
            </div>
        );
    };

    // ======================================
    // PDF DOWNLOAD
    // ======================================

    const handleDownloadPDF = () => {
        if (!result) return;

        try {
            const pdf = new jsPDF();

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const margin = 18;
            const contentWidth = pageWidth - margin * 2;

            let y = 55;

            // ----------------------------------
            // TEXT HELPER
            // ----------------------------------

            const addText = (
                text,
                fontSize = 11,
                color = [60, 70, 90]
            ) => {
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(fontSize);
                pdf.setTextColor(...color);

                const lines = pdf.splitTextToSize(
                    String(text || ""),
                    contentWidth
                );

                const lineHeight = fontSize * 0.48;
                const requiredHeight =
                    lines.length * lineHeight + 5;

                if (y + requiredHeight > pageHeight - 20) {
                    pdf.addPage();
                    y = 20;
                }

                pdf.text(lines, margin, y);

                y += requiredHeight;
            };

            // ----------------------------------
            // SECTION HELPER
            // ----------------------------------

            const addSection = (title, items) => {
                if (y > pageHeight - 45) {
                    pdf.addPage();
                    y = 20;
                }

                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(14);
                pdf.setTextColor(81, 69, 205);

                pdf.text(title, margin, y);

                y += 10;

                pdf.setFont("helvetica", "normal");

                const list = safeArray(items);

                if (list.length > 0) {
                    list.forEach((item) => {
                        addText("- " + item, 10);
                    });
                } else {
                    addText("No information available.", 10);
                }

                y += 5;
            };

            // ----------------------------------
            // PDF HEADER
            // ----------------------------------

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
                "Advanced Resume Analysis Report",
                margin,
                29
            );

            // ----------------------------------
            // ATS SCORE
            // ----------------------------------

            pdf.setFont("helvetica", "bold");

            addText(
                "ATS SCORE: " + score + "/100",
                18,
                [81, 69, 205]
            );

            addText(
                "Performance: " + getScoreLabel()
            );

            addText(
                "Resume Quality: " +
                (result.resumeQuality || "Not available")
            );

            addText(
                "Detected Role: " +
                (result.detectedRole || "Not identified")
            );

            addText(
                "Generated: " +
                new Date().toLocaleDateString()
            );

            y += 5;

            // ----------------------------------
            // SECTION SCORES
            // ----------------------------------

            pdf.setFont("helvetica", "bold");
            addText("RESUME SECTION SCORES", 14, [81, 69, 205]);

            sectionScores.forEach((section) => {
                addText(
                    `${section.name}: ${getSectionScore(section.score)}/100`,
                    10
                );
            });

            y += 5;

            // ----------------------------------
            // SKILLS
            // ----------------------------------

            addSection(
                "TECHNICAL SKILLS",
                result.technicalSkills
            );

            addSection(
                "SOFT SKILLS",
                result.softSkills
            );

            addSection(
                "ATS KEYWORDS",
                result.keywords
            );

            // ----------------------------------
            // ANALYSIS
            // ----------------------------------

            addSection(
                "STRENGTHS",
                result.strengths
            );

            addSection(
                "WEAKNESSES",
                result.weaknesses
            );

            addSection(
                "MISSING SKILLS",
                result.missingSkills
            );

            addSection(
                "IMPROVEMENT SUGGESTIONS",
                result.suggestions
            );

            addSection(
                "AI PROFESSIONAL SUMMARY",
                result.summary
                    ? [result.summary]
                    : []
            );

            // ----------------------------------
            // PDF FOOTER
            // ----------------------------------

            const totalPages =
                pdf.internal.getNumberOfPages();

            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(8);
                pdf.setTextColor(140, 140, 140);

                pdf.text(
                    "CareerPilot AI | Confidential Resume Analysis",
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
                "CareerPilot_AI_Resume_Report.pdf"
            );

        } catch (err) {
            console.error("PDF Download Error:", err);

            setError(
                "Unable to generate PDF report. Please try again."
            );
        }
    };

    // ======================================
    // RESET
    // ======================================

    const handleReset = () => {
        setFile(null);
        setResult(null);
        setError("");

        const input = document.getElementById(
            "resume-upload"
        );

        if (input) {
            input.value = "";
        }
    };

    // ======================================
    // MAIN UI
    // ======================================

    return (
        <div className="analyzer-page">

            {/* HEADER */}

            <div className="analyzer-header">

                <span className="analyzer-badge">
                    ✨ AI POWERED TOOL
                </span>

                <h1>AI Resume Analyzer</h1>

                <p>
                    Get intelligent resume insights, check your ATS
                    score and improve your chances of getting shortlisted.
                </p>

            </div>

            {/* ==================================
                UPLOAD SECTION
            ================================== */}

            {!result && (

                <div className="analyzer-upload-card">

                    <div className="upload-icon">
                        📄
                    </div>

                    <h2>Upload Your Resume</h2>

                    <p>
                        Let AI analyze your resume and provide
                        professional feedback.
                    </p>

                    <label className="upload-box">

                        <input
                            id="resume-upload"
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileChange}
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
                        <div className="file-success">
                            ✅ Resume selected successfully!
                        </div>
                    )}

                    {error && (
                        <div className="analyzer-error">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        className="analyze-button"
                        onClick={handleAnalyze}
                        disabled={loading || !file}
                    >
                        {loading
                            ? "⏳ AI is Analyzing Your Resume..."
                            : "✨ Analyze My Resume"}
                    </button>

                    {loading && (
                        <div className="analysis-loading">

                            <div className="loading-spinner"></div>

                            <p>
                                Please wait while AI evaluates
                                your resume...
                            </p>

                        </div>
                    )}

                </div>
            )}

            {/* ==================================
                ANALYSIS RESULTS
            ================================== */}

            {result && (

                <div className="analysis-results">

                    {/* RESULTS HEADER */}

                    <div className="results-heading">

                        <div>

                            <span className="analyzer-badge">
                                📊 AI ANALYSIS COMPLETED
                            </span>

                            <h2>
                                Resume Analysis Report
                            </h2>

                            <p>
                                Here is your detailed resume performance report.
                            </p>

                        </div>

                        <button
                            className="reset-button"
                            onClick={handleReset}
                        >
                            + Analyze Another Resume
                        </button>

                    </div>

                    {/* ==================================
                        ATS SCORE CARD
                    ================================== */}

                    <div className="score-card">

                        <div
                            className="score-circle"
                            style={{
                                "--score": `${score * 3.6}deg`
                            }}
                        >

                            <div className="score-inner">

                                <strong>
                                    {score}
                                </strong>

                                <span>/100</span>

                            </div>

                        </div>

                        <div className="score-details">

                            <span className="score-label">
                                YOUR ATS PERFORMANCE
                            </span>

                            <h3>
                                {getScoreLabel()}
                            </h3>

                            <p>
                                Resume Quality:{" "}
                                <strong>
                                    {result.resumeQuality || "Not available"}
                                </strong>
                            </p>

                            <p>
                                Your resume has been evaluated
                                using AI-powered analysis.
                            </p>

                        </div>

                    </div>

                    {/* ==================================
                        DETECTED PROFESSIONAL ROLE
                    ================================== */}

                    <div className="detected-role-card">

                        <div className="role-icon">
                            💼
                        </div>

                        <div>

                            <span>
                                DETECTED PROFESSIONAL ROLE
                            </span>

                            <h3>
                                {result.detectedRole || "Not Identified"}
                            </h3>

                        </div>

                    </div>

                    {/* ==================================
                        RESUME SECTION ANALYSIS
                    ================================== */}

                    <div className="section-analysis-card">

                        <h3>
                            📊 Resume Section Analysis
                        </h3>

                        <p>
                            Performance across different resume sections.
                        </p>

                        {sectionScores.map((section) => {

                            const sectionScore =
                                getSectionScore(section.score);

                            return (

                                <div
                                    className="section-score-item"
                                    key={section.name}
                                >

                                    <div className="section-score-header">

                                        <strong>
                                            {section.name}
                                        </strong>

                                        <span>
                                            {sectionScore}/100
                                        </span>

                                    </div>

                                    <div className="section-progress">

                                        <div
                                            className="section-progress-fill"
                                            style={{
                                                width: `${sectionScore}%`
                                            }}
                                        />

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                    {/* ==================================
                        ADVANCED SKILLS ANALYSIS
                    ================================== */}

                    <div className="advanced-skills-grid">

                        {/* TECHNICAL SKILLS */}

                        <div className="advanced-skill-card technical-card">

                            <h3>
                                💻 Technical Skills
                            </h3>

                            {renderTags(
                                result.technicalSkills,
                                "No technical skills detected."
                            )}

                        </div>

                        {/* SOFT SKILLS */}

                        <div className="advanced-skill-card soft-card">

                            <h3>
                                🤝 Soft Skills
                            </h3>

                            {renderTags(
                                result.softSkills,
                                "No soft skills detected."
                            )}

                        </div>

                        {/* ATS KEYWORDS */}

                        <div className="advanced-skill-card keyword-card">

                            <h3>
                                🔑 ATS Keywords
                            </h3>

                            {renderTags(
                                result.keywords,
                                "No ATS keywords detected."
                            )}

                        </div>

                    </div>

                    {/* ==================================
                        ANALYSIS RESULT GRID
                    ================================== */}

                    <div className="result-grid">

                        <div className="result-card strengths-card">

                            <h3>
                                💪 Strengths
                            </h3>

                            {renderList(
                                result.strengths,
                                "No strengths identified."
                            )}

                        </div>

                        <div className="result-card weaknesses-card">

                            <h3>
                                ⚠️ Weaknesses
                            </h3>

                            {renderList(
                                result.weaknesses,
                                "No weaknesses identified."
                            )}

                        </div>

                        <div className="result-card skills-card">

                            <h3>
                                🎯 Missing Skills
                            </h3>

                            {renderList(
                                result.missingSkills,
                                "No missing skills identified."
                            )}

                        </div>

                        <div className="result-card suggestions-card">

                            <h3>
                                🚀 Improvement Suggestions
                            </h3>

                            {renderList(
                                result.suggestions,
                                "No suggestions available."
                            )}

                        </div>

                    </div>

                    {/* ==================================
                        AI SUMMARY
                    ================================== */}

                    <div className="summary-card">

                        <h3>
                            📝 AI Professional Summary
                        </h3>

                        <p>
                            {result.summary || "No summary available."}
                        </p>

                    </div>

                    {/* ==================================
                        PDF DOWNLOAD
                    ================================== */}

                    <div className="download-report-section">

                        <button
                            className="download-pdf-button"
                            onClick={handleDownloadPDF}
                        >
                            📥 Download ATS Report (PDF)
                        </button>

                    </div>

                    {/* FOOTER */}

                    <div className="analysis-footer">

                        <span>
                            ✨ Powered by Gemini AI
                        </span>

                        <span>
                            CareerPilot AI
                        </span>

                    </div>

                    <button
                        className="reset-button bottom-reset"
                        onClick={handleReset}
                    >
                        Analyze Another Resume
                    </button>

                </div>

            )}

        </div>
    );
}

export default ResumeAnalyzer;