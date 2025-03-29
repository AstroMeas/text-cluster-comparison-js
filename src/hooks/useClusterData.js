import { useState, useCallback } from 'react';
import { 
  processTextsAndFindClusters, 
  isColumnAscending,
  cleanClusterTable,
  convertToBubbleChartData,
  convertToLineChartData,
  convertClustersToCSV
} from '../services/clusterService';

/**
 * Custom React-Hook zur Verwaltung der Cluster-Daten und deren Verarbeitung
 * @returns {Object} Zustand und Funktionen zur Verarbeitung von Clusterdaten
 */
const useClusterData = () => {
  // Zustand für Eingabe-Texte und deren Verarbeitung
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [minLength, setMinLength] = useState(5);
  const [toLowerCase, setToLowerCase] = useState(true);
  const [separators, setSeparators] = useState([' ', ',', '.', '!', '?', ';', ':', '\n', '\t']);
  
  // Zustand für Verarbeitungsergebnisse
  const [processed1, setProcessed1] = useState(null);
  const [processed2, setProcessed2] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [isAscending, setIsAscending] = useState(true);
  
  // Zustand für UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Führt die Cluster-Analyse für die eingegebenen Texte durch
   */
  const analyzeClusters = useCallback(() => {
    if (!text1.trim() || !text2.trim()) {
      setError('Bitte gib beide Texte ein.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Verarbeite die Texte und finde Cluster
      const result = processTextsAndFindClusters(
        text1,
        text2,
        minLength,
        separators,
        toLowerCase
      );
      
      // Aktualisiere den Zustand mit den Ergebnissen
      setProcessed1(result.processed1);
      setProcessed2(result.processed2);
      setClusters(result.clusters);
      
      // Prüfe, ob die start_text2-Spalte aufsteigend sortiert ist
      setIsAscending(isColumnAscending(result.clusters));
      
      setIsLoading(false);
    } catch (err) {
      console.error('Fehler bei der Cluster-Analyse:', err);
      setError(`Fehler bei der Cluster-Analyse: ${err.message}`);
      setIsLoading(false);
    }
  }, [text1, text2, minLength, separators, toLowerCase]);
  
  /**
   * Bereinigt die gefundenen Cluster von Ausreißern und Überlappungen
   */
  const cleanClusters = useCallback(() => {
    if (clusters.length === 0) {
      setError('Keine Cluster zum Bereinigen vorhanden.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Bereinige die Cluster-Tabelle
      const cleanedClusters = cleanClusterTable(
        clusters,
        'start_text1',
        'end_text1',
        'start_text2',
        false // false für mehrere Durchläufe, bis alle Cluster aufsteigend sind
      );
      
      // Aktualisiere den Zustand mit den bereinigten Clustern
      setClusters(cleanedClusters);
      
      // Prüfe erneut, ob die start_text2-Spalte aufsteigend sortiert ist
      setIsAscending(isColumnAscending(cleanedClusters));
      
      setIsLoading(false);
    } catch (err) {
      console.error('Fehler beim Bereinigen der Cluster:', err);
      setError(`Fehler beim Bereinigen der Cluster: ${err.message}`);
      setIsLoading(false);
    }
  }, [clusters]);
  
  /**
   * Bereitet Daten für ein Bubble-Chart vor
   * @returns {Object} - Daten für ein Bubble-Chart mit Plotly
   */
  const getBubbleChartData = useCallback(() => {
    if (clusters.length === 0) return null;
    return convertToBubbleChartData(clusters);
  }, [clusters]);
  
  /**
   * Bereitet Daten für ein Linien-Diagramm vor
   * @returns {Array} - Daten für ein Linien-Diagramm mit Plotly
   */
  const getLineChartData = useCallback(() => {
    if (clusters.length === 0) return null;
    return convertToLineChartData(clusters);
  }, [clusters]);
  
  /**
   * Lädt die Cluster-Ergebnisse als CSV-Datei herunter
   */
  const downloadClustersCSV = useCallback(() => {
    if (clusters.length === 0 || !processed1) {
      setError('Keine Cluster zum Herunterladen vorhanden.');
      return;
    }
    
    try {
      // Konvertiere Cluster zu CSV
      const csvData = convertClustersToCSV(clusters, processed1);
      
      // Erstelle einen Blob aus den CSV-Daten
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Erstelle einen temporären Link zum Herunterladen
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cluster_ergebnisse.csv');
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
      setError(`Fehler beim Herunterladen: ${err.message}`);
    }
  }, [clusters, processed1]);
  
  /**
   * Fügt ein neues Trennzeichen zur Liste hinzu
   * @param {string} separator - Das hinzuzufügende Trennzeichen
   */
  const addSeparator = useCallback((separator) => {
    if (separator && !separators.includes(separator)) {
      setSeparators(prev => [...prev, separator]);
    }
  }, [separators]);
  
  /**
   * Entfernt ein Trennzeichen aus der Liste
   * @param {number} index - Der Index des zu entfernenden Trennzeichens
   */
  const removeSeparator = useCallback((index) => {
    setSeparators(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  return {
    // Zustände
    text1,
    text2,
    minLength,
    toLowerCase,
    separators,
    processed1,
    processed2,
    clusters,
    isAscending,
    isLoading,
    error,
    
    // Setter-Funktionen
    setText1,
    setText2,
    setMinLength,
    setToLowerCase,
    
    // Aktionsfunktionen
    analyzeClusters,
    cleanClusters,
    getBubbleChartData,
    getLineChartData,
    downloadClustersCSV,
    addSeparator,
    removeSeparator
  };
};

export default useClusterData;