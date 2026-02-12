import { useState } from "react";
import "./DemoPaymentPage.css";

const FUNCTIONS_BASE =
  import.meta.env.VITE_FUNCTIONS_BASE_URL ||
  `https://us-central1-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net`;

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "5,000₮",
    features: ["1 Valentine gift", "Basic templates", "Share link"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "15,000₮",
    features: [
      "Unlimited gifts",
      "All templates",
      "Custom music",
      "Priority support",
    ],
  },
  {
    id: "subscription",
    name: "Subscription",
    price: "5,000₮/mo",
    features: [
      "Everything in Premium",
      "Monthly new templates",
      "Early access",
    ],
  },
];

export default function DemoPaymentPage() {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  async function createCheckout(plan) {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch(`${FUNCTIONS_BASE}/createBylCheckout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (!res.ok) {
        console.error(json);
        setError("Payment initialization failed. Please try again.");
        return;
      }
      // Redirect to BYL checkout page
      window.location.href = json.checkoutUrl;
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="demo-payment-page">
      <div className="payment-header">
        <h1>💝 Choose Your Plan</h1>
        <p>Create unforgettable Valentine gifts for your loved ones</p>
      </div>

      {error && <div className="payment-error">{error}</div>}

      <div className="plans-grid">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.id === "premium" ? "featured" : ""}`}
          >
            {plan.id === "premium" && (
              <span className="plan-badge">Most Popular</span>
            )}
            <h2>{plan.name}</h2>
            <div className="plan-price">{plan.price}</div>
            <ul className="plan-features">
              {plan.features.map((f, i) => (
                <li key={i}>✓ {f}</li>
              ))}
            </ul>
            <button
              className="plan-btn"
              disabled={loading !== null}
              onClick={() => createCheckout(plan.id)}
            >
              {loading === plan.id ? "Processing…" : "Get Started"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
