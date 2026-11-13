import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await login(formData);

            if (response.success) {
                navigate("/dashboard");
            } else {
                setError(response.message || "Login failed");
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Invalid email or password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>

                <h1 style={styles.heading}>Welcome Back</h1>

                <p style={styles.subtitle}>
                    Login to your CareerPilot AI account
                </p>

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <label style={styles.label}>
                        Email Address
                    </label>

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />

                    <label style={styles.label}>
                        Password
                    </label>

                    <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={styles.button}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <p style={styles.registerText}>
                    Don't have an account?{" "}

                    <Link
                        to="/register"
                        style={styles.registerLink}
                    >
                        Create Account
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

    registerText: {
        textAlign: "center",
        marginTop: "22px",
        color: "#64748b",
        fontSize: "14px",
    },

    registerLink: {
        color: "#2563eb",
        fontWeight: "600",
        textDecoration: "none",
    },
};

export default Login;