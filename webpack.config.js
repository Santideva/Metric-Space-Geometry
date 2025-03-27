const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // Mode determines optimization and feature settings
  mode: 'development', // or 'production'

  // Entry point of your application
  entry: './src/index.js',

  // Output configuration
  output: {
    filename: 'bundle.js', // Bundled file name
    path: path.resolve(__dirname, 'dist'), // Output directory
    clean: true // Clean the dist folder before each build
  },

  // Development server configuration
  devServer: {
    static: './dist', // Serve from dist directory
    hot: true,        // Enable hot module replacement
    open: true,       // Automatically open browser
    port: 8080        // Port for development server
  },

  // Plugins extend webpack's capabilities
  plugins: [
    // Automatically generates an HTML file with bundled JS
    new HtmlWebpackPlugin({
      template: './src/index.html', // Use your HTML as a template
      filename: 'index.html'
    })
  ],

  // Module rules for different file types
  module: {
    rules: [
      // Babel loader for JavaScript
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', 
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      // Loaders for GLSL files (vertex/fragment shaders)
      {
        test: /\.(glsl|vs|fs)$/,
        exclude: /node_modules/,
        use: [
          'raw-loader',     // or 'raw-loader'
          'glslify-loader'  // or 'glsl-shader-loader'
        ]
      },
      // CSS loader (optional, but often useful)
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },

  // Source mapping for easier debugging
  devtool: 'source-map',

  // Optimization settings
  optimization: {
    usedExports: true, // Tree shaking
    minimize: false    // Minification (true for production)
  }
};
