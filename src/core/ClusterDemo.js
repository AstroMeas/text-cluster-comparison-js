import { clusterPreprocess } from './preprocessing.js';
import { findClusters } from './clusterSearch.js';

// DOM elements for the cluster demo
const text1Element = document.getElementById('text1');
const text2Element = document.getElementById('text2');
const minLengthInput = document.getElementById('minLength');
const toLowerCaseCheckbox = document.getElementById('toLowerCase');
const separatorInput = document.getElementById('separatorInput');
const addSeparatorButton = document.getElementById('addSeparatorButton');
const separatorListElement = document.getElementById('separatorList');
const clusterButton = document.getElementById('findClustersButton');
const resultElement = document.getElementById('clusterResults');

// Default separators
let separators = [' ', ',', '.', '!', '?', ';', ':', '\n', '\t'];
// Global variables for clusters and processed texts
let globalClusters = [];
let globalProcessed1 = null;
let globalProcessed2 = null;

// Add event listeners
clusterButton.addEventListener('click', findTextClusters);
addSeparatorButton.addEventListener('click', addSeparator);

// Initial display of separators
updateSeparatorList();

/**
 * Adds a new separator to the list
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
 * Removes a separator from the list
 * @param {number} index - Index of the separator to remove
 */
function removeSeparator(index) {
  separators.splice(index, 1);
  updateSeparatorList();
}

/**
 * Updates the display of the separator list
 */
function updateSeparatorList() {
  separatorListElement.innerHTML = '';
  
  separators.forEach((separator, index) => {
    const item = document.createElement('div');
    item.className = 'separator-item';
    
    // Display special characters differently
    const displayText = separator === ' ' ? '␣ (Space)' : 
                        separator === '\n' ? '↵ (Line Break)' :
                        separator === '\t' ? '→ (Tab)' : separator;
    
    item.innerHTML = `
      <span>${displayText}</span>
      <button class="remove-separator" data-index="${index}">×</button>
    `;
    
    // Event listener for the remove button
    const removeButton = item.querySelector('.remove-separator');
    removeButton.addEventListener('click', () => removeSeparator(index));
    
    separatorListElement.appendChild(item);
  });
}

/**
 * Main function for finding clusters between two texts
 */
function findTextClusters() {
  const text1 = text1Element.value;
  const text2 = text2Element.value;
  
  if (!text1.trim() || !text2.trim()) {
    resultElement.textContent = 'Please enter both texts.';
    return;
  }
  
  // Get minimum length for clusters from the input field
  const minLength = parseInt(minLengthInput.value) || 5;
  
  // Settings for preprocessing
  const preprocessOptions = {
    toLowerCase: toLowerCaseCheckbox.checked,
    separators: separators
  };
  
  // Preprocess texts
  const processed1 = clusterPreprocess(text1, preprocessOptions);
  const processed2 = clusterPreprocess(text2, preprocessOptions);
  
  // Save global variables
  globalProcessed1 = processed1;
  globalProcessed2 = processed2;
  
  // Find clusters
  try {
    const clusters = findClusters(processed1, processed2, minLength, 'text1', 'text2');
    globalClusters = clusters;
    displayClusters(clusters, text1, text2, processed1, processed2);
  } catch (error) {
    resultElement.textContent = `Error during cluster comparison: ${error.message}`;
  }
}

/**
 * Displays the found clusters in the results area
 * @param {Array} clusters - The found clusters
 * @param {string} text1 - The first text
 * @param {string} text2 - The second text
 * @param {Object} processed1 - Processed first text
 * @param {Object} processed2 - Processed second text
 */
