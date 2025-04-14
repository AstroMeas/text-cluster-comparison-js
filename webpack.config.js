const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // The entry point of our application
  entry: './src/index.js',
  
  // Output path for the bundled application
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/text-cluster-comparison-js/'
  },
  
  // Rules for loading different file types
  module: {
    rules: [
      // Transpile JavaScript and JSX files with Babel
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      // Load CSS files
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      // Load images and other files
      {
        test: /\.(png|svg|jpg|gif|ico)$/,
        use: ['file-loader']
      }
    ]
  },
  
  // Resolve settings, so we can import files without extensions
  resolve: {
    extensions: ['.js', '.jsx']
  },
  
  // The dev server for development
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
  
  // Plugins for additional functionality
  plugins: [
    // Generates HTML with the bundled JavaScript
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    })
  ]
};