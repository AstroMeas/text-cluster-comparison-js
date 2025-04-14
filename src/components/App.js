import React, { useState } from 'react';
import ClusterTable from './cluster_table/ClusterTable';
import BubbleChart from './charts/BubbleChart';
import ComparisonTable from './comparison_table/ComparisonTable';
import ChartControls from './charts/ChartControls';
import useClusterData from '../hooks/useClusterData';

/**
 * Main component of the application
 */
const App = () => {
  // Hook for cluster data and processing
  const clusterData = useClusterData();
  
  // State for active visualization
  const [activeChart, setActiveChart] = useState('table'); // 'table', 'bubble', 'comparison'
  
  // Helper function to display input fields for separators
  const renderSeparatorsList = () => {
    return (
      <div className="separator-list">
        {clusterData.separators.map((separator, index) => {
          // Special representation for special characters
          const displayText = separator === ' ' ? '␣ (Space)' : 
                              separator === '\n' ? '↵ (Line Break)' :
                              separator === '\t' ? '→ (Tab)' : separator;
          
          return (
            <div key={index} className="separator-item">
              <span>{displayText}</span>
              <button 
                className="btn-danger" 
                onClick={() => clusterData.removeSeparator(index)}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Helper function to add a new separator
  const handleAddSeparator = (e) => {
    e.preventDefault();
    const separatorInput = e.target.elements.separatorInput;
    const separator = separatorInput.value;
    
    if (separator) {
      clusterData.addSeparator(separator);
      separatorInput.value = '';
    }
  };
  
  // Helper function to render the active chart
  const renderActiveChart = () => {
    // No clusters available
    if (clusterData.clusters.length === 0) {
      return (
        <div className="card">
          <p>
            No clusters found. Please enter texts and click on "Find Clusters".
          </p>
        </div>
      );
    }
    
    // Display cluster table
    if (activeChart === 'table') {
      return (
        <ClusterTable 
          clusters={clusterData.clusters}
          processed1={clusterData.processed1}
          isAscending={clusterData.isAscending}
          onCleanClusters={clusterData.cleanClusters}
          onDownloadCSV={clusterData.downloadClustersCSV}
        />
      );
    }
    
    // Display bubble chart
    if (activeChart === 'bubble') {
      return (
        <BubbleChart 
          data={clusterData.getBubbleChartData()} 
          title="Cluster Positions (Bubble Chart)"
        />
      );
    }
    
    // Display text comparison
    if (activeChart === 'comparison') {
      return (
        <ComparisonTable
          clusters={clusterData.clusters}
          processed1={clusterData.processed1}
          processed2={clusterData.processed2}
          isAscending={clusterData.isAscending}
        />
      );
    }
    
    return null;
  };
  
  return (
    <div className="container">
      <h1 className="app-title">Text Cluster Comparison</h1>
      
      {/* Text Input */}
      <div className="card">
        <h2 className="card-title">Text Input</h2>
        <div className="grid-container">
          {/* Text 1 */}
          <div>
            <label htmlFor="text1">Text 1:</label>
            <textarea
              id="text1"
              value={clusterData.text1}
              onChange={(e) => clusterData.setText1(e.target.value)}
              rows={10}
              placeholder="Enter the first text here..."
            ></textarea>
          </div>
          
          {/* Text 2 */}
          <div>
            <label htmlFor="text2">Text 2:</label>
            <textarea
              id="text2"
              value={clusterData.text2}
              onChange={(e) => clusterData.setText2(e.target.value)}
              rows={10}
              placeholder="Enter the second text here..."
            ></textarea>
          </div>
        </div>
        
        <div className="grid-container">
          {/* Cluster Options */}
          <div>
            <h3>Cluster Options</h3>
            <div>
              <label htmlFor="minLength">Minimum Cluster Length:</label>
              <input
                type="number"
                id="minLength"
                value={clusterData.minLength}
                onChange={(e) => clusterData.setMinLength(parseInt(e.target.value) || 5)}
                min={1}
                style={{ width: '80px' }}
              />
            </div>
            
            <div style={{ marginTop: '10px' }}>
              <label htmlFor="toLowerCase">
                <input
                  type="checkbox"
                  id="toLowerCase"
                  checked={clusterData.toLowerCase}
                  onChange={(e) => clusterData.setToLowerCase(e.target.checked)}
                />
                {' '}Convert text to lowercase
              </label>
            </div>
          </div>
          
          {/* Separators */}
          <div>
            <h3>Separators</h3>
            <form onSubmit={handleAddSeparator}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  id="separatorInput"
                  name="separatorInput"
                  placeholder="Separator"
                  style={{ width: '150px', flex: '1' }}
                />
                <button type="submit" className="btn-primary">Add</button>
              </div>
            </form>
            {renderSeparatorsList()}
          </div>
        </div>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            className="btn-primary" 
            onClick={clusterData.analyzeClusters}
            disabled={clusterData.isLoading}
          >
            {clusterData.isLoading ? 'Processing...' : 'Find Clusters'}
          </button>
        </div>
        
        {/* Error display */}
        {clusterData.error && (
          <div style={{ marginTop: '15px', color: 'red' }}>
            {clusterData.error}
          </div>
        )}
      </div>
      
      {/* Visualization selection */}
      {clusterData.clusters.length > 0 && (
        <ChartControls 
          activeChart={activeChart} 
          onChangeChart={setActiveChart} 
          isAscending={clusterData.isAscending}
        />
      )}
      
      {/* Active chart */}
      <div className="results-container">
        {renderActiveChart()}
      </div>
    </div>
  );
};

export default App;