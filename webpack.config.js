const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const widgetConfig = {
    entry: "./src/PullToRefresh/widget/PullToRefresh.ts",
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: "src/PullToRefresh/widget/PullToRefresh.js",
        libraryTarget: "amd"
    },
    resolve: {
        extensions: [ ".ts" ]
    },
    module: {
        rules: [
            { test: /\.ts$/, use: "ts-loader" },
            { test: /\.css$/, loader: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: "css-loader"
            }) },
            { test: /\.(png|jpeg)$/, loader: "url-loader", options: { limit: 8192 } }
        ]
    },
    devtool: "source-map",
    externals: [ "react", "react-dom", /^mxui\/|^mendix\/|^dojo\/|^dijit\// ],
    plugins: [
        new CopyWebpackPlugin([
            { from: "src/**/*.xml" },
            { from: "src/**/*.png" },
            { from: "assets/Preview.png", to: "src/PullToRefresh/widget/Preview.png"}
        ], {
            copyUnmodified: true
        }),
        new ExtractTextPlugin({
            filename: "./src/PullToRefresh/widget/ui/PullToRefresh.css" }),
            new webpack.LoaderOptionsPlugin({
                debug: true
            })
    ]
};

const previewConfig = {
    entry: "./src/PullToRefresh/widget/PullToRefresh.webmodeler.ts",
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: "src/PullToRefresh/widget/PullToRefresh.webmodeler.js",
        libraryTarget: "commonjs"
    },
    resolve: {
        extensions: [ ".ts" ]
    },
    module: {
        rules: [
            { test: /\.ts$/, use: "ts-loader" },
            { test: /\.css$/, loader: "raw-loader" },
            { test: /\.(png|jpeg)$/, loader: "url-loader", options: { limit: 8192 } }
        ]
    },
    devtool: "inline-source-map",
    externals: [ "react", "react-dom" ],
    plugins: [
        new webpack.LoaderOptionsPlugin({ debug: true })
    ]
};

module.exports = [ widgetConfig, previewConfig ];
