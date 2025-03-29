import React from 'react';

/**
 * Chart-Kontrollkomponente zur Auswahl des anzuzeigenden Diagrammtyps
 * 
 * @param {Object} props - Komponenten-Properties
 * @param {string} props.activeChart - Aktuell ausgewähltes Diagramm ('table', 'bubble', 'line')
 * @param {Function} props.onChangeChart - Callback für die Änderung des Diagrammtyps
 */
const ChartControls = ({ activeChart, onChangeChart }) => {
  // Stil für die Container-Karte
  const cardStyle = {
    display: 'flex',
    justifyContent: 'center',
    padding: '15px',
    marginBottom: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  };
  
  // Stil für den Schaltflächen-Container
  const buttonGroupStyle = {
    display: 'flex',
    gap: '10px'
  };
  
  // Stil für die Schaltflächen
  const buttonStyle = (isActive) => ({
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: isActive ? '#4CAF50' : '#e0e0e0',
    color: isActive ? 'white' : '#333',
    fontWeight: isActive ? 'bold' : 'normal',
    cursor: 'pointer',
    transition: 'all 0.3s'
  });
  
  return (
    <div style={cardStyle}>
      <div>
        <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>Visualisierungstyp auswählen</h3>
        <div style={buttonGroupStyle}>
          <button
            style={buttonStyle(activeChart === 'table')}
            onClick={() => onChangeChart('table')}
          >
            Tabelle
          </button>
          <button
            style={buttonStyle(activeChart === 'bubble')}
            onClick={() => onChangeChart('bubble')}
          >
            Bubble-Chart
          </button>
          <button
            style={buttonStyle(activeChart === 'line')}
            onClick={() => onChangeChart('line')}
          >
            Linien-Diagramm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartControls;