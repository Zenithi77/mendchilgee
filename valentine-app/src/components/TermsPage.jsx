import { useEffect } from "react";
import { Link } from "react-router-dom";
import { TERMS_CONTENT, TERMS_LAST_UPDATED } from "../legal/terms";
import "./LegalPage.css";

const TermsPage = () => {
  useEffect(() => {
    document.title = "Үйлчилгээний нөхцөл | bolzii.com";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "bolzii.com — Үйлчилгээний нөхцөл");
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page">
      <nav className="legal-nav">
        <Link to="/" className="legal-nav-home">
          ← Нүүр хуудас
        </Link>
        <Link to="/privacy" className="legal-nav-link">
          Нууцлалын бодлого
        </Link>
      </nav>
      <main className="legal-content">
        <div
          className="legal-body"
          dangerouslySetInnerHTML={{ __html: TERMS_CONTENT }}
        />
        <p className="legal-updated">
          Сүүлд шинэчлэгдсэн: {TERMS_LAST_UPDATED}
        </p>
      </main>
    </div>
  );
};

export default TermsPage;
