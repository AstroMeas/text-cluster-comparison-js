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
  
  // Cluster finden
  try {
    const clusters = findClusters(processed1, processed2, minLength, 'text1', 'text2');
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
  
  let html = `<h3>Gefundene Cluster (${clusters.length})</h3>`;
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