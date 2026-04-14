import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showWarning, setShowWarning] = useState(false);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShowWarning(true);
      const timer = setTimeout(() => {
        setRedirect(true);
      }, 2000); // Show warning for 2 seconds before redirect
      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            border: "5px solid var(--border)",
            borderTopColor: "var(--primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
          className="spinner"
        ></div>
        <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>
          Loading...
        </p>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!user) {
    if (redirect) {
      return <Navigate to="/signup" state={{ from: location }} replace />;
    }

    if (showWarning) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            flexDirection: "column",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div
            className="glass"
            style={{
              padding: "3rem",
              borderRadius: "16px",
              border: "1px solid #ec4899",
              boxShadow: "0 0 30px rgba(236, 72, 153, 0.2)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h2
              style={{
                color: "#ec4899",
                fontSize: "2rem",
                marginBottom: "1rem",
              }}
            >
              ⚠️ Access Denied
            </h2>
            <p style={{ fontSize: "1.2rem", color: "var(--text-main)" }}>
              You must sign up first to access this page.
            </p>
            <p
              style={{
                color: "var(--text-muted)",
                marginTop: "1rem",
                fontSize: "0.9rem",
              }}
            >
              Redirecting to signup page...
            </p>
            <div
              style={{
                marginTop: "2rem",
                width: "40px",
                height: "40px",
                border: "4px solid rgba(236, 72, 153, 0.2)",
                borderTopColor: "#ec4899",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
          </div>
          <style>{`
                  @keyframes spin { 100% { transform: rotate(360deg); } }
                 `}</style>
        </div>
      );
    }
  }

  return children;
}
