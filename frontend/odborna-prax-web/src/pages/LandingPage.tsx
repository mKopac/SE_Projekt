import React from 'react';
import Header from './../components/Header';
import Slideshow from './../components/Slideshow';
import Footer from './../components/Footer';
import "../css/LandingPage.css";

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <Header />
      <main className="landing-main">
        <Slideshow />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
