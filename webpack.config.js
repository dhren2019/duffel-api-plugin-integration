const path = require('path');

module.exports = {
  entry: './src/index.js', // El punto de entrada principal para React
  output: {
    filename: 'duffel-react-bundle.js', // El archivo de salida que se cargará en WordPress
    path: path.resolve(__dirname, 'includes/js') // La carpeta donde se guarda el archivo compilado
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Asegura la compatibilidad con versiones más antiguas de JavaScript
          options: {
            presets: ['@babel/preset-react']
          }
        }
      }
    ]
  }
};
