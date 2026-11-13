import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await register({
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });

            if (response.success) {
                setSuccess("Registration successful!");

                setTimeout(() => {
                    navigate("/dashboard");
                }, 1000);
            } else {
                setError(response.message || "Registration failed");
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to register. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>

                <h1 style={styles.heading}>Create Account</h1>

                <p style={styles.subtitle}>
                    Register to get started
                </p>

                {error && (
                    <div style={styles.error}>{error}</div>
                )}

                {success && (
                    <div style={styles.success}>{success}</div>
                )}

                <form onSubmit={handleSubmit}>

                    <label style={styles.label}>Full Name</label>

                    <input
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />

                    <label style={styles.label}>Email Address</label>

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />

                    <label style={styles.label}>Password</label>

                    <input
                        type="password"
                        name="password"
                        placeholder="Minimum 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                        minLength={6}
                        required
                        style={styles.input}
                    />

                    <label style={styles.label}>Confirm Password</label>

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={styles.button}
                    >
                        {loading ? "Creating Account..." : "Register"}
                    </button>

                </form>

                <p style={styles.footer}>
                    Already have an account?{" "}
                    <Link to="/login" style={styles.link}>
                        Login
                    </Link>
                </p>

            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f1f5f9",
        padding: "20px",
    },

    card: {
        width: "100%",
        maxWidth: "430px",
        padding: "35px",
        background: "#ffffff",
        borderRadius: "15px",
        boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
    },

    heading: {
        fontSize: "28px",
        textAlign: "center",
        color: "#1e293b",
        marginBottom: "8px",
    },

    subtitle: {
        textAlign: "center",
        color: "#64748b",
        marginBottom: "25px",
    },

    label: {
        display: "block",
        marginBottom: "7px",
        fontWeight: "600",
        color: "#334155",
    },

    input: {
        width: "100%",
        padding: "12px",
        marginBottom: "17px",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        fontSize: "15px",
        boxSizing: "border-box",
    },

    button: {
        width: "100%",
        padding: "14px",
        background: "#2563eb",
        color: "#ffffff",
        border: "none",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer",
    },

    error: {
        padding: "12px",
        marginBottom: "15px",
        background: "#fee2e2",
        color: "#b91c1c",
        borderRadius: "8px",
    },

    success: {
        padding: "12px",
        marginBottom: "15px",
        background: "#dcfce7",
        color: "#15803d",
        borderRadius: "8px",
    },

    footer: {
        textAlign: "center",
        marginTop: "22px",
        color: "#64748b",
    },

    link: {
        color: "#2563eb",
        fontWeight: "600",
        textDecoration: "none",
    },
};

export default Register;