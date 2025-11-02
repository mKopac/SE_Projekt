import React from 'react';
import Dashboard from '../components/Dashboard';
import Header from '../components/Header';
import Footer from '../components/Footer';

const DashboardPage: React.FC = () => {
  return (
    <div>
        <Header/>
      <Dashboard />
      <Footer/>
    </div>
  );
};

export default DashboardPage;
