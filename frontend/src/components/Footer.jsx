import { useTranslation } from "react-i18next";
import logo from "../assets/logo.png";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="text-white mt-auto py-5" style={{ background: "#1a1a1a" }}>
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-4">
            <div className="mb-3">
              <img
                src={logo}
                alt="ArrendaHouse"
                style={{ height: 48, borderRadius: 8, objectFit: "contain" }}
              />
            </div>
            <p className="text-muted small mb-0">
              {t("footer.tagline")}
            </p>
          </div>
          <div className="col-6 col-md-2">
            <p className="fw-semibold small text-uppercase text-muted mb-2">{t("footer.platform")}</p>
            <ul className="list-unstyled small">
              <li><a href="/imoveis" className="text-muted text-decoration-none">{t("footer.view_properties")}</a></li>
              <li><a href="/login" className="text-muted text-decoration-none">{t("footer.publish_property")}</a></li>
              <li><a href="/login" className="text-muted text-decoration-none">{t("footer.login")}</a></li>
            </ul>
          </div>
          <div className="col-6 col-md-2">
            <p className="fw-semibold small text-uppercase text-muted mb-2">{t("footer.support")}</p>
            <ul className="list-unstyled small">
              <li><a href="#" className="text-muted text-decoration-none">{t("footer.how_it_works")}</a></li>
              <li><a href="#" className="text-muted text-decoration-none">{t("footer.contact")}</a></li>
              <li><a href="#" className="text-muted text-decoration-none">{t("footer.faq")}</a></li>
            </ul>
          </div>
          <div className="col-12 col-md-4">
            <p className="fw-semibold small text-uppercase text-muted mb-2">{t("footer.available_title")}</p>
            <p className="text-muted small">{t("footer.available_cities")}</p>
          </div>
        </div>
        <hr style={{ borderColor: "rgba(255,255,255,0.1)" }} />
        <p className="mb-0 text-muted small text-center">
          © {new Date().getFullYear()} ArrendaHouse · {t("footer.copyright")}
        </p>
      </div>
    </footer>
  );
}