function displayClusters(clusters, text1, text2, processed1, processed2) {
  if (clusters.length === 0) {
    resultElement.innerHTML = '<p>No clusters found that meet the minimum length.</p>';
    return;
  }
  
  // Check if the start_text2 column is in ascending order
  const isAscending = isColumnAscending(clusters, 'start_text2');
  
  let html = `<h3>Found Clusters (${clusters.length})</h3>`;
  
  // Show whether the column is in ascending order
  html += `<p>Clusters ${isAscending ? '<span style="color: green;">are sorted in ascending order</span>' : 
    '<span style="color: red;">are not in the pattern. Text 2 is not sorted in ascending order</span>'}</p>`;
  
  // Show button to clean clusters if they are not in ascending order
  if (!isAscending) {
    html += '<div style="margin-bottom: 15px;">';
    html += '<button id="cleanClustersButton" class="clean-button">Remove Outlier Clusters</button>';
    html += '</div>';
  }
  
  html += '<table class="cluster-table">';
  html += '<thead><tr>';
  html += '<th>Start Text 1</th>';
  html += '<th>End Text 1</th>';
  html += '<th>Start Text 2</th>';
  html += '<th>End Text 2</th>';
  html += '<th>Length</th>';
  html += '<th>Difference</th>';
  html += '<th>Content</th>';
  html += '</tr></thead>';
  html += '<tbody>';
  
  for (const cluster of clusters) {
    // Get original text for the cluster
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
  
  // Add download button
  html += '<div style="margin-top: 20px;">';
  html += '<button id="downloadButton">Download Results</button>';
  html += '</div>';
  
  resultElement.innerHTML = html;
  
  // Add event listener for the download button
  document.getElementById('downloadButton').addEventListener('click', () => {
    downloadClusterResults(clusters, processed1);
  });
  
  // Add event listener for the clean button if it exists
  const cleanButton = document.getElementById('cleanClustersButton');
  if (cleanButton) {
    cleanButton.addEventListener('click', cleanAndDisplayClusters);
  }
}

/**
 * Checks if the values in a column are in ascending order
 * @param {Array} clusters - The cluster list
 * @param {string} columnName - The name of the column to check
 * @returns {boolean} - True if the column is in ascending order
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
 * Removes outlier clusters based on position jumps in Text B
 * @param {Array} clusters - The cluster array
 * @param {string} textBStartCol - Column name for the start position in Text B (default: 'start_text2')
 * @returns {Array} - Filtered array without outlier clusters
 */
function removeOutlyingClusters(clusters, textBStartCol = 'start_text2') {
  if (clusters.length <= 1) return clusters;
  
  // Create a copy of the cluster array
  const df = [...clusters];
  
  // Calculate differences between consecutive start positions
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
  
  // Mark rows with negative differences (potential outliers)
  for (let i = 0; i < diffs.length; i++) {
    if (diffs[i] !== null && diffs[i] < 0) {
      flags[i] = 1;
      // Also mark the previous row
      if (i > 0) {
        flags[i-1] = 1;
      }
    }
  }
  
  // Array to mark rows for removal
  const removeIndexes = new Array(df.length).fill(0);
  
  // Process each row to identify outliers
  for (let i = 0; i < df.length; i++) {
    // Skip first row
    if (i === 0) continue;
    
    // Handle last row case
    if (i + 1 === df.length && flags[i] === 1) {
      removeIndexes[i] = 1;
      continue;
    }
    
    // Check consecutive marked rows
    if (flags[i] === 1 && flags[i-1] === 1) {
      let offset = 1;
      
      // Look for suitable boundary
      while ((i - offset) > 0 && (i + offset + 1) < df.length) {
        if (df[i][textBStartCol] > df[i-offset-1][textBStartCol] || 
            df[i-1][textBStartCol] < df[i+offset][textBStartCol]) {
          break;
        } else {
          offset++;
        }
      }
      
      // Mark rows for removal based on identified pattern
      if (df[i-1][textBStartCol] <= df[i+offset][textBStartCol]) {
        for (let j = i; j < i + offset; j++) {
          removeIndexes[j] = 1;
        }
      } else if (df[i][textBStartCol] > df[i-offset-1][textBStartCol]) {
        for (let j = i - offset; j < i; j++) {
          removeIndexes[j] = 1;
        }
      } else {
        console.log(`Problem at index ${i}`);
      }
    }
  }
  
  // Process rows from the end to remove trailing outliers
  for (let i = df.length - 1; i > 0; i--) {
    if (flags[i] === 1) {
      removeIndexes[i] = 1;
    } else {
      break;
    }
  }
  
  // Get indices to remove
  const dropIndices = [];
  for (let i = 0; i < removeIndexes.length; i++) {
    if (removeIndexes[i] === 1) {
      dropIndices.push(i);
    }
  }
  
  console.log("Removing indices:", dropIndices);
  
  // Remove identified outliers
  const result = df.filter((_, index) => !dropIndices.includes(index));
  
  // Remove duplicates (same start position in Text B)
  const uniqueResult = [];
  const seen = new Set();
  
  for (let i = 0; i < result.length; i++) {
    if (i > 0 && result[i][textBStartCol] === result[i-1][textBStartCol]) {
      continue;
    }
    uniqueResult.push(result[i]);
  }
  
  console.log(`${df.length - uniqueResult.length} clusters removed`);
  
  return uniqueResult;
}

/**
 * Removes overlapping clusters in Text A
 * @param {Array} clusterDf - Cluster array
 * @param {string} startACol - Column name for the start position in Text A (default: 'start_text1')
 * @param {string} endACol - Column name for the end position in Text A (default: 'end_text1')
 * @param {boolean} verbose - Whether to output information about removed rows (default: false)
 * @returns {Array} - Filtered array without overlapping clusters
 */
function removeOverlappingClusters(clusterDf, startACol = 'start_text1', endACol = 'end_text1', verbose = false) {
  // Create a copy of the input array
  const df = [...clusterDf];
  
  // Initial number of clusters
  const initialCount = df.length;
  
  // Ensure the array is sorted by start_a
  df.sort((a, b) => a[startACol] - b[startACol]);
  
  // Array for valid rows (non-overlapping)
  const validRows = new Array(df.length).fill(true);
  
  // Previous end_a value
  let prevEndA = null;
  
  // Check each row for overlap with previous
  for (let idx = 0; idx < df.length; idx++) {
    const currentStartA = df[idx][startACol];
    
    // Skip first row
    if (prevEndA !== null) {
      // If current start_a is less than previous end_a, mark as invalid
      if (currentStartA < prevEndA) {
        validRows[idx] = false;
      }
    }
    
    // Update previous end_a
    prevEndA = df[idx][endACol];
  }
  
  // Apply the mask to filter overlapping rows
  const filteredDf = df.filter((_, i) => validRows[i]);
  
  // Number of removed rows
  const removedCount = initialCount - filteredDf.length;
  
  // Output summary if verbose
  if (verbose) {
    console.log(`Initial clusters: ${initialCount}`);
    console.log(`Overlapping clusters removed: ${removedCount}`);
    console.log(`Remaining clusters: ${filteredDf.length}`);
  }
  
  return filteredDf;
}

/**
 * Cleans the cluster table by removing outliers and overlapping clusters
 * @param {Array} df - Cluster array
 * @param {string} startACol - Column name for the start position in Text A
 * @param {string} endACol - Column name for the end position in Text A
 * @param {string} startBCol - Column name for the start position in Text B
 * @param {boolean} noLoop - Whether to perform the cleaning only once (true) or in a loop (false)
 * @returns {Array} - Cleaned array without outliers and overlapping clusters
 */
function cleanClusterTable(df, startACol, endACol, startBCol, noLoop = true) {
  let loops = 0;
  let currentDf = [...df];
  
  // Continue cleaning until column B is ascending or stabilization is reached
  while (!isColumnAscending(currentDf, startBCol)) {
    const df2 = [...currentDf];
    currentDf = removeOverlappingClusters(currentDf, startACol, endACol, false);
    currentDf = removeOutlyingClusters(currentDf, startBCol);
    
    // End after one iteration if noLoop is true
    if (noLoop) {
      break;
    }
    
    // End if no more changes occur
    if (JSON.stringify(currentDf) === JSON.stringify(df2)) {
      break;
    }
    
    loops++;
  }
  
  // Check final result
  const asc = isColumnAscending(currentDf, startBCol);
  console.log(`Only ascending? ${asc} after ${loops} iterations`);
  
  return currentDf;
}

/**
 * Cleans the current clusters and displays them again
 */
function cleanAndDisplayClusters() {
  if (!globalClusters || globalClusters.length === 0) {
    console.warn("No clusters available for cleaning");
    return;
  }
  
  // Clean clusters
  const cleanedClusters = cleanClusterTable(
    globalClusters, 
    'start_text1', 
    'end_text1', 
    'start_text2',
    false
  );
  
  // Update global variable
  globalClusters = cleanedClusters;
  
  // Display cleaned clusters
  displayClusters(
    cleanedClusters, 
    text1Element.value, 
    text2Element.value, 
    globalProcessed1, 
    globalProcessed2
  );
}

/**
 * Converts cluster results to a CSV string
 * @param {Array} clusters - The cluster results
 * @param {Object} processed1 - Processed first text for the content
 * @returns {string} - CSV string with the cluster data
 */
function convertClustersToCSV(clusters, processed1) {
  const header = ['Start Text 1', 'End Text 1', 'Start Text 2', 'End Text 2', 'Length', 'Difference', 'Content'];
  const rows = [];
  
  // CSV header
  rows.push(header.join(','));
  
  // Data rows
  for (const cluster of clusters) {
    const start1 = cluster.start_text1;
    const end1 = cluster.end_text1;
    const clusterContent = processed1.stringTokens.slice(start1, end1).join(' ');
    
    // Add quotes to content to avoid comma issues
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
 * Downloads the cluster results as a CSV file
 * @param {Array} clusters - The cluster results
 * @param {Object} processed1 - Processed first text for the content
 */
function downloadClusterResults(clusters, processed1) {
  // Create CSV data
  const csvData = convertClustersToCSV(clusters, processed1);
  
  // Create blob
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  
  // Create URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create temporary link and click
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'cluster_results.csv');
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

// Console output to confirm that the script has loaded
console.log('Cluster Demo loaded');