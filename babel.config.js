// Babel-Konfiguration für die Umwandlung von JSX und modernem JavaScript
module.exports = {
    // Presets sind vordefinierte Konfigurationen für verschiedene Umgebungen
    presets: [
      // @babel/preset-env wandelt modernes JavaScript für ältere Browser um
      ["@babel/preset-env", {
        // Nur für Browser, die mehr als 0,25% Marktanteil haben
        targets: {
          browsers: "> 0.25%, not dead"
        },
        // Fügt nur die benötigten Polyfills hinzu
        useBuiltIns: "usage",
        corejs: 3
      }],
      // @babel/preset-react wandelt JSX in reguläres JavaScript um
      ["@babel/preset-react", {
        // Verwende die neue JSX-Transformation (performanter)
        runtime: "automatic"
      }]
    ]
  };