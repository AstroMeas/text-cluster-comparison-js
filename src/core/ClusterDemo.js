import { clusterPreprocess } from './preprocessing.js';
import { findClusters } from './clusterSearch.js';

// DOM-Elemente für die Cluster-Demo
const text1Element = document.getElementById('text1');
const text2Element = document.getElementById('text2');
const minLengthInput = document.getElementById('minLength');
const toLowerCaseCheckbox = document.getElementById('toLowerCase');
const separatorInput = document.getElementById('separatorInput');
const addSeparatorButton = document.getElementById('addSeparatorButton');
const separatorListElement = document.getElementById('separatorList');
const clusterButton = document.getElementById('findClustersButton');
const resultElement = document.getElementById('clusterResults');

// Standard-Trennzeichen
let separators = [' ', ',', '.', '!', '?', ';', ':', '\n', '\t'];
// Globale Variable für Cluster und verarbeitete Texte
let globalClusters = [];
let globalProcessed1 = null;
let globalProcessed2 = null;

// Event-Listener hinzufügen
clusterButton.addEventListener('click', findTextClusters);
addSeparatorButton.addEventListener('click', addSeparator);

// Initiale Darstellung der Trennzeichen
updateSeparatorList();

/**
 * Fügt ein neues Trennzeichen zur Liste hinzu
 */
function addSeparator() {
  const separator = separatorInput.value;
  
  if (separator && !separators.includes(separator)) {
    separators.push(separator);
    updateSeparatorList();
    separatorInput.value = '';
  }
}

/**
 * Entfernt ein Trennzeichen aus der Liste
 * @param {number} index - Index des zu entfernenden Trennzeichens
 */
function removeSeparator(index) {
  separators.splice(index, 1);
  updateSeparatorList();
}

/**
 * Aktualisiert die Anzeige der Trennzeichenliste
 */
function updateSeparatorList() {
  separatorListElement.innerHTML = '';
  
  separators.forEach((separator, index) => {
    const item = document.createElement('div');
    item.className = 'separator-item';
    
    // Leerzeichen besonders darstellen
    const displayText = separator === ' ' ? '␣ (Leerzeichen)' : 
                        separator === '\n' ? '↵ (Zeilenumbruch)' :
                        separator === '\t' ? '→ (Tab)' : separator;
    
    item.innerHTML = `
      <span>${displayText}</span>
      <button class="remove-separator" data-index="${index}">×</button>
    `;
    
    // Event-Listener für den Entfernen-Button
    const removeButton = item.querySelector('.remove-separator');
    removeButton.addEventListener('click', () => removeSeparator(index));
    
    separatorListElement.appendChild(item);
  });
}

/**
 * Hauptfunktion zum Finden von Clustern zwischen zwei Texten
 */
function findTextClusters() {
  const text1 = text1Element.value;
  const text2 = text2Element.value;
  
  if (!text1.trim() || !text2.trim()) {
    resultElement.textContent = 'Bitte gib beide Texte ein.';
    return;
  }
  
  // Mindestlänge für Cluster aus dem Input-Feld holen
  const minLength = parseInt(minLengthInput.value) || 5;
  
  // Einstellungen für die Vorverarbeitung
  const preprocessOptions = {
    toLowerCase: toLowerCaseCheckbox.checked,
    separators: separators
  };
  
  // Texte vorverarbeiten
  const processed1 = clusterPreprocess(text1, preprocessOptions);
  const processed2 = clusterPreprocess(text2, preprocessOptions);
  
  // Globale Variablen speichern
  globalProcessed1 = processed1;
  globalProcessed2 = processed2;
  
  // Cluster finden
  try {
    const clusters = findClusters(processed1, processed2, minLength, 'text1', 'text2');
    globalClusters = clusters;
    displayClusters(clusters, text1, text2, processed1, processed2);
  } catch (error) {
    resultElement.textContent = `Fehler beim Clustervergleich: ${error.message}`;
  }
}

/**
 * Zeigt die gefundenen Cluster im Ergebnisbereich an
 * @param {Array} clusters - Die gefundenen Cluster
 * @param {string} text1 - Der erste Text
 * @param {string} text2 - Der zweite Text
 * @param {Object} processed1 - Verarbeiteter erster Text
 * @param {Object} processed2 - Verarbeiteter zweiter Text
 */
