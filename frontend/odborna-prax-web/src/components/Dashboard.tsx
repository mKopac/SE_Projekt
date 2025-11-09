import React, { useState, useEffect } from 'react';
import PracticeForm from '../forms/PracticeForm';
import PracticeTable from './PracticeTable';
import type { Practice } from '../types/Practice';
import './../css/Dashboard.css';

const Dashboard: React.FC = () => {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch('/api/practice')
      .then(res => res.json())
      .then(data => setPractices(data))
      .catch(err => console.error('Chyba pri načítaní praxí:', err));
  }, []);

  const handleAddPractice = (newPractice: Practice) => {
    fetch('/api/practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPractice),
    })
      .then(res => res.json())
      .then(saved => {
        setPractices(prev => [...prev, saved]);
        setShowModal(false);
      })
      .catch(err => console.error('Chyba pri ukladaní praxe:', err));
  };

  return (
    <div className="dashboard">
      <h2>Prehľad praxí</h2>
      <button className="add-button" onClick={() => setShowModal(true)}>
        Pridať prax
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            <PracticeForm onAdd={handleAddPractice} />
          </div>
        </div>
      )}

      <PracticeTable practices={practices} />
    </div>
  );
};

export default Dashboard;
