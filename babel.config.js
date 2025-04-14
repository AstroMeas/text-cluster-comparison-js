// Babel configuration for transforming JSX and modern JavaScript
module.exports = {
  // Presets are predefined configurations for different environments
  presets: [
    // @babel/preset-env transforms modern JavaScript for older browsers
    ["@babel/preset-env", {
      // Only for browsers that have more than 0.25% market share
      targets: {
        browsers: "> 0.25%, not dead"
      },
      // Only adds the required polyfills
      useBuiltIns: "usage",
      corejs: 3
    }],
    // @babel/preset-react transforms JSX into regular JavaScript
    ["@babel/preset-react", {
      // Use the new JSX transformation (more performant)
      runtime: "automatic"
    }]
  ]
};