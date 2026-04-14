import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/signup", {
        username,
        email,
        password,
      });
      login(res.data.token, {
        username: res.data.username,
        email: res.data.email,
        _id: res.data._id,
      });
      navigate("/wall");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div
      className="glass auth-container"
      style={{ maxWidth: "400px", margin: "4rem auto", padding: "2rem" }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        Join DreamConnect
      </h2>
      {error && (
        <div
          className="error-message"
          style={{
            color: "#ff4d4f",
            marginBottom: "1rem",
            textAlign: "center",
            fontSize: "0.9rem",
          }}
        >
          {error}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="btn"
          style={{ width: "100%", marginTop: "0.5rem" }}
        >
          Sign Up
        </button>
      </form>
      <div
        style={{
          textAlign: "center",
          marginTop: "1.5rem",
          color: "var(--text-muted)",
        }}
      >
        Already have an account?{" "}
        <Link
          to="/login"
          style={{ color: "var(--primary)", textDecoration: "none" }}
        >
          Login
        </Link>
      </div>
    </div>
  );
}
