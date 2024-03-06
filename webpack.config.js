const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const envPaths = {
  development: './.env.development',
  production: './.env.production',
};

require('dotenv').config({ path: envPaths[process.env.NODE_ENV] });

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

const config = {
  entry: './src/index.tsx',
  ...(isDevelopment && {
    devtool: 'inline-source-map',
  }),
  mode: process.env.NODE_ENV,
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
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
  output: {
    filename: '[name].[contenthash].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  plugins: [
    isProduction &&
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
      }),
    new webpack.DefinePlugin({
      process: {
        env: {
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
