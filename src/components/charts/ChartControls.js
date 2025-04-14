import React from 'react';

/**
 * Chart control component for selecting the chart type to display
 * 
 * @param {Object} props - Component properties
 * @param {string} props.activeChart - Currently selected chart ('table', 'bubble', 'comparison')
 * @param {Function} props.onChangeChart - Callback for changing the chart type
 * @param {boolean} props.isAscending - Indicates whether clusters are sorted in ascending order
 */
const ChartControls = ({ activeChart, onChangeChart, isAscending = false }) => {
  // Style for the container card
  const cardStyle = {
    display: 'flex',
    justifyContent: 'center',
    padding: '15px',
    marginBottom: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  };
  
  // Style for the button container
  const buttonGroupStyle = {
    display: 'flex',
    gap: '10px'
  };
  
  // Style for the buttons
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
  
  // Style for disabled buttons
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
        <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>Select Visualization Type</h3>
        <div style={buttonGroupStyle}>
          <button
            style={buttonStyle(activeChart === 'table')}
            onClick={() => onChangeChart('table')}
          >
            Cluster Table
          </button>
          <button
            style={buttonStyle(activeChart === 'bubble')}
            onClick={() => onChangeChart('bubble')}
          >
            Bubble Chart
          </button>
          <button
            style={isAscending ? buttonStyle(activeChart === 'comparison') : disabledButtonStyle}
            onClick={() => isAscending && onChangeChart('comparison')}
            disabled={!isAscending}
            title={!isAscending ? "Only available when clusters are sorted in ascending order" : ""}
          >
            Text Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartControls;