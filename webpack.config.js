var path = require('path');
var pathToPhaser = path.join(__dirname, '/node_modules/phaser/');
var phaser = path.join(pathToPhaser, 'dist/phaser.js');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');

const production = process.env.NODE_ENV === 'production';

module.exports = {
	mode: production ? 'production' : 'development',
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            { test: /\.ts$/, loader: 'ts-loader', exclude: '/node_modules/' },
            { test: /phaser\.js$/, loader: 'expose-loader?Phaser' },
            { test: /\.css$/, use: [ MiniCssExtractPlugin.loader, "css-loader" ] },
            //{ test: /\.json$/, loader: 'file-loader?name=[hash].[ext]' },
            { test: /\.ttf$/, loader: 'file-loader?name=[hash].[ext]' },
            { test: /\.png$/, loader: 'file-loader?name=[hash].[ext]' },
            { test: /\.jpg$/, loader: 'file-loader?name=[hash].[ext]' },
            { test: /\.svg$/, loader: 'file-loader?name=[hash].[ext]' },
            { test: /\.m4a$/, loader: 'file-loader?name=[hash].[ext]' },
            { test: /\.opus$/, loader: 'file-loader?name=[hash].[ext]' },
            { test: /\.mp3$/, loader: 'file-loader?name=[hash].[ext]' },
            { test: /\.wav$/, loader: 'file-loader?name=[hash].[ext]' },
            {
                type: 'javascript/auto',
                test: /\.json$/,
                use: [
                    {
                      loader: 'file-loader',
                      options: {
                          name: "./plugin-config/[name].[ext]"
                      }
                    }
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // both options are optional
          filename: "[name].css",
          chunkFilename: "[id].css"
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './index.template.html',
            hash: true,
            inject: true
        })
    ],
    devServer: {
        inline: true,
        host: '0.0.0.0'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            phaser: phaser
        }
    }
};