import React from 'react';
import "../css/Footer.css";
import { useTranslation } from "react-i18next";

const Footer: React.FC = () => {
  const { t } = useTranslation("shared");
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-left">
          <strong>{t("footer.faculty")}</strong><br />
          {t("footer.university")}<br />
          <span>{t("footer.copyright", { year })}</span>
        </div>

        <div className="footer-center">
          <span>{t("footer.address")}</span><br />
          <span>{t("footer.emailLabel", { email: "dfpv@ukf.sk" })}</span><br />
          <a href="https://www.fpvai.ukf.sk/" target="_blank" rel="noreferrer">
            {t("footer.website")}
          </a>
        </div>

        <div className="footer-right">
          <a href="/gdpr">{t("footer.gdpr")}</a><br />
          <a href="/terms">{t("footer.terms")}</a><br />
          <a href="/contact">{t("footer.contactAdmin")}</a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
