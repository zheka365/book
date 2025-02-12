const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); 
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); 

module.exports = {
  mode: 'development', // production
  entry: './src/index.js', 
  output: {
    filename: 'bundle.js', 
    path: path.resolve(__dirname, 'dist'),
    clean: true, 
    assetModuleFilename: 'images/[hash][ext][query]' 
  },
  devtool: 'inline-source-map', 
  devServer: {
    static: './dist', 
    hot: true, 
  },
  module: {
    rules: [
      {
        test: /\.scss$/i,
        use: [
          
          MiniCssExtractPlugin.loader, 
          'css-loader', 
          'postcss-loader', 
          'sass-loader', 
        ],
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader, 
          'css-loader', 
          'postcss-loader', 
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource', 
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource', 
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader', 
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ 
      template: './src/index.html',
      filename: 'index.html', 
    }),
    new MiniCssExtractPlugin({ 
      filename: '[name].[contenthash].css', 
      chunkFilename: '[id].[contenthash].css', 
    }),
  ],
};