/**
 * Service für die Verarbeitung von Cluster-Daten
 * Dieser Service stellt Funktionen bereit, um Textdaten zu verarbeiten,
 * Cluster zu finden und die Daten für Visualisierungen aufzubereiten.
 */

// Importiere die benötigten Core-Funktionen
import { clusterPreprocess } from '../core/preprocessing.js';
import { findClusters } from '../core/clusterSearch.js';

/**
 * Prozessiert zwei Texte und findet Cluster
 * @param {string} text1 - Der erste Text
 * @param {string} text2 - Der zweite Text
 * @param {number} minLength - Minimale Länge für ein Cluster
 * @param {Array<string>} separators - Trennzeichen für die Textverarbeitung
 * @param {boolean} toLowerCase - Text in Kleinbuchstaben umwandeln
 * @returns {Object} - Verarbeitete Texte und gefundene Cluster
 */
export const processTextsAndFindClusters = (
  text1,
  text2,
  minLength = 5,
  separators = [' ', ',', '.', '!', '?', ';', ':', '\n', '\t'],
  toLowerCase = true
) => {
  // Einstellungen für die Vorverarbeitung
  const preprocessOptions = {
    toLowerCase: toLowerCase,
    separators: separators
  };
  
  // Texte vorverarbeiten
  const processed1 = clusterPreprocess(text1, preprocessOptions);
  const processed2 = clusterPreprocess(text2, preprocessOptions);
  
  // Cluster finden
  const clusters = findClusters(processed1, processed2, minLength, 'text1', 'text2');
  
  return {
    processed1,
    processed2,
    clusters
  };
};

/**
 * Überprüft, ob die Werte in einer Spalte aufsteigend sortiert sind
 * @param {Array} clusters - Die Cluster-Liste
 * @param {string} columnName - Der Name der zu überprüfenden Spalte
 * @returns {boolean} - True, wenn die Spalte aufsteigend sortiert ist
 */
export const isColumnAscending = (clusters, columnName = 'start_text2') => {
  if (clusters.length <= 1) return true;
  
  for (let i = 1; i < clusters.length; i++) {
    if (clusters[i][columnName] < clusters[i-1][columnName]) {
      return false;
    }
  }
  
  return true;
};

/**
 * Entfernt Ausreißer-Cluster basierend auf Positionssprüngen in Text B
 * @param {Array} clusters - Die Cluster-Array
 * @param {string} textBStartCol - Spaltenname für die Startposition in Text B
 * @returns {Array} - Gefiltertes Array ohne Ausreißer-Cluster
 */
export const removeOutlyingClusters = (clusters, textBStartCol = 'start_text2') => {
  if (clusters.length <= 1) return clusters;
  
  // Kopie des Cluster-Arrays erstellen
  const df = [...clusters];
  
  // Differenzen zwischen aufeinanderfolgenden Startpositionen berechnen
  const diffs = [];
  const flags = [];
  
  for (let i = 0; i < df.length; i++) {
    if (i === 0) {
      diffs.push(null);
    } else {
      diffs.push(df[i][textBStartCol] - df[i-1][textBStartCol]);
    }
    flags.push(0);
  }
  
  // Zeilen mit negativen Differenzen markieren (potenzielle Ausreißer)
  for (let i = 0; i < diffs.length; i++) {
    if (diffs[i] !== null && diffs[i] < 0) {
      flags[i] = 1;
      // Auch die vorherige Zeile markieren
      if (i > 0) {
        flags[i-1] = 1;
      }
    }
  }
  
  // Array zum Markieren von zu entfernenden Zeilen
  const removeIndexes = new Array(df.length).fill(0);
  
  // Jede Zeile verarbeiten, um Ausreißer zu identifizieren
  for (let i = 0; i < df.length; i++) {
    // Erste Zeile überspringen
    if (i === 0) continue;
    
    // Letzten Zeilenfalls behandeln
    if (i + 1 === df.length && flags[i] === 1) {
      removeIndexes[i] = 1;
      continue;
    }
    
    // Aufeinanderfolgende markierte Zeilen überprüfen
    if (flags[i] === 1 && flags[i-1] === 1) {
      let offset = 1;
      
      // Nach passender Grenze suchen
      while ((i - offset) > 0 && (i + offset + 1) < df.length) {
        if (df[i][textBStartCol] > df[i-offset-1][textBStartCol] || 
            df[i-1][textBStartCol] < df[i+offset][textBStartCol]) {
          break;
        } else {
          offset++;
        }
      }
      
      // Zeilen basierend auf erkanntem Muster zur Entfernung markieren
      if (df[i-1][textBStartCol] <= df[i+offset][textBStartCol]) {
        for (let j = i; j < i + offset; j++) {
          removeIndexes[j] = 1;
        }
      } else if (df[i][textBStartCol] > df[i-offset-1][textBStartCol]) {
        for (let j = i - offset; j < i; j++) {
          removeIndexes[j] = 1;
        }
      } else {
        console.log(`Problem bei Index ${i}`);
      }
    }
  }
  
  // Zeilen vom Ende her verarbeiten, um nachlaufende Ausreißer zu entfernen
  for (let i = df.length - 1; i > 0; i--) {
    if (flags[i] === 1) {
      removeIndexes[i] = 1;
    } else {
      break;
    }
  }
  
  // Indizes zum Entfernen erhalten
  const dropIndices = [];
  for (let i = 0; i < removeIndexes.length; i++) {
    if (removeIndexes[i] === 1) {
      dropIndices.push(i);
    }
  }
  
  // Identifizierte Ausreißer entfernen
  const result = df.filter((_, index) => !dropIndices.includes(index));
  
  // Duplikate entfernen (gleiche Startposition in Text B)
  const uniqueResult = [];
  
  for (let i = 0; i < result.length; i++) {
    if (i > 0 && result[i][textBStartCol] === result[i-1][textBStartCol]) {
      continue;
    }
    uniqueResult.push(result[i]);
  }
  
  return uniqueResult;
};

