import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PRIVACY_CONTENT, PRIVACY_LAST_UPDATED } from "../legal/privacy";
import "./LegalPage.css";

const PrivacyPage = () => {
  useEffect(() => {
    document.title = "Нууцлалын бодлого | bolzii.com";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "bolzii.com — Нууцлалын бодлого");
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page">
      <nav className="legal-nav">
        <Link to="/" className="legal-nav-home">
          ← Нүүр хуудас
        </Link>
        <Link to="/terms" className="legal-nav-link">
          Үйлчилгээний нөхцөл
        </Link>
      </nav>
      <main className="legal-content">
        <div
          className="legal-body"
          dangerouslySetInnerHTML={{ __html: PRIVACY_CONTENT }}
        />
        <p className="legal-updated">
          Сүүлд шинэчлэгдсэн: {PRIVACY_LAST_UPDATED}
        </p>
      </main>
    </div>
  );
};

export default PrivacyPage;
