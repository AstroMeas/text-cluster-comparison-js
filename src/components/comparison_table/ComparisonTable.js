import React, { useState, useEffect, useCallback } from 'react';
import './ComparisonTable.css';
import { compareTexts, convertComparisonToCSV } from '../../services/clusterService';

/**
 * ComparisonTable component for displaying the structured text comparison
 * 
 * @param {Object} props - Component properties
 * @param {Array} props.clusters - Array with cluster data
 * @param {Object} props.processed1 - Processed first text
 * @param {Object} props.processed2 - Processed second text
 * @param {Boolean} props.isAscending - Indicates whether clusters are sorted in ascending order
 */
const ComparisonTable = ({ 
  clusters = [], 
  processed1, 
  processed2,
  isAscending = false
}) => {
  // State for comparison data
  const [comparisonData, setComparisonData] = useState([]);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Calculate comparison data when input data changes
  useEffect(() => {
    if (!processed1 || !processed2 || !isAscending) {
      setComparisonData([]);
      return;
    }
    
    try {
      // Perform text comparison
      const result = compareTexts(
        processed1.stringTokens, 
        processed2.stringTokens, 
        clusters, 
        'text1', 
        'text2'
      );
      
      setComparisonData(result);
    } catch (error) {
      console.error('Error comparing texts:', error);
      setComparisonData([]);
    }
  }, [clusters, processed1, processed2, isAscending]);
  
  // Reset to the first page when the comparison data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [comparisonData]);
  
  // Pagination calculation
  const totalPages = Math.ceil(comparisonData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = comparisonData.slice(indexOfFirstItem, indexOfLastItem);
  
  // Page navigation
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  
  // Function to download the CSV file
  const downloadCSV = useCallback(() => {
    if (comparisonData.length === 0) {
      console.error('No comparison data available for download');
      return;
    }
    
    try {
      // Convert comparison data to CSV
      const csvData = convertComparisonToCSV(comparisonData, 'text1', 'text2');
      
      // Create a blob from the CSV data
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link for download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'text_comparison.csv');
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
    }
  }, [comparisonData]);
  
  // If no clusters sorted in ascending order are available
  if (!isAscending) {
    return (
      <div className="card">
        <div className="card-title">Text Comparison</div>
        <p>Text comparison is only available when clusters are sorted in ascending order. 
          Please clean the clusters first.</p>
      </div>
    );
  }
  
  // If no comparison data is available
  if (comparisonData.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Text Comparison</div>
        <p>No comparison data available.</p>
      </div>
    );
  }
  
  return (
    <div className="card">
      <div className="card-title">Text Comparison</div>
      
      <div className="comparison-description">
        This table alternately shows unique text sections and common clusters.
        Unique rows (orange) contain different texts, cluster rows (green) show 
        matching text passages.
      </div>
      
      <div className="comparison-header">
        <span>Found elements: {comparisonData.length}</span>
        <button className="download-button" onClick={downloadCSV}>
          Download as CSV
        </button>
      </div>
      
      <div className="comparison-table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Pos. Text 1</th>
              <th>Text 1</th>
              <th>Pos. Text 2</th>
              <th>Text 2</th>
              <th>Cluster Length</th>
              <th>Cluster Content</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr 
                key={index} 
                className={item.tag === 'unique' ? 'unique-row' : 'cluster-row'}
              >
                <td>{item.tag === 'unique' ? 'Unique' : 'Cluster'}</td>
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
      
      {/* Pagination */}
      {totalPages > 1 && (
        <>
          <div className="pagination">
            <button 
              className="pagination-button" 
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              &laquo; Previous
            </button>
            
            {/* Page numbers */}
            {[...Array(totalPages)].map((_, i) => {
              // Limit the number of displayed page numbers
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
              // Ellipsis for skipped pages
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
              Next &raquo;
            </button>
          </div>
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
        </>
      )}
    </div>
  );
};

export default ComparisonTable;