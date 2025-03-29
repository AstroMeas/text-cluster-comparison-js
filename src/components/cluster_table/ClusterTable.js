import React, { useState, useEffect } from 'react';
import './ClusterTable.css';

/**
 * ClusterTable-Komponente zur Anzeige der gefundenen Cluster in Tabellenform
 * 
 * @param {Object} props - Komponenten-Properties
 * @param {Array} props.clusters - Array mit Cluster-Daten
 * @param {Object} props.processed1 - Verarbeiteter erster Text für den Inhalt
 * @param {boolean} props.isAscending - Ob die start_text2-Spalte aufsteigend sortiert ist
 * @param {Function} props.onCleanClusters - Callback für die Bereinigung der Cluster
 * @param {Function} props.onDownloadCSV - Callback für den Download als CSV
 */
const ClusterTable = ({ 
  clusters = [], 
  processed1, 
  isAscending = true,
  onCleanClusters,
  onDownloadCSV
}) => {
  // Zustand für Paginierung
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Zurücksetzen auf die erste Seite, wenn sich die Cluster ändern
  useEffect(() => {
    setCurrentPage(1);
  }, [clusters]);
  
  // Berechnung der Paginierung
  const totalPages = Math.ceil(clusters.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClusters = clusters.slice(indexOfFirstItem, indexOfLastItem);
  
  // Seiten-Navigation
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  
  // Keine Cluster vorhanden
  if (clusters.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Cluster-Ergebnisse</div>
        <p>Keine Cluster gefunden, die der Mindestlänge entsprechen.</p>
      </div>
    );
  }
  
  return (
    <div className="card">
      <div className="card-title">Gefundene Cluster ({clusters.length})</div>
      
      {/* Status und Button zur Bereinigung der Cluster */}
      <div className="cluster-status">
        <span>Cluster sind</span>
        {isAscending ? (
          <span className="status-indicator status-success">aufsteigend sortiert</span>
        ) : (
          <>
            <span className="status-indicator status-error">nicht aufsteigend sortiert</span>
            <button 
              className="clean-button" 
              onClick={onCleanClusters}
            >
              Ausreißer-Cluster entfernen
            </button>
          </>
        )}
      </div>
      
      {/* Cluster-Tabelle */}
      <div className="cluster-table-container">
        <table className="cluster-table">
          <thead>
            <tr>
              <th>Start Text 1</th>
              <th>Ende Text 1</th>
              <th>Start Text 2</th>
              <th>Ende Text 2</th>
              <th>Länge</th>
              <th>Differenz</th>
              <th>Inhalt</th>
            </tr>
          </thead>
          <tbody>
            {currentClusters.map((cluster, index) => {
              // Originalen Text für den Cluster abrufen
              const start1 = cluster.start_text1;
              const end1 = cluster.end_text1;
              const clusterContent = processed1?.stringTokens.slice(start1, end1).join(' ') || '';
              
              return (
                <tr key={index}>
                  <td>{cluster.start_text1}</td>
                  <td>{cluster.end_text1}</td>
                  <td>{cluster.start_text2}</td>
                  <td>{cluster.end_text2}</td>
                  <td>{cluster.length}</td>
                  <td>{cluster.differenz}</td>
                  <td className="cluster-content">{clusterContent}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Paginierung */}
      {totalPages > 1 && (
        <>
          <div className="pagination">
            <button 
              className="pagination-button" 
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              &laquo; Zurück
            </button>
            
            {/* Seitenzahlen */}
            {[...Array(totalPages)].map((_, i) => {
              // Beschränke die Anzahl der angezeigten Seitenzahlen
              if (
                i === 0 || 
                i === totalPages - 1 || 
                (i >= currentPage - 2 && i <= currentPage + 2)
              ) {
                return (
                  <button
                    key={i}
                    className={`pagination-button ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => paginate(i + 1)}
                  >
                    {i + 1}
                  </button>
                );
              }
              // Ellipsis für ausgelassene Seiten
              if (i === currentPage - 3 || i === currentPage + 3) {
                return <span key={i}>...</span>;
              }
              return null;
            })}
            
            <button 
              className="pagination-button" 
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Weiter &raquo;
            </button>
          </div>
          <div className="pagination-info">
            Seite {currentPage} von {totalPages}
          </div>
        </>
      )}
      
      {/* Download-Button */}
      <div className="actions-container">
        <button 
          className="download-button" 
          onClick={onDownloadCSV}
        >
          Ergebnisse herunterladen (CSV)
        </button>
      </div>
    </div>
  );
};

export default ClusterTable;