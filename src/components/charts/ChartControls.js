import React from 'react';

/**
 * Chart-Kontrollkomponente zur Auswahl des anzuzeigenden Diagrammtyps
 * 
 * @param {Object} props - Komponenten-Properties
 * @param {string} props.activeChart - Aktuell ausgewähltes Diagramm ('table', 'bubble', 'comparison')
 * @param {Function} props.onChangeChart - Callback für die Änderung des Diagrammtyps
 * @param {boolean} props.isAscending - Gibt an, ob Cluster aufsteigend sortiert sind
 */
const ChartControls = ({ activeChart, onChangeChart, isAscending = false }) => {
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
  
  // Stil für deaktivierte Schaltflächen
  const disabledButtonStyle = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#cccccc',
    color: '#888888',
    cursor: 'not-allowed',
    opacity: 0.7
  };
  
  return (
    <div style={cardStyle}>
      <div>
        <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>Visualisierungstyp auswählen</h3>
        <div style={buttonGroupStyle}>
          <button
            style={buttonStyle(activeChart === 'table')}
            onClick={() => onChangeChart('table')}
          >
            Cluster-Tabelle
          </button>
          <button
            style={buttonStyle(activeChart === 'bubble')}
            onClick={() => onChangeChart('bubble')}
          >
            Bubble-Chart
          </button>
          <button
            style={isAscending ? buttonStyle(activeChart === 'comparison') : disabledButtonStyle}
            onClick={() => isAscending && onChangeChart('comparison')}
            disabled={!isAscending}
            title={!isAscending ? "Nur verfügbar, wenn Cluster aufsteigend sortiert sind" : ""}
          >
            Textvergleich
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartControls;