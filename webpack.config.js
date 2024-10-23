const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const commonConfig = {
  entry: './src/core/index.js',
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

module.exports = [
  // ESM build
  {
    ...commonConfig,
    output: {
      filename: 'gun-eth.esm.js',
      path: path.resolve(__dirname, 'dist'),
      library: {
        type: 'module'
      }
    },
    experiments: {
      outputModule: true
    }
  },
  // React build
  {
    ...commonConfig,
    output: {
      filename: 'gun-eth.react.js',
      path: path.resolve(__dirname, 'dist'),
      library: {
        name: 'GunEth',
        type: 'umd'
      },
      globalObject: 'this'
    },
    externals: {
      ...commonConfig.externals,
      'react': 'React'
    }
  },
  // Node.js build
  {
    ...commonConfig,
    target: 'node',
    output: {
      filename: 'gun-eth.node.js',
      path: path.resolve(__dirname, 'dist'),
      library: {
        name: 'GunEth',
        type: 'umd'
      },
      globalObject: 'this'
    }
  },
  // Svelte build
  {
    ...commonConfig,
    output: {
      filename: 'gun-eth.svelte.js',
      path: path.resolve(__dirname, 'dist'),
      library: {
        name: 'GunEth',
        type: 'umd'
      },
      globalObject: 'this'
    },
    externals: {
      ...commonConfig.externals,
      'svelte': 'Svelte'
    }
  }
];
