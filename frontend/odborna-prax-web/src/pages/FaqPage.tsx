import React from 'react';
import Faq from '../components/Faq';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './../App.css';

const FaqPage: React.FC = () => {
  return (
    <div className="app-layout">
      <Header />

      <main className="main-content">
  <div className="faq-container">
    <Faq />
  </div>
</main>


      <Footer />
    </div>
  );
};

export default FaqPage;