function displayClusters(clusters, text1, text2, processed1, processed2) {
  if (clusters.length === 0) {
    resultElement.innerHTML = '<p>Keine Cluster gefunden, die der Mindestlänge entsprechen.</p>';
    return;
  }
  
  // Überprüfen, ob die start_text2 Spalte aufsteigend ist
  const isAscending = isColumnAscending(clusters, 'start_text2');
  
  let html = `<h3>Gefundene Cluster (${clusters.length})</h3>`;
  
  // Anzeigen, ob die Spalte aufsteigend ist
  html += `<p>Cluster ${isAscending ? '<span style="color: green;">sind aufsteigend sortiert</span>' : 
    '<span style="color: red;">die nicht in das Muster gefunden. Text 2 ist nicht aufsteigend sortiert</span>'}</p>`;
  
  // Button zum Bereinigen der Cluster anzeigen, wenn sie nicht aufsteigend sind
  if (!isAscending) {
    html += '<div style="margin-bottom: 15px;">';
    html += '<button id="cleanClustersButton" class="clean-button">Ausreißer-Cluster entfernen</button>';
    html += '</div>';
  }
  
  html += '<table class="cluster-table">';
  html += '<thead><tr>';
  html += '<th>Start Text 1</th>';
  html += '<th>Ende Text 1</th>';
  html += '<th>Start Text 2</th>';
  html += '<th>Ende Text 2</th>';
  html += '<th>Länge</th>';
  html += '<th>Differenz</th>';
  html += '<th>Inhalt</th>';
  html += '</tr></thead>';
  html += '<tbody>';
  
  for (const cluster of clusters) {
    // Originalen Text für den Cluster abrufen
    const start1 = cluster.start_text1;
    const end1 = cluster.end_text1;
    const clusterContent = processed1.stringTokens.slice(start1, end1).join(' ');
    
    html += '<tr>';
    html += `<td>${cluster.start_text1}</td>`;
    html += `<td>${cluster.end_text1}</td>`;
    html += `<td>${cluster.start_text2}</td>`;
    html += `<td>${cluster.end_text2}</td>`;
    html += `<td>${cluster.length}</td>`;
    html += `<td>${cluster.differenz}</td>`;
    html += `<td class="cluster-content">${clusterContent}</td>`;
    html += '</tr>';
  }
  
  html += '</tbody></table>';
  
  // Download-Button hinzufügen
  html += '<div style="margin-top: 20px;">';
  html += '<button id="downloadButton">Ergebnisse herunterladen</button>';
  html += '</div>';
  
  resultElement.innerHTML = html;
  
  // Event-Listener für den Download-Button hinzufügen
  document.getElementById('downloadButton').addEventListener('click', () => {
    downloadClusterResults(clusters, processed1);
  });
  
  // Event-Listener für den Bereinigen-Button hinzufügen, wenn er existiert
  const cleanButton = document.getElementById('cleanClustersButton');
  if (cleanButton) {
    cleanButton.addEventListener('click', cleanAndDisplayClusters);
  }
}

/**
 * Überprüft, ob die Werte in einer Spalte aufsteigend sortiert sind
 * @param {Array} clusters - Die Cluster-Liste
 * @param {string} columnName - Der Name der zu überprüfenden Spalte
 * @returns {boolean} - True, wenn die Spalte aufsteigend sortiert ist
 */
function isColumnAscending(clusters, columnName) {
  if (clusters.length <= 1) return true;
  
  for (let i = 1; i < clusters.length; i++) {
    if (clusters[i][columnName] < clusters[i-1][columnName]) {
      return false;
    }
  }
  
  return true;
}

/**
 * Entfernt Ausreißer-Cluster basierend auf Positionssprüngen in Text B
 * @param {Array} clusters - Die Cluster-Array
 * @param {string} textBStartCol - Spaltenname für die Startposition in Text B (default: 'start_text2')
 * @returns {Array} - Gefiltertes Array ohne Ausreißer-Cluster
 */
