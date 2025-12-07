import React from 'react';
import Header from './../components/Header';
import Profile from './../components/Profile';
import Footer from './../components/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="page-root">
      <Header />
      <main className="main-content landing-main">
        <Profile />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
