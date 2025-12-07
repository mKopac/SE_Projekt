import React from 'react';
import "../css/Footer.css";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-left">
          <strong>Fakulta prírodných vied a informatiky</strong><br />
          Univerzita Konštantína Filozofa v Nitre<br />
          <span>© {year} FPVaI UKF Nitra</span>
        </div>

        <div className="footer-center">
          <span>Trieda Andreja Hlinku 1, 949 74 Nitra</span><br />
          <span>Email: dfpv@ukf.sk</span><br />
          <a href="https://www.fpvai.ukf.sk/" target="_blank" rel="noreferrer">
            www.fpvai.ukf.sk
          </a>
        </div>

        <div className="footer-right">
          <a href="/gdpr">Ochrana osobných údajov (GDPR)</a><br />
          <a href="/terms">Podmienky používania</a><br />
          <a href="/contact">Kontakt na administrátora</a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
