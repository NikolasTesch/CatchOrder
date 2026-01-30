import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import 'webpack-dev-server';

const config: webpack.Configuration = {
  mode: 'development',
  entry: () => {
    const entries: { [key: string]: string } = {};

    // Global styles entry
    entries['global'] = path.resolve(__dirname, 'src/frontend/styles/index.js');

    const pagesDir = path.resolve(__dirname, 'src/frontend/pages');
    const pages = fs.readdirSync(pagesDir, { withFileTypes: true });

    pages.forEach((dirent) => {
      if (dirent.isDirectory()) {
        const pagePath = path.join(pagesDir, dirent.name);
        const files = fs.readdirSync(pagePath);
        // Busca por .ts primeiro
        const entryFile = files.find(file => file.endsWith('.ts')) || files.find(file => file.endsWith('.js'));

        if (entryFile) {
          entries[dirent.name] = path.join(pagePath, entryFile);
        }
      }
    });
    return entries;
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: '[name].bundle.js',
    publicPath: '../',
    clean: true,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '../css/[name].css', // Output to public/css/[name].css
    }),
    ...(() => {
      const plugins: HtmlWebpackPlugin[] = [];
      const pagesDir = path.resolve(__dirname, 'src/frontend/pages');

      if (fs.existsSync(pagesDir)) {
        const pages = fs.readdirSync(pagesDir, { withFileTypes: true });
        pages.forEach((dirent) => {
          if (dirent.isDirectory()) {
            const pagePath = path.join(pagesDir, dirent.name);
            const files = fs.readdirSync(pagePath);
            const htmlFile = files.find(file => file.endsWith('.html'));

            if (htmlFile) {
              plugins.push(
                new HtmlWebpackPlugin({
                  template: path.join(pagePath, htmlFile),
                  filename: `../../public/pages/${htmlFile}`, // Output to public root
                  chunks: ['global', dirent.name], // Inject global styles and this page's bundle
                })
              );
            }
          }
        });
      }
      return plugins;
    })(),
  ],
};

export default config;