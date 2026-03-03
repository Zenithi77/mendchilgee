// ═══════════════════════════════════════════════════════════════
// PromoRedeemPage — Landing page for /promo/:code QR scans
// Requires login, then auto-redeems the promo code
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { redeemPromoCode } from "../services/creditService";
import AuthPage from "./AuthPage";
import { MdCheckCircle, MdError, MdHome } from "react-icons/md";

export default function PromoRedeemPage() {
  const { code } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending"); // pending | redeeming | success | error
  const [message, setMessage] = useState("");
  const [credits, setCredits] = useState(0);
  const hasRedeemed = useRef(false);

  useEffect(() => {
    if (loading || !user || hasRedeemed.current) return;
    hasRedeemed.current = true;

    // Use microtask to avoid synchronous setState in effect
    Promise.resolve().then(() => {
      setStatus("redeeming");
      redeemPromoCode(code, user.uid)
        .then((data) => {
          setStatus("success");
          setCredits(data.newCredits);
          setMessage(`Амжилттай! Та одоо ${data.newCredits} эрхтэй боллоо.`);
        })
        .catch((err) => {
          setStatus("error");
          setMessage(err.message);
        });
    });
  }, [user, loading, code]);

  // Loading state
  if (loading) {
    return (
      <div className="app">
        <div className="loader-wrap">
          <div className="loader-ring" />
          <span className="loader-text">Ачааллаж байна</span>
        </div>
      </div>
    );
  }

  // Not logged in — show auth page
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="app">
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
        }}
      >
        {status === "redeeming" && (
          <>
            <div className="loader-ring" style={{ marginBottom: 16 }} />
            <p style={{ color: "#bbb", fontSize: "0.95rem" }}>
              Промо код ашиглаж байна...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <MdCheckCircle
              style={{ fontSize: "4rem", color: "#4ade80", marginBottom: 12 }}
            />
            <h2
              style={{
                color: "#fff",
                fontSize: "1.5rem",
                fontWeight: 800,
                margin: "0 0 8px",
              }}
            >
              🎉 Амжилттай!
            </h2>
            <p
              style={{
                color: "#999",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                margin: "0 0 24px",
              }}
            >
              {message}
            </p>
            <div
              style={{
                background: "rgba(139, 92, 246, 0.1)",
                border: "1px solid rgba(139, 92, 246, 0.2)",
                borderRadius: 14,
                padding: "16px 32px",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  color: "#a78bfa",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Таны эрх
              </div>
              <div
                style={{
                  color: "#fff",
                  fontSize: "2rem",
                  fontWeight: 800,
                }}
              >
                🎁 {credits}
              </div>
            </div>
            <button
              onClick={() => navigate("/")}
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                border: "none",
                color: "#fff",
                padding: "14px 32px",
                borderRadius: 14,
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <MdHome /> Нүүр хуудас руу
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <MdError
              style={{ fontSize: "4rem", color: "#f87171", marginBottom: 12 }}
            />
            <h2
              style={{
                color: "#fff",
                fontSize: "1.5rem",
                fontWeight: 800,
                margin: "0 0 8px",
              }}
            >
              Алдаа гарлаа
            </h2>
            <p
              style={{
                color: "#999",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                margin: "0 0 24px",
              }}
            >
              {message}
            </p>
            <button
              onClick={() => navigate("/")}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#ccc",
                padding: "14px 32px",
                borderRadius: 14,
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <MdHome /> Нүүр хуудас руу
            </button>
          </>
        )}
      </div>
    </div>
  );
}
