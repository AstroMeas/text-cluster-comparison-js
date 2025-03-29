import React from 'react';
import Plot from 'react-plotly.js';

/**
 * BubbleChart-Komponente zur Visualisierung von Cluster-Positionen
 * 
 * @param {Object} props - Komponenten-Properties
 * @param {Object} props.data - Vorbereitete Daten für das Bubble-Chart
 * @param {string} props.title - Titel des Diagramms
 * @param {Object} props.layout - Zusätzliche Layout-Optionen (optional)
 */
const BubbleChart = ({ data, title, layout = {} }) => {
  // Wenn keine Daten vorhanden sind, zeige eine Meldung an
  if (!data) {
    return (
      <div className="card">
        <div className="card-title">Bubble-Chart</div>
        <p>Keine Daten für die Visualisierung verfügbar.</p>
      </div>
    );
  }
  
  // Standard-Layout für das Diagramm
  const defaultLayout = {
    title: title || 'Cluster-Positionen (Bubble-Chart)',
    xaxis: {
      title: 'Position in Text 1',
      zeroline: false,
      grid: { color: '#e0e0e0' }
    },
    yaxis: {
      title: 'Position in Text 2',
      zeroline: false,
      grid: { color: '#e0e0e0' }
    },
    hovermode: 'closest',
    margin: { l: 60, r: 40, t: 80, b: 60 },
    autosize: true,
    height: 600,
    showlegend: false,
    plot_bgcolor: '#f8f9fa',
    paper_bgcolor: '#ffffff',
    font: {
      family: 'Arial, sans-serif',
      size: 12,
      color: '#333333'
    }
  };
  
  // Zusammenführen des Standard-Layouts mit den übergebenen Layout-Optionen
  const mergedLayout = { ...defaultLayout, ...layout };
  
  // Konfiguration für Interaktivität und Download-Optionen
  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png',
      filename: 'cluster_bubble_chart',
      height: 600,
      width: 800,
      scale: 2
    }
  };
  
  return (
    <div className="card">
      <Plot
        data={[data]}
        layout={mergedLayout}
        config={config}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default BubbleChart;