/**
 * Entfernt überlappende Cluster in Text A
 * @param {Array} clusterDf - Cluster-Array
 * @param {string} startACol - Spaltenname für die Startposition in Text A
 * @param {string} endACol - Spaltenname für die Endposition in Text A
 * @param {boolean} verbose - Ob Informationen über entfernte Zeilen ausgegeben werden sollen
 * @returns {Array} - Gefiltertes Array ohne überlappende Cluster
 */
export const removeOverlappingClusters = (
  clusterDf, 
  startACol = 'start_text1', 
  endACol = 'end_text1', 
  verbose = false
) => {
  // Eine Kopie des Eingabe-Arrays erstellen
  const df = [...clusterDf];
  
  // Anfängliche Anzahl der Cluster
  const initialCount = df.length;
  
  // Sicherstellen, dass das Array nach start_a sortiert ist
  df.sort((a, b) => a[startACol] - b[startACol]);
  
  // Array für gültige Zeilen (nicht überlappend)
  const validRows = new Array(df.length).fill(true);
  
  // Vorheriger end_a-Wert
  let prevEndA = null;
  
  // Jede Zeile auf Überlappung mit vorheriger prüfen
  for (let idx = 0; idx < df.length; idx++) {
    const currentStartA = df[idx][startACol];
    
    // Erste Zeile überspringen
    if (prevEndA !== null) {
      // Wenn aktueller start_a kleiner als vorheriger end_a ist, als ungültig markieren
      if (currentStartA < prevEndA) {
        validRows[idx] = false;
      }
    }
    
    // Vorherigen end_a aktualisieren
    prevEndA = df[idx][endACol];
  }
  
  // Die Maske anwenden, um überlappende Zeilen zu filtern
  const filteredDf = df.filter((_, i) => validRows[i]);
  
  // Anzahl der entfernten Zeilen
  const removedCount = initialCount - filteredDf.length;
  
  // Zusammenfassung ausgeben, wenn verbose
  if (verbose) {
    console.log(`Anfängliche Cluster: ${initialCount}`);
    console.log(`Überlappende Cluster entfernt: ${removedCount}`);
    console.log(`Verbleibende Cluster: ${filteredDf.length}`);
  }
  
  return filteredDf;
};

/**
 * Bereinigt die Cluster-Tabelle durch Entfernen von Ausreißern und überlappenden Clustern
 * @param {Array} df - Cluster-Array
 * @param {string} startACol - Spaltenname für die Startposition in Text A
 * @param {string} endACol - Spaltenname für die Endposition in Text A
 * @param {string} startBCol - Spaltenname für die Startposition in Text B
 * @param {boolean} noLoop - Ob die Bereinigung nur einmal durchgeführt werden soll
 * @returns {Array} - Bereinigtes Array ohne Ausreißer und überlappende Cluster
 */
