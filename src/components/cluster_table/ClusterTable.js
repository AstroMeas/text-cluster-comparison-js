import React, { useState, useEffect } from 'react';
import './ClusterTable.css';

/**
 * ClusterTable component for displaying the found clusters in table format
 * 
 * @param {Object} props - Component properties
 * @param {Array} props.clusters - Array with cluster data
 * @param {Object} props.processed1 - Processed first text for content
 * @param {boolean} props.isAscending - Whether the start_text2 column is sorted in ascending order
 * @param {Function} props.onCleanClusters - Callback for cleaning the clusters
 * @param {Function} props.onDownloadCSV - Callback for downloading as CSV
 */
const ClusterTable = ({ 
  clusters = [], 
  processed1, 
  isAscending = true,
  onCleanClusters,
  onDownloadCSV
}) => {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Reset to the first page when the clusters change
  useEffect(() => {
    setCurrentPage(1);
  }, [clusters]);
  
  // Pagination calculation
  const totalPages = Math.ceil(clusters.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClusters = clusters.slice(indexOfFirstItem, indexOfLastItem);
  
  // Page navigation
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  
  // No clusters available
  if (clusters.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Cluster Results</div>
        <p>No clusters found that meet the minimum length.</p>
      </div>
    );
  }
  
  return (
    <div className="card">
      <div className="card-title">Found Clusters ({clusters.length})</div>
      
      {/* Status and button to clean clusters */}
      <div className="cluster-status">
        <span>Clusters are</span>
        {isAscending ? (
          <span className="status-indicator status-success">sorted in ascending order</span>
        ) : (
          <>
            <span className="status-indicator status-error">not sorted in ascending order</span>
            <button 
              className="clean-button" 
              onClick={onCleanClusters}
            >
              Remove outlier clusters
            </button>
          </>
        )}
      </div>
      
      {/* Cluster table */}
      <div className="cluster-table-container">
        <table className="cluster-table">
          <thead>
            <tr>
              <th>Start Text 1</th>
              <th>End Text 1</th>
              <th>Start Text 2</th>
              <th>End Text 2</th>
              <th>Length</th>
              <th>Difference</th>
              <th>Content</th>
            </tr>
          </thead>
          <tbody>
            {currentClusters.map((cluster, index) => {
              // Get original text for the cluster
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
      
      {/* Download button */}
      <div className="actions-container">
        <button 
          className="download-button" 
          onClick={onDownloadCSV}
        >
          Download results (CSV)
        </button>
      </div>
    </div>
  );
};

export default ClusterTable;