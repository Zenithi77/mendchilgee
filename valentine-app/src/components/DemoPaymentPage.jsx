import { useState } from "react";
import { MdAutoAwesome, MdCheck } from "react-icons/md";
import "./DemoPaymentPage.css";

const FUNCTIONS_BASE =
  import.meta.env.VITE_FUNCTIONS_BASE_URL ||
  `https://us-central1-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net`;

const PLANS = [
  {
    id: "basic",
    name: "Суурь",
    price: "5,000₮",
    features: ["1 мэндчилгээ", "Суурь загварууд", "Хуваалцах линк"],
  },
  {
    id: "premium",
    name: "Премиум",
    price: "15,000₮",
    features: [
      "Хязгааргүй мэндчилгээ",
      "Бүх загвар",
      "Хөгжим нэмэх",
      "Тэргүүн дэмжлэг",
    ],
  },
  {
    id: "subscription",
    name: "Бүртгэл",
    price: "5,000₮/сар",
    features: [
      "Премиум бүх боломж",
      "Шинэ загварууд сар бүр",
      "Эрт хүртээмжтэй",
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
        setError("Төлбөр эхлүүлэх амжилтгүй боллоо. Дахин оролдоно уу.");
        return;
      }
      // Redirect to BYL checkout page
      window.location.href = json.checkoutUrl;
    } catch (err) {
      console.error(err);
      setError("Сүлжээний алдаа. Дахин оролдоно уу.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="demo-payment-page">
      <div className="payment-header">
        <h1><MdAutoAwesome /> Төлөвлөгөө сонгох</h1>
        <p>Хайртай хүмүүстээ онцгой мэндчилгээ илгээрэй</p>
      </div>

      {error && <div className="payment-error">{error}</div>}

      <div className="plans-grid">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.id === "premium" ? "featured" : ""}`}
          >
            {plan.id === "premium" && (
              <span className="plan-badge">Хамгийн их сонгодог</span>
            )}
            <h2>{plan.name}</h2>
            <div className="plan-price">{plan.price}</div>
            <ul className="plan-features">
              {plan.features.map((f, i) => (
                <li key={i}><MdCheck /> {f}</li>
              ))}
            </ul>
            <button
              className="plan-btn"
              disabled={loading !== null}
              onClick={() => createCheckout(plan.id)}
            >
              {loading === plan.id ? "Боловсруулж байна…" : "Эхлүүлэх"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
