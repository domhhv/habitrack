const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpackDevServer = require('webpack-dev-server');

const envPaths = {
  development: './.env.development',
  production: './.env.production',
};

require('dotenv').config({ path: envPaths[process.env.NODE_ENV] });

const config = {
  entry: ['react-hot-loader/patch', './src/index.tsx'],
  mode: process.env.NODE_ENV,
  devtool: 'inline-source-map',
  devServer: {
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    modules: [path.resolve(__dirname, './src'), 'node_modules'],
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@services': path.resolve(__dirname, './src/services'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@context': path.resolve(__dirname, './src/context'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@helpers': path.resolve(__dirname, './src/helpers'),
      '@models': path.resolve(__dirname, './src/models'),
    },
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      process: {
        env: {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
          SUPABASE_URL: JSON.stringify(process.env.SUPABASE_URL),
          SUPABASE_ANON_KEY: JSON.stringify(process.env.SUPABASE_ANON_KEY),
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './public/index.html'),
    }),
  ],
};

module.exports = config;
