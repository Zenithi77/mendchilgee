import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import "./DemoPaymentPage.css";

const FUNCTIONS_BASE =
  import.meta.env.VITE_FUNCTIONS_BASE_URL ||
  `https://us-central1-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net`;

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref");
  const [status, setStatus] = useState(() => (ref ? "checking" : "no_ref"));
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!ref) return;

    let cancelled = false;
    const maxTries = 40;

    async function poll() {
      let tries = 0;
      while (tries < maxTries && !cancelled) {
        tries++;
        setAttempts(tries);
        try {
          const r = await fetch(
            `${FUNCTIONS_BASE}/checkPaymentStatus?ref=${encodeURIComponent(ref)}`,
          );
          if (!r.ok) break;
          const j = await r.json();
          if (j.status === "paid") {
            setStatus("paid");
            return;
          } else if (j.status === "not_found") {
            setStatus("not_found");
            return;
          }
        } catch (err) {
          console.error("Poll error:", err);
        }
        // Wait 2 seconds before next poll
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      if (!cancelled && status !== "paid") {
        setStatus("timeout");
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [ref]); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === "no_ref") {
    return (
      <div className="payment-status-page">
        <div className="status-icon">❓</div>
        <h1>No reference provided</h1>
        <Link to="/demo-payments">← Back to plans</Link>
      </div>
    );
  }

  if (status === "paid") {
    return (
      <div className="payment-status-page">
        <div className="status-icon">✅</div>
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase. Your plan is now active.</p>
        <Link to="/">← Go to My Gifts</Link>
      </div>
    );
  }

  if (status === "not_found") {
    return (
      <div className="payment-status-page">
        <div className="status-icon">🔍</div>
        <h1>Payment not found</h1>
        <p>We couldn&apos;t find this payment. Please contact support.</p>
        <Link to="/demo-payments">← Back to plans</Link>
      </div>
    );
  }

  if (status === "timeout") {
    return (
      <div className="payment-status-page">
        <div className="status-icon">⏳</div>
        <h1>Still processing…</h1>
        <p>Your payment is being confirmed. Please check back shortly.</p>
        <Link to="/">← Go to My Gifts</Link>
      </div>
    );
  }

  return (
    <div className="payment-status-page">
      <div className="status-icon">💳</div>
      <h1>Confirming payment…</h1>
      <div className="spinner" />
      <p>Attempt {attempts} — please wait</p>
    </div>
  );
}
