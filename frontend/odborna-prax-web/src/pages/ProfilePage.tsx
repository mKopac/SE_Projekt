import React from 'react';
import Header from './../components/Header';
import Footer from './../components/Footer';
import Profile from "./../components/Profile";

const ProfilePage: React.FC = () => {
  return (
    <div className="page-root">
      <Header />
      <main className="main-content">
        <Profile />
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;