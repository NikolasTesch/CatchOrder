import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import 'webpack-dev-server';

const config: webpack.Configuration = {
  mode: 'development',
  entry: './src/frontend/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    // Envia o bundle para a pasta public/js para ser servido pelo Express
    path: path.resolve(__dirname, 'public/js'),
    filename: 'bundle.js',
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/frontend/pages/index.html',
      filename: '../../public/index.html',
    }),
  ],
};

export default config;