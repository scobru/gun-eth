const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'gun-eth.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'GunEth',
    libraryTarget: 'umd',
    globalObject: 'this',
    environment: {
      arrowFunction: false,
      const: false,
      destructuring: false,
      forOf: false
    }
  },
  externals: {
    'gun': 'Gun',
    'gun/sea': 'SEA',
    'ethers': 'ethers',
    'rxjs': 'rxjs',
    'dompurify': 'DOMPurify'
  },
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_fnames: /createAuthenticationModule|createCertificatesModule|createFriendsModule|createMessagingModule|createGroupMessagingModule|createNotesModule|createPostsModule/,
        },
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
