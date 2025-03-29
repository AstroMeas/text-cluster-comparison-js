import React, { useState } from 'react';
import ClusterTable from './cluster_table/ClusterTable';
import BubbleChart from './charts/BubbleChart';
import LineChart from './charts/LineChart';
import ChartControls from './charts/ChartControls';
import useClusterData from '../hooks/useClusterData';

/**
 * Hauptkomponente der Anwendung
 */
const App = () => {
  // Hook für die Cluster-Daten und -Verarbeitung
  const clusterData = useClusterData();
  
  // Zustand für die aktive Visualisierung
  const [activeChart, setActiveChart] = useState('table'); // 'table', 'bubble', 'line'
  
  // Hilfsfunktion zum Darstellen der Eingabefelder für Trennzeichen
  const renderSeparatorsList = () => {
    return (
      <div className="separator-list">
        {clusterData.separators.map((separator, index) => {
          // Besondere Darstellung für spezielle Zeichen
          const displayText = separator === ' ' ? '␣ (Leerzeichen)' : 
                              separator === '\n' ? '↵ (Zeilenumbruch)' :
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
  
  // Hilfsfunktion zum Hinzufügen eines neuen Trennzeichens
  const handleAddSeparator = (e) => {
    e.preventDefault();
    const separatorInput = e.target.elements.separatorInput;
    const separator = separatorInput.value;
    
    if (separator) {
      clusterData.addSeparator(separator);
      separatorInput.value = '';
    }
  };
  
  // Hilfsfunktion zum Rendern des aktiven Diagramms
  const renderActiveChart = () => {
    // Keine Cluster vorhanden
    if (clusterData.clusters.length === 0) {
      return (
        <div className="card">
          <p>
            Keine Cluster gefunden. Bitte gib Texte ein und klicke auf "Cluster finden".
          </p>
        </div>
      );
    }
    
    // Cluster-Tabelle anzeigen
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
    
    // Bubble-Chart anzeigen
    if (activeChart === 'bubble') {
      return (
        <BubbleChart 
          data={clusterData.getBubbleChartData()} 
          title="Cluster-Positionen (Bubble-Chart)"
        />
      );
    }
    
    // Line-Chart anzeigen
    if (activeChart === 'line') {
      return (
        <LineChart 
          data={clusterData.getLineChartData()} 
          title="Cluster-Positionen (Linien-Diagramm)"
        />
      );
    }
    
    return null;
  };
  
  return (
    <div className="container">
      <h1 className="app-title">Text Cluster Comparison</h1>
      
      {/* Texteingabe */}
      <div className="card">
        <h2 className="card-title">Texteingabe</h2>
        <div className="grid-container">
          {/* Text 1 */}
          <div>
            <label htmlFor="text1">Text 1:</label>
            <textarea
              id="text1"
              value={clusterData.text1}
              onChange={(e) => clusterData.setText1(e.target.value)}
              rows={10}
              placeholder="Gib den ersten Text hier ein..."
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
              placeholder="Gib den zweiten Text hier ein..."
            ></textarea>
          </div>
        </div>
        
        <div className="grid-container">
          {/* Cluster-Optionen */}
          <div>
            <h3>Cluster-Optionen</h3>
            <div>
              <label htmlFor="minLength">Minimale Cluster-Länge:</label>
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
                {' '}Text in Kleinbuchstaben umwandeln
              </label>
            </div>
          </div>
          
          {/* Trennzeichen */}
          <div>
            <h3>Trennzeichen</h3>
            <form onSubmit={handleAddSeparator}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  id="separatorInput"
                  name="separatorInput"
                  placeholder="Trennzeichen"
                  style={{ width: '150px', flex: '1' }}
                />
                <button type="submit" className="btn-primary">Hinzufügen</button>
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
            {clusterData.isLoading ? 'Verarbeite...' : 'Cluster finden'}
          </button>
        </div>
        
        {/* Fehleranzeige */}
        {clusterData.error && (
          <div style={{ marginTop: '15px', color: 'red' }}>
            {clusterData.error}
          </div>
        )}
      </div>
      
      {/* Visualisierungsauswahl */}
      {clusterData.clusters.length > 0 && (
        <ChartControls 
          activeChart={activeChart} 
          onChangeChart={setActiveChart} 
        />
      )}
      
      {/* Aktives Diagramm */}
      <div className="results-container">
        {renderActiveChart()}
      </div>
    </div>
  );
};

export default App;