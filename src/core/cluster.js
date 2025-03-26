/**
 * Represents a cluster of matching elements between two sequences and manages related data.
 */
export class Cluster {
    /**
     * Creates a new Cluster instance
     * @param {number} position_a - Start position in text A
     * @param {string} text_a_name - Name for the first text (default: 'text_a')
     * @param {string} text_b_name - Name for the second text (default: 'text_b')
     */
    constructor(position_a, text_a_name = 'text_a', text_b_name = 'text_b') {
      // Start position in text A
      this.pos_a = position_a;
  
      // Naming of cluster tuple elements for better readability
      this.clus_tupel_naming = [
        `start_${text_a_name}`, 
        `end_${text_a_name}`, 
        `start_${text_b_name}`, 
        `end_${text_b_name}`, 
        'length'
      ];
  
      // List for storing cluster data
      this.clusters = [];
  
      // Stores the cluster content with the greatest length
      this.final_cluster = null;
    }
  
    /**
     * Adds an identical cluster from text B, specifying the start position and length.
     * @param {number} pos_b - Start position of the cluster in text B
     * @param {number} cluster_length - The length of the cluster
     */
    appendCluster(pos_b, cluster_length) {
      // A new cluster is stored as a list and added to this.clusters
      // The array contains [start_a, end_a, start_b, end_b, length]
      this.clusters.push([
        this.pos_a,              // Start in text A
        this.pos_a + cluster_length, // End in text A
        pos_b,                   // Start in text B
        pos_b + cluster_length,      // End in text B
        cluster_length           // Length of the cluster
      ]);
    }
  
    /**
     * Selects the cluster in text B with the greatest length from the cluster list
     * and stores it as the final cluster.
     */
    pickFinalCluster() {
      if (this.clusters.length > 0) {
        // Uses the JavaScript equivalent of max() with a key for the length
        this.final_cluster = this.clusters.reduce((max, current) => 
          current[4] > max[4] ? current : max, 
          this.clusters[0]
        );
      }
    }
  }