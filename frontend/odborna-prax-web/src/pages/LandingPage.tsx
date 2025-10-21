import React from 'react';
import Header from './../components/Header';
import Slideshow from './../components/Slideshow';
import Footer from './../components/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="page-root">
      <Header />
      <main className="main-content">
        <Slideshow />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
