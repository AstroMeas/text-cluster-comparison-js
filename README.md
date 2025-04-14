# Text Cluster Comparison JS

A React-based web application for analyzing and visualizing textual similarities between two texts. This application identifies and displays clusters (similar passages) between texts, making it useful for comparing different editions, translations, or versions of documents.

## Disclaimer

**This JavaScript implementation was created entirely with Claude AI.** The entire codebase, from React components to core functionality, was generated through conversations with Claude AI as part of a code transformation project.

This is the JavaScript counterpart to the original Python-based [text-cluster-comparison](https://github.com/AstroMeas/text-cluster-comparison) tool. While the core functionality remains similar, the UI and implementation details are different, leveraging modern web technologies.

## Motivation

The initial idea for this project came from Kristin Mothes and Antje Ziemer, who needed to compare two editions of a Tibetan text in preparation for a research project. A script for detecting identical clusters in two texts was developed. When presented at a Tibetology conference in Oxford, the method garnered significant interest, encouraging its publication.

Texts from different languages and cultures often exist in various editions. This tool is designed to be applicable to texts in different languages and writing systems. This JavaScript implementation expands on the original Python project, offering a more accessible web-based interface without the need for Python installation.

## Features

- **Text Preprocessing**: Tokenization and custom separator configuration
- **Cluster Analysis**: Efficient identification of similar text sequences with adjustable minimum length
- **Multiple Visualizations**:
  - **Cluster Table**: Detailed view of all identified clusters
  - **Bubble Chart**: Visual representation of cluster positions and sizes
  - **Text Comparison**: Side-by-side comparison showing both unique and shared sections

Key improvements in the JavaScript version:
- Browser-based with no installation required
- Interactive React UI with real-time processing
- Enhanced data visualizations using Plotly.js
- Improved text comparison with color-coded sections
- Responsive design that works on desktop and mobile devices

## Installation

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

### Setup Instructions
Access the app via https://astromeas.github.io/text-cluster-comparison-js/
```bash
# Clone the repository
git clone https://github.com/AstroMeas/text-cluster-comparison-js.git
cd text-cluster-comparison-js

# Install dependencies
npm install

# Start the development server
npm start
```

The application will be available at http://localhost:3000 in your web browser.

### Building for Production

```bash
# Create optimized production build
npm run build

# The build folder can be deployed to any static hosting service
```

## Usage

1. **Input Texts**: Enter or paste the two texts you want to compare in the text areas.
2. **Configure Parameters**:
   - Set the minimum cluster length (default: 5)
   - Toggle case sensitivity with the "Text in Kleinbuchstaben umwandeln" option
   - Add or remove text separators as needed
3. **Analyze**: Click the "Cluster finden" button to generate the cluster analysis.
4. **Explore Visualizations**:
   - **Cluster-Tabelle**: View a detailed table of all identified clusters
   - **Bubble-Chart**: See a visual representation of cluster positions and sizes
   - **Textvergleich**: Examine a comprehensive comparison showing both unique (orange) and shared (green) text sections
5. **Download Results**: Use the download buttons to save your analysis results as CSV files.

## Project Structure

```
text-cluster-comparison-js/
├── public/                   # Static assets
│   ├── favicon.ico           # Favicon
│   └── index.html            # Main HTML file
├── src/                      # Source code
│   ├── components/           # React components
│   │   ├── charts/           # Chart components
│   │   │   ├── BubbleChart.js
│   │   │   └── ChartControls.js
│   │   ├── cluster_table/    # Cluster table component
│   │   ├── comparison_table/ # Text comparison component
│   │   └── App.js            # Main application component
│   ├── core/                 # Core functionality
│   │   ├── cluster.js        # Cluster class definition
│   │   ├── clusterSearch.js  # Cluster search algorithm
│   │   └── preprocessing.js  # Text preprocessing functions
│   ├── hooks/                # Custom React hooks
│   │   └── useClusterData.js # Hook for cluster data management
│   ├── services/             # Service functions
│   │   └── clusterService.js # Text comparison and data processing
│   ├── app.css               # Global styles
│   └── index.js              # Entry point
├── .gitignore                # Git ignore file
├── babel.config.js           # Babel configuration
├── package.json              # Project dependencies
└── webpack.config.js         # Webpack configuration
```

## Browser Compatibility

The application is compatible with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Rafael Deichsel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Contributing

Contributions to this project are welcome. Please feel free to submit issues or pull requests.

## Comparison with Python Version

While the Python version uses Dash for its web interface, this JavaScript version is built with React and modern frontend technologies. The core algorithms for finding and analyzing text clusters remain functionally equivalent, but the implementation details differ to leverage the strengths of each platform.

The JavaScript version offers:
- A more modern, responsive user interface
- Client-side processing (no Python backend required)
- Enhanced visualizations with React and Plotly.js
- Simplified deployment options (any static web hosting)

The Python version has advantages in:
- Processing very large texts (server-side processing)
- More advanced preprocessing options
- Integration with Python data science libraries
