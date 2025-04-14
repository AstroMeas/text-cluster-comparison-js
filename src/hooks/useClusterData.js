import { useState, useCallback } from 'react';
import { 
  processTextsAndFindClusters, 
  isColumnAscending,
  cleanClusterTable,
  convertToBubbleChartData,
  convertClustersToCSV
} from '../services/clusterService';

/**
 * Custom React hook for managing cluster data and their processing
 * @returns {Object} State and functions for processing cluster data
 */
const useClusterData = () => {
  // State for input texts and their processing
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [minLength, setMinLength] = useState(5);
  const [toLowerCase, setToLowerCase] = useState(true);
  const [separators, setSeparators] = useState([' ', ',', '.', '!', '?', ';', ':', '\n', '\t']);
  
  // State for processing results
  const [processed1, setProcessed1] = useState(null);
  const [processed2, setProcessed2] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [isAscending, setIsAscending] = useState(true);
  
  // State for UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Performs cluster analysis for the entered texts
   */
  const analyzeClusters = useCallback(() => {
    if (!text1.trim() || !text2.trim()) {
      setError('Please enter both texts.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Process the texts and find clusters
      const result = processTextsAndFindClusters(
        text1,
        text2,
        minLength,
        separators,
        toLowerCase
      );
      
      // Update the state with the results
      setProcessed1(result.processed1);
      setProcessed2(result.processed2);
      setClusters(result.clusters);
      
      // Check if the start_text2 column is sorted in ascending order
      setIsAscending(isColumnAscending(result.clusters));
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error in cluster analysis:', err);
      setError(`Error in cluster analysis: ${err.message}`);
      setIsLoading(false);
    }
  }, [text1, text2, minLength, separators, toLowerCase]);
  
  /**
   * Cleans the found clusters of outliers and overlaps
   */
  const cleanClusters = useCallback(() => {
    if (clusters.length === 0) {
      setError('No clusters available for cleaning.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Clean the cluster table
      const cleanedClusters = cleanClusterTable(
        clusters,
        'start_text1',
        'end_text1',
        'start_text2',
        false // false for multiple iterations until all clusters are ascending
      );
      
      // Update the state with the cleaned clusters
      setClusters(cleanedClusters);
      
      // Check again if the start_text2 column is sorted in ascending order
      setIsAscending(isColumnAscending(cleanedClusters));
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error cleaning clusters:', err);
      setError(`Error cleaning clusters: ${err.message}`);
      setIsLoading(false);
    }
  }, [clusters]);
  
  /**
   * Prepares data for a bubble chart
   * @returns {Object} - Data for a bubble chart with Plotly
   */
  const getBubbleChartData = useCallback(() => {
    if (clusters.length === 0) return null;
    return convertToBubbleChartData(clusters);
  }, [clusters]);
  
  /**
   * Downloads the cluster results as a CSV file
   */
  const downloadClustersCSV = useCallback(() => {
    if (clusters.length === 0 || !processed1) {
      setError('No clusters available for download.');
      return;
    }
    
    try {
      // Convert clusters to CSV
      const csvData = convertClustersToCSV(clusters, processed1);
      
      // Create a blob from the CSV data
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link for download
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
    } catch (err) {
      console.error('Error downloading CSV file:', err);
      setError(`Error downloading: ${err.message}`);
    }
  }, [clusters, processed1]);
  
  /**
   * Adds a new separator to the list
   * @param {string} separator - The separator to add
   */
  const addSeparator = useCallback((separator) => {
    if (separator && !separators.includes(separator)) {
      setSeparators(prev => [...prev, separator]);
    }
  }, [separators]);
  
  /**
   * Removes a separator from the list
   * @param {number} index - The index of the separator to remove
   */
  const removeSeparator = useCallback((index) => {
    setSeparators(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  return {
    // States
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
    
    // Setter functions
    setText1,
    setText2,
    setMinLength,
    setToLowerCase,
    
    // Action functions
    analyzeClusters,
    cleanClusters,
    getBubbleChartData,
    downloadClustersCSV,
    addSeparator,
    removeSeparator
  };
};

export default useClusterData;