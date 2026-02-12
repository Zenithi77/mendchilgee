import { Link } from "react-router-dom";
import "./DemoPaymentPage.css";

export default function PaymentCancelPage() {
  return (
    <div className="payment-status-page">
      <div className="status-icon">😔</div>
      <h1>Payment Cancelled</h1>
      <p>Your payment was cancelled. No charges were made.</p>
      <Link to="/demo-payments">← Back to plans</Link>
    </div>
  );
}
