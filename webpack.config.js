const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // Der Einstiegspunkt unserer Anwendung
  entry: './src/index.js',
  
  // Ausgabepfad für die gebündelte Anwendung
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  
  // Regeln für das Laden verschiedener Dateitypen
  module: {
    rules: [
      // JavaScript und JSX-Dateien mit Babel transpilieren
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      // CSS-Dateien laden
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      // Bilder und andere Dateien laden
      {
        test: /\.(png|svg|jpg|gif|ico)$/,
        use: ['file-loader']
      }
    ]
  },
  
  // Resolve-Einstellungen, damit wir Dateien ohne Endungen importieren können
  resolve: {
    extensions: ['.js', '.jsx']
  },
  
  // Der Dev-Server für die Entwicklung
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
  
  // Plugins für zusätzliche Funktionalität
  plugins: [
    // Generiert HTML mit dem gebündelten JavaScript
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    })
  ]
};