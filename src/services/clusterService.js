/**
 * Service for processing cluster data
 * This service provides functions to process text data,
 * find clusters, and prepare data for visualizations.
 */

// Import the required core functions
import { clusterPreprocess } from '../core/preprocessing.js';
import { findClusters } from '../core/clusterSearch.js';

/**
 * Processes two texts and finds clusters
 * @param {string} text1 - The first text
 * @param {string} text2 - The second text
 * @param {number} minLength - Minimum length for a cluster
 * @param {Array<string>} separators - Separators for text processing
 * @param {boolean} toLowerCase - Convert text to lowercase
 * @returns {Object} - Processed texts and found clusters
 */
export const processTextsAndFindClusters = (
  text1,
  text2,
  minLength = 5,
  separators = [' ', ',', '.', '!', '?', ';', ':', '\n', '\t'],
  toLowerCase = true
) => {
  // Settings for preprocessing
  const preprocessOptions = {
    toLowerCase: toLowerCase,
    separators: separators
  };
  
  // Preprocess texts
  const processed1 = clusterPreprocess(text1, preprocessOptions);
  const processed2 = clusterPreprocess(text2, preprocessOptions);
  
  // Find clusters
  const clusters = findClusters(processed1, processed2, minLength, 'text1', 'text2');
  
  return {
    processed1,
    processed2,
    clusters
  };
};

/**
 * Checks if the values in a column are sorted in ascending order
 * @param {Array} clusters - The cluster list
 * @param {string} columnName - The name of the column to check
 * @returns {boolean} - True if the column is sorted in ascending order
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
 * Removes outlier clusters based on position jumps in Text B
 * @param {Array} clusters - The cluster array
 * @param {string} textBStartCol - Column name for the start position in Text B
 * @returns {Array} - Filtered array without outlier clusters
 */
