const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  target: 'node', // Указываем, что проект предназначен для браузера
  entry: './src/index.js', // Точка входа
  output: {
    path: path.resolve(__dirname, 'dist'), // Папка для сборки
    filename: '[name].js', // Название выходного файла
    clean: true, // Очищает папку dist перед сборкой
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Обрабатываем JavaScript
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.html$/, // Обрабатываем HTML
        use: 'html-loader',
      },
      {
        test: /\.css$/, // Обрабатываем CSS
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i, // Обрабатываем изображения
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/index.html', // Шаблон HTML
      filename: 'index.html', // Выходной HTML
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
};