function removeOutlyingClusters(clusters, textBStartCol = 'start_text2') {
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
  
  console.log("Entferne Indizes:", dropIndices);
  
  // Identifizierte Ausreißer entfernen
  const result = df.filter((_, index) => !dropIndices.includes(index));
  
  // Duplikate entfernen (gleiche Startposition in Text B)
  const uniqueResult = [];
  const seen = new Set();
  
  for (let i = 0; i < result.length; i++) {
    if (i > 0 && result[i][textBStartCol] === result[i-1][textBStartCol]) {
      continue;
    }
    uniqueResult.push(result[i]);
  }
  
  console.log(`${df.length - uniqueResult.length} Cluster entfernt`);
  
  return uniqueResult;
}

/**
 * Entfernt überlappende Cluster in Text A
 * @param {Array} clusterDf - Cluster-Array
 * @param {string} startACol - Spaltenname für die Startposition in Text A (default: 'start_text1')
 * @param {string} endACol - Spaltenname für die Endposition in Text A (default: 'end_text1')
 * @param {boolean} verbose - Ob Informationen über entfernte Zeilen ausgegeben werden sollen (default: false)
 * @returns {Array} - Gefiltertes Array ohne überlappende Cluster
 */
function removeOverlappingClusters(clusterDf, startACol = 'start_text1', endACol = 'end_text1', verbose = false) {
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
}

/**
 * Bereinigt die Cluster-Tabelle durch Entfernen von Ausreißern und überlappenden Clustern
 * @param {Array} df - Cluster-Array
 * @param {string} startACol - Spaltenname für die Startposition in Text A
 * @param {string} endACol - Spaltenname für die Endposition in Text A
 * @param {string} startBCol - Spaltenname für die Startposition in Text B
 * @param {boolean} noLoop - Ob die Bereinigung nur einmal durchgeführt werden soll (true) oder in einer Schleife (false)
 * @returns {Array} - Bereinigtes Array ohne Ausreißer und überlappende Cluster
 */
function cleanClusterTable(df, startACol, endACol, startBCol, noLoop = true) {
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
  
  // Endgültiges Ergebnis prüfen
  const asc = isColumnAscending(currentDf, startBCol);
  console.log(`Nur aufsteigend? ${asc} nach ${loops} Durchläufen`);
  
  return currentDf;
}

/**
 * Bereinigt die aktuellen Cluster und zeigt sie erneut an
 */
function cleanAndDisplayClusters() {
  if (!globalClusters || globalClusters.length === 0) {
    console.warn("Keine Cluster zum Bereinigen verfügbar");
    return;
  }
  
  // Cluster bereinigen
  const cleanedClusters = cleanClusterTable(
    globalClusters, 
    'start_text1', 
    'end_text1', 
    'start_text2',
    false
  );
  
  // Globale Variable aktualisieren
  globalClusters = cleanedClusters;
  
  // Bereinigte Cluster anzeigen
  displayClusters(
    cleanedClusters, 
    text1Element.value, 
    text2Element.value, 
    globalProcessed1, 
    globalProcessed2
  );
}

/**
 * Konvertiert Cluster-Ergebnisse in einen CSV-String
 * @param {Array} clusters - Die Cluster-Ergebnisse
 * @param {Object} processed1 - Verarbeiteter erster Text für den Inhalt
 * @returns {string} - CSV-String mit den Cluster-Daten
 */
function convertClustersToCSV(clusters, processed1) {
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
}

/**
 * Lädt die Cluster-Ergebnisse als CSV-Datei herunter
 * @param {Array} clusters - Die Cluster-Ergebnisse
 * @param {Object} processed1 - Verarbeiteter erster Text für den Inhalt
 */
function downloadClusterResults(clusters, processed1) {
  // CSV-Daten erstellen
  const csvData = convertClustersToCSV(clusters, processed1);
  
  // Blob erstellen
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  
  // URL für den Blob erstellen
  const url = URL.createObjectURL(blob);
  
  // Temporären Link erstellen und klicken
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
}

// Konsolenausgabe zur Bestätigung, dass das Skript geladen wurde
console.log('Cluster Demo geladen');