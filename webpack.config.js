const webpack = require('webpack');
const path = require('path');
const lib = require('./package');

/*
 |--------------------------------------------------------------------------
 | Library Banner
 |--------------------------------------------------------------------------
 */

const banner = `${lib.name} ${lib.version} - ${lib.description}\nCopyright (c) ${ new Date().getFullYear() } ${lib.author}\nHomepage: ${lib.homepage}\nLicense: ${lib.license}`;

/*
 |--------------------------------------------------------------------------
 | Env
 |--------------------------------------------------------------------------
 */

const ENV = process.env.NODE_ENV || 'development',
      inProduction = ENV === 'production';

/*
 |--------------------------------------------------------------------------
 | Webpack Config
 |--------------------------------------------------------------------------
 */

let config = {

    devtool: inProduction ? 'source-map' : 'cheap-module-source-map',

    context: path.resolve(__dirname, 'src'),

    entry: './Kit.js',

    target: 'web',

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: inProduction ? `${lib.name}.min.js` : `${lib.name}.js`,
        library: 'fbKit',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },

    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                    plugins: ['transform-runtime'],
                    presets: [
                        ['es2015', { 'modules': false }]
                    ]
                }
            }
        ]
    },

    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: inProduction
        })
    ],


    stats: {
        hash: false,
        version: false,
        timings: false,
        children: false
    },

    performance: {
        hints: false
    }
}

/*
 |--------------------------------------------------------------------------
 | Webpack Production Config
 |--------------------------------------------------------------------------
 */

if(inProduction) {
    config.plugins = config.plugins.concat([

        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),

        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,

            beautify: false, //prod
            output: {
              comments: false
            }, //prod
            mangle: {
              screw_ie8: true
            }, //prod
            compress: {
              warnings: false,

              screw_ie8: true,
              conditionals: true,
              unused: true,
              comparisons: true,
              sequences: true,
              dead_code: true,
              evaluate: true,
              if_return: true,
              join_vars: true,
              properties: true,
              cascade: true,
              collapse_vars: true,
              reduce_vars: true,
            },
        }),

        new webpack.BannerPlugin(banner)
    ]);
}

module.exports = config