export const removeOutlyingClusters = (clusters, textBStartCol = 'start_text2') => {
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
  
  // Array for marking rows to be removed
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
  
  // Remove identified outliers
  const result = df.filter((_, index) => !dropIndices.includes(index));
  
  // Remove duplicates (same start position in Text B)
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
 * Removes overlapping clusters in Text A
 * @param {Array} clusterDf - Cluster array
 * @param {string} startACol - Column name for the start position in Text A
 * @param {string} endACol - Column name for the end position in Text A
 * @param {boolean} verbose - Whether information about removed rows should be output
 * @returns {Array} - Filtered array without overlapping clusters
 */
export const removeOverlappingClusters = (
  clusterDf, 
  startACol = 'start_text1', 
  endACol = 'end_text1', 
  verbose = false
) => {
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
};

/**
 * Cleans the cluster table by removing outliers and overlapping clusters
 * @param {Array} df - Cluster array
 * @param {string} startACol - Column name for the start position in Text A
 * @param {string} endACol - Column name for the end position in Text A
 * @param {string} startBCol - Column name for the start position in Text B
 * @param {boolean} noLoop - Whether the cleaning should be performed only once
 * @returns {Array} - Cleaned array without outliers and overlapping clusters
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
  
  return currentDf;
};

/**
 * Converts cluster data for the BubbleChart visualization
 * @param {Array} clusters - The cluster data to convert
 * @returns {Object} - Data for a bubble chart with Plotly
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
        title: 'Cluster Length'
      }
    },
    text: clusters.map(c => `Length: ${c.length}<br>Text 1: ${c.start_text1}-${c.end_text1}<br>Text 2: ${c.start_text2}-${c.end_text2}`),
    hoverinfo: 'text',
    type: 'scatter'
  };
};

/**
 * Compares two texts and organizes their similarities and unique elements in a structured data structure
 * @param {Array} a - The first sequence for comparison
 * @param {Array} b - The second sequence for comparison
 * @param {Array} clusterArray - An array with cluster information
 * @param {string} textAName - The name of the first sequence for identification (default: 'text1')
 * @param {string} textBName - The name of the second sequence for identification (default: 'text2')
 * @returns {Array} - An array with structured comparison data
 */
export const compareTexts = (a, b, clusterArray = [], textAName = 'text1', textBName = 'text2') => {
  // Prepare result array
  const comparisonResult = [];
  
  if (!a || !b || !Array.isArray(a) || !Array.isArray(b)) {
    console.error('Invalid inputs for compareTexts: a and b must be arrays');
    return comparisonResult;
  }
  
  if (clusterArray.length === 0) {
    // If no clusters are present, consider texts as unique
    comparisonResult.push({
      tag: 'unique',
      [`Pos_${textAName}`]: 0,
      [`Length_${textAName}`]: a.length,
      [textAName]: a.join('་'),
      [`Pos_${textBName}`]: 0,
      [`Length_${textBName}`]: b.length,
      [textBName]: b.join('་'),
      Length_Cluster: 0,
      Cluster: ''
    });
    
    return comparisonResult;
  }
  
  // Check if the required columns are present in the cluster data
  const requiredKeys = [
    `start_${textAName}`, 
    `end_${textAName}`, 
    `start_${textBName}`, 
    `end_${textBName}`, 
    'length'
  ];
  
  // Check if all required keys are present in the first cluster object
  if (!requiredKeys.every(key => key in clusterArray[0])) {
    console.error(`Error: clusterArray must contain objects with the properties ${requiredKeys}`);
    return comparisonResult;
  }
  
  let aStart = 0;
  let bStart = 0;
  
  // Iterate over all clusters
  for (let clusterNr = 0; clusterNr < clusterArray.length; clusterNr++) {
    // Extract cluster start and end positions
    const startA = clusterArray[clusterNr][`start_${textAName}`];
    const endA = clusterArray[clusterNr][`end_${textAName}`];
    const startB = clusterArray[clusterNr][`start_${textBName}`];
    const endB = clusterArray[clusterNr][`end_${textBName}`];
    const length = clusterArray[clusterNr].length;
    
    // Add unique elements (before the current cluster)
    if (startA > aStart || startB > bStart) {
      comparisonResult.push({
        tag: 'unique',
        [`Pos_${textAName}`]: aStart,
        [`Length_${textAName}`]: startA - aStart,
        [textAName]: a.slice(aStart, startA).join('་'),
        [`Pos_${textBName}`]: bStart,
        [`Length_${textBName}`]: startB - bStart,
        [textBName]: b.slice(bStart, startB).join('་'),
        Length_Cluster: 0,
        Cluster: ''
      });
    }
    
    // Add cluster
    comparisonResult.push({
      tag: 'cluster',
      [`Pos_${textAName}`]: startA,
      [`Length_${textAName}`]: 0,
      [textAName]: '',
      [`Pos_${textBName}`]: startB,
      [`Length_${textBName}`]: 0,
      [textBName]: '',
      Length_Cluster: length,
      Cluster: a.slice(startA, endA).join('་')
    });
    
    // Update start positions
    aStart = endA;
    bStart = endB;
  }
  
  // Add the last unique elements (after the last cluster)
  if (aStart < a.length || bStart < b.length) {
    comparisonResult.push({
      tag: 'unique',
      [`Pos_${textAName}`]: aStart,
      [`Length_${textAName}`]: a.length - aStart,
      [textAName]: a.slice(aStart).join('་'),
      [`Pos_${textBName}`]: bStart,
      [`Length_${textBName}`]: b.length - bStart,
      [textBName]: b.slice(bStart).join('་'),
      Length_Cluster: 0,
      Cluster: ''
    });
  }
  
  return comparisonResult;
};

/**
 * Converts the comparison data to a CSV string for download
 * @param {Array} comparisonData - The comparison data from compareTexts()
 * @returns {string} - CSV string with the comparison data
 */
export const convertComparisonToCSV = (comparisonData, textAName = 'text1', textBName = 'text2') => {
  if (!comparisonData || comparisonData.length === 0) {
    return '';
  }
  
  // Create header row
  const headers = [
    'Tag', 
    `Pos_${textAName}`, 
    `Length_${textAName}`, 
    textAName, 
    `Pos_${textBName}`, 
    `Length_${textBName}`, 
    textBName, 
    'Length_Cluster', 
    'Cluster'
  ];
  
  const rows = [headers.join(',')];
  
  // Create data rows
  comparisonData.forEach(row => {
    const csvRow = [
      row.tag,
      row[`Pos_${textAName}`],
      row[`Length_${textAName}`],
      `"${(row[textAName] || '').replace(/"/g, '""')}"`,
      row[`Pos_${textBName}`],
      row[`Length_${textBName}`],
      `"${(row[textBName] || '').replace(/"/g, '""')}"`,
      row.Length_Cluster,
      `"${(row.Cluster || '').replace(/"/g, '""')}"`
    ];
    
    rows.push(csvRow.join(','));
  });
  
  return rows.join('\n');
};

/**
 * Converts cluster results to a CSV string for download
 * @param {Array} clusters - The cluster results
 * @param {Object} processed1 - Processed first text for the content
 * @returns {string} - CSV string with the cluster data
 */
export const convertClustersToCSV = (clusters, processed1) => {
  const header = ['Start Text 1', 'End Text 1', 'Start Text 2', 'End Text 2', 'Length', 'Difference', 'Content'];
  const rows = [];
  
  // CSV header
  rows.push(header.join(','));
  
  // Data rows
  for (const cluster of clusters) {
    const start1 = cluster.start_text1;
    const end1 = cluster.end_text1;
    const clusterContent = processed1.stringTokens.slice(start1, end1).join(' ');
    
    // Add quotes to the content to avoid comma issues
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