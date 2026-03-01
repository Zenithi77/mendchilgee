import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { MdWarning } from "react-icons/md";
import "./LegalPage.css";

const TermsReacceptModal = () => {
  const { acceptTerms } = useAuth();
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAccept = async () => {
    if (!accepted) return;
    setSaving(true);
    setError("");
    try {
      await acceptTerms();
    } catch {
      setError("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="terms-reaccept-overlay">
      <div className="terms-reaccept-card">
        <h2>Нөхцөл шинэчлэгдсэн</h2>
        <p>
          Бид Үйлчилгээний нөхцөл болон Нууцлалын бодлогоо шинэчилсэн байна.
          Үргэлжлүүлэхийн тулд шинэ нөхцөлийг зөвшөөрнө үү.
        </p>

        <div className={`auth-terms-group${error ? " auth-terms-error" : ""}`}>
          <input
            type="checkbox"
            id="reacceptTerms"
            className="auth-terms-checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            disabled={saving}
          />
          <label htmlFor="reacceptTerms" className="auth-terms-label">
            Би{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              Үйлчилгээний нөхцөл
            </a>{" "}
            болон{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              Нууцлалын бодлого
            </a>
            -г уншиж, зөвшөөрч байна.
          </label>
        </div>

        {error && <p className="auth-terms-error-msg"><MdWarning /> {error}</p>}

        <button
          className="terms-reaccept-btn"
          onClick={handleAccept}
          disabled={!accepted || saving}
        >
          {saving ? "Хадгалж байна..." : "Зөвшөөрөх"}
        </button>

        <div className="terms-reaccept-links">
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            Үйлчилгээний нөхцөл
          </a>
          <a href="/privacy" target="_blank" rel="noopener noreferrer">
            Нууцлалын бодлого
          </a>
        </div>
      </div>
    </div>
  );
};

export default TermsReacceptModal;
