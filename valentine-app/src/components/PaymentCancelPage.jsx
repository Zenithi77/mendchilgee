import { Link, useSearchParams } from "react-router-dom";
import "./DemoPaymentPage.css";

export default function PaymentCancelPage() {
  const [searchParams] = useSearchParams();
  const giftId = searchParams.get("giftId");

  return (
    <div className="payment-status-page">
      <div className="status-icon">😔</div>
      <h1>Төлбөр цуцлагдлаа</h1>
      <p>Таны төлбөр цуцлагдлаа. Ямар ч төлбөр авагдаагүй.</p>
      <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
        Таны бэлэг хадгалагдсан хэвээр байна. 💕
      </p>
      {giftId ? (
        <Link to="/">← Бэлэг рүүгээ буцах</Link>
      ) : (
        <Link to="/">← Нүүр хуудас руу буцах</Link>
      )}
    </div>
  );
}
