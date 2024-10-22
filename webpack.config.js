const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    main: './src/main.ts',
    renderer: './src/renderer.ts'
  },
  target: 'electron-main',
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: /src/,
        use: [{ loader: 'ts-loader' }]
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  node: {
    __dirname: false
  }
};
