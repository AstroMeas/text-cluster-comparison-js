import { Cluster } from './cluster.js';

/**
 * Core algorithm to find matching clusters between two sequences.
 * @param {Array<number>} a - First sequence of values (hash tokens)
 * @param {Array<number>} b - Second sequence of values (hash tokens)
 * @param {number} min_length - Minimum length for a cluster to be considered valid
 * @returns {Array<Array<number>>} - Array of clusters, each as [start_a, start_b, length]
 */
function clusterSearch(a, b, min_length) {
  const len_a = a.length;
  const len_b = b.length;
  let skips = 0;
  
  // Array to store clusters
  const clusters = [];

  // Main loop: iterate through first sequence
  for (let i = 0; i < len_a; i++) {
    // Skip positions that are part of previous clusters
    if (skips > 0) {
      skips--;
      continue;
    }
    
    // Inner loop: compare with each position in second sequence
    for (let j = 0; j < len_b; j++) {
      // Check if current elements match
      if (a[i] === b[j]) {
        // Initialize pointers and counter for extending the match
        let h = i;
        let k = j;
        let length = 1;
        
        // Extend the match as far as possible
        while (h + 1 < len_a && k + 1 < len_b && a[h + 1] === b[k + 1]) {
          h++;
          k++;
          length++;
        }
        
        // If match meets minimum length requirement, record it
        if (length >= min_length) {
          clusters.push([i, j, length]);
          
          // Update skip count to avoid redundant processing
          skips = length - 1;
          
          // Break inner loop since we found a match
          break;
        }
      }
    }
  }
  
  return clusters;
}

/**
 * Finds clusters of similar sequences in two lists of tokens.
 * @param {Object} a_processed - Processed text A with hashTokens
 * @param {Object} b_processed - Processed text B with hashTokens
 * @param {number} min_length - Minimum length for a cluster (default: 10)
 * @param {string} a_name - Name for the first sequence (default: 'text_a')
 * @param {string} b_name - Name for the second sequence (default: 'text_b')
 * @returns {Array} - Array of cluster information with positions and lengths
 */
export function findClusters(a_processed, b_processed, min_length = 10, a_name = 'text_a', b_name = 'text_b') {
  // Input validation
  if (!a_processed || !b_processed) {
    console.warn("One or both input processed texts are null or undefined");
    return [];
  }
  
  const a_tokens = a_processed.hashTokens;
  const b_tokens = b_processed.hashTokens;
  
  if (!a_tokens || !b_tokens || a_tokens.length === 0 || b_tokens.length === 0) {
    console.warn("One or both input token sequences are empty");
    return [];
  }
  
  if (min_length < 1) {
    throw new Error("min_length must be at least 1");
  }
  
  console.log(`Length of sequences: ${a_tokens.length} and ${b_tokens.length} items`);
  console.log(`Using minimum cluster length: ${min_length}`);
  
  try {
    // Find all potential clusters using the token hashes
    const clusters = clusterSearch(a_tokens, b_tokens, min_length);
    
    // Handle case with no clusters found
    if (clusters.length === 0) {
      console.log("No clusters found that meet the minimum length requirement");
      return [];
    }
    
    // Process clusters into organized data structure
    const cluster_lst = [];
    let last_cluster = -1;
    
    // Create Cluster objects for each unique starting position
    for (const clus of clusters) {
      // Finalize the previous cluster if moving to a new position
      if (clus[0] > last_cluster && last_cluster !== -1) {
        cluster_lst[cluster_lst.length - 1].pickFinalCluster();
      }
      
      // Start a new cluster if at a new position
      if (clus[0] > last_cluster) {
        cluster_lst.push(new Cluster(clus[0], a_name, b_name));
        last_cluster = clus[0];
      }
      
      // Add this match to the current cluster
      cluster_lst[cluster_lst.length - 1].appendCluster(clus[1], clus[2]);
    }
    
    // Finalize the last cluster
    if (cluster_lst.length > 0) {
      cluster_lst[cluster_lst.length - 1].pickFinalCluster();
    } else {
      // Safety check - should not happen if clusters.length > 0
      console.warn("No clusters were created despite finding matches");
      return [];
    }
    
    // Prepare data for result
    const result = [];
    
    // Fill in the data
    for (const cluster of cluster_lst) {
      // Create a result object with the cluster data
      const cluster_data = {};
      
      for (let j = 0; j < 5; j++) {
        cluster_data[cluster.clus_tupel_naming[j]] = cluster.final_cluster[j];
      }
      
      // Add difference column
      cluster_data['differenz'] = cluster_data[`start_${b_name}`] - cluster_data[`start_${a_name}`];
      
      result.push(cluster_data);
    }
    
    console.log(`Found ${result.length} clusters`);
    return result;
    
  } catch (e) {
    console.error(`Error during cluster finding: ${e.message}`);
    throw e;
  }
}