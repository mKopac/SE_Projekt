import React from 'react';
import Dashboard from '../components/Dashboard';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './../App.css';

const DashboardPage: React.FC = () => {
  return (
    <div className="app-layout">
      <Header />

      <main className="main-content">
  <div className="dashboard-container">
    <Dashboard />
  </div>
</main>


      <Footer />
    </div>
  );
};

export default DashboardPage;
