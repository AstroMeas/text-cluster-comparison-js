import React from 'react';
import Plot from 'react-plotly.js';

/**
 * BubbleChart component for visualizing cluster positions
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.data - Prepared data for the bubble chart
 * @param {string} props.title - Title of the diagram
 * @param {Object} props.layout - Additional layout options (optional)
 */
const BubbleChart = ({ data, title, layout = {} }) => {
  // If no data is available, display a message
  if (!data) {
    return (
      <div className="card">
        <div className="card-title">Bubble Chart</div>
        <p>No data available for visualization.</p>
      </div>
    );
  }
  
  // Default layout for the diagram
  const defaultLayout = {
    title: title || 'Cluster Positions (Bubble Chart)',
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
  
  // Merge the default layout with the provided layout options
  const mergedLayout = { ...defaultLayout, ...layout };
  
  // Configuration for interactivity and download options
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