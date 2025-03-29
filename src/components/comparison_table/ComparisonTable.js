import React, { useState, useEffect, useCallback } from 'react';
import './ComparisonTable.css';
import { compareTexts, convertComparisonToCSV } from '../../services/clusterService';

/**
 * ComparisonTable-Komponente zur Anzeige des strukturierten Textvergleichs
 * 
 * @param {Object} props - Komponenten-Properties
 * @param {Array} props.clusters - Array mit Cluster-Daten
 * @param {Object} props.processed1 - Verarbeiteter erster Text
 * @param {Object} props.processed2 - Verarbeiteter zweiter Text
 * @param {Boolean} props.isAscending - Gibt an, ob Cluster aufsteigend sortiert sind
 */
const ComparisonTable = ({ 
  clusters = [], 
  processed1, 
  processed2,
  isAscending = false
}) => {
  // Zustand für die Vergleichsdaten
  const [comparisonData, setComparisonData] = useState([]);
  
  // Zustand für Paginierung
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Berechne Vergleichsdaten, wenn sich die Eingabedaten ändern
  useEffect(() => {
    if (!processed1 || !processed2 || !isAscending) {
      setComparisonData([]);
      return;
    }
    
    try {
      // Führe den Textvergleich durch
      const result = compareTexts(
        processed1.stringTokens, 
        processed2.stringTokens, 
        clusters, 
        'text1', 
        'text2'
      );
      
      setComparisonData(result);
    } catch (error) {
      console.error('Fehler beim Vergleichen der Texte:', error);
      setComparisonData([]);
    }
  }, [clusters, processed1, processed2, isAscending]);
  
  // Zurücksetzen auf die erste Seite, wenn sich die Vergleichsdaten ändern
  useEffect(() => {
    setCurrentPage(1);
  }, [comparisonData]);
  
  // Berechnung der Paginierung
  const totalPages = Math.ceil(comparisonData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = comparisonData.slice(indexOfFirstItem, indexOfLastItem);
  
  // Seiten-Navigation
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  
  // Funktion zum Herunterladen der CSV-Datei
  const downloadCSV = useCallback(() => {
    if (comparisonData.length === 0) {
      console.error('Keine Vergleichsdaten zum Herunterladen vorhanden');
      return;
    }
    
    try {
      // Konvertiere Vergleichsdaten zu CSV
      const csvData = convertComparisonToCSV(comparisonData, 'text1', 'text2');
      
      // Erstelle einen Blob aus den CSV-Daten
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Erstelle einen temporären Link zum Herunterladen
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'textvergleich.csv');
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Aufräumen
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Fehler beim Herunterladen der CSV-Datei:', err);
    }
  }, [comparisonData]);
  
  // Wenn keine aufsteigend sortierten Cluster vorhanden sind
  if (!isAscending) {
    return (
      <div className="card">
        <div className="card-title">Textvergleich</div>
        <p>Der Textvergleich ist nur verfügbar, wenn die Cluster aufsteigend sortiert sind. 
          Bitte bereinige die Cluster zuerst.</p>
      </div>
    );
  }
  
  // Wenn keine Vergleichsdaten vorhanden sind
  if (comparisonData.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Textvergleich</div>
        <p>Keine Vergleichsdaten verfügbar.</p>
      </div>
    );
  }
  
  return (
    <div className="card">
      <div className="card-title">Textvergleich</div>
      
      <div className="comparison-description">
        Diese Tabelle zeigt abwechselnd die einzigartigen Textabschnitte und die gemeinsamen Cluster.
        Einzigartige Zeilen (orange) enthalten unterschiedliche Texte, Cluster-Zeilen (grün) zeigen 
        übereinstimmende Textpassagen.
      </div>
      
      <div className="comparison-header">
        <span>Gefundene Elemente: {comparisonData.length}</span>
        <button className="download-button" onClick={downloadCSV}>
          Als CSV herunterladen
        </button>
      </div>
      
      <div className="comparison-table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Typ</th>
              <th>Pos. Text 1</th>
              <th>Text 1</th>
              <th>Pos. Text 2</th>
              <th>Text 2</th>
              <th>Cluster-Länge</th>
              <th>Cluster-Inhalt</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr 
                key={index} 
                className={item.tag === 'unique' ? 'unique-row' : 'cluster-row'}
              >
                <td>{item.tag === 'unique' ? 'Einzigartig' : 'Cluster'}</td>
                <td>{item.Pos_text1}</td>
                <td className="comparison-content">{item.text1}</td>
                <td>{item.Pos_text2}</td>
                <td className="comparison-content">{item.text2}</td>
                <td>{item.Length_Cluster}</td>
                <td className="comparison-content">{item.Cluster}</td>
              </tr>
            ))}
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
    </div>
  );
};

export default ComparisonTable;