export const cleanClusterTable = (
  df, 
  startACol = 'start_text1', 
  endACol = 'end_text1', 
  startBCol = 'start_text2', 
  noLoop = true
) => {
  let loops = 0;
  let currentDf = [...df];
  
  // Bereinigung fortsetzen, bis Spalte B aufsteigend ist oder Stabilisierung erreicht ist
  while (!isColumnAscending(currentDf, startBCol)) {
    const df2 = [...currentDf];
    currentDf = removeOverlappingClusters(currentDf, startACol, endACol, false);
    currentDf = removeOutlyingClusters(currentDf, startBCol);
    
    // Nach einer Iteration beenden, wenn noLoop true ist
    if (noLoop) {
      break;
    }
    
    // Beenden, wenn keine Änderungen mehr auftreten
    if (JSON.stringify(currentDf) === JSON.stringify(df2)) {
      break;
    }
    
    loops++;
  }
  
  return currentDf;
};

/**
 * Konvertiert Cluster-Daten für die BubbleChart-Visualisierung
 * @param {Array} clusters - Die zu konvertierenden Cluster-Daten
 * @returns {Object} - Daten für ein Bubble-Chart mit Plotly
 */
export const convertToBubbleChartData = (clusters) => {
  return {
    x: clusters.map(c => c.start_text1),
    y: clusters.map(c => c.start_text2),
    mode: 'markers',
    marker: {
      size: clusters.map(c => c.length),
      sizemode: 'area',
      sizeref: 0.1,
      sizemin: 5,
      color: clusters.map(c => c.length),
      colorscale: 'Viridis',
      showscale: true,
      colorbar: {
        title: 'Cluster-Länge'
      }
    },
    text: clusters.map(c => `Länge: ${c.length}<br>Text 1: ${c.start_text1}-${c.end_text1}<br>Text 2: ${c.start_text2}-${c.end_text2}`),
    hoverinfo: 'text',
    type: 'scatter'
  };
};

/**
 * Konvertiert Cluster-Daten für die LineChart-Visualisierung
 * @param {Array} clusters - Die zu konvertierenden Cluster-Daten
 * @returns {Array} - Daten für ein Linien-Diagramm mit Plotly
 */
export const convertToLineChartData = (clusters) => {
  // Sortiere die Cluster nach start_text1
  const sortedClusters = [...clusters].sort((a, b) => a.start_text1 - b.start_text1);
  
  return [
    {
      x: sortedClusters.map(c => c.start_text1),
      y: sortedClusters.map(c => c.start_text2),
      mode: 'lines+markers',
      name: 'Cluster-Positionen',
      marker: {
        size: 8,
        color: 'red'
      },
      line: {
        shape: 'linear',
        color: 'blue'
      }
    }
  ];
};

/**
 * Konvertiert Cluster-Ergebnisse in einen CSV-String zum Download
 * @param {Array} clusters - Die Cluster-Ergebnisse
 * @param {Object} processed1 - Verarbeiteter erster Text für den Inhalt
 * @returns {string} - CSV-String mit den Cluster-Daten
 */
export const convertClustersToCSV = (clusters, processed1) => {
  const header = ['Start Text 1', 'Ende Text 1', 'Start Text 2', 'Ende Text 2', 'Länge', 'Differenz', 'Inhalt'];
  const rows = [];
  
  // CSV-Header
  rows.push(header.join(','));
  
  // Datenzeilen
  for (const cluster of clusters) {
    const start1 = cluster.start_text1;
    const end1 = cluster.end_text1;
    const clusterContent = processed1.stringTokens.slice(start1, end1).join(' ');
    
    // Anführungszeichen für den Inhalt hinzufügen, um Komma-Probleme zu vermeiden
    const escapedContent = `"${clusterContent.replace(/"/g, '""')}"`;
    
    const row = [
      cluster.start_text1,
      cluster.end_text1,
      cluster.start_text2,
      cluster.end_text2,
      cluster.length,
      cluster.differenz,
      escapedContent
    ];
    
    rows.push(row.join(','));
  }
  
  return rows.join('\n');
};