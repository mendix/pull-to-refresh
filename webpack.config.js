const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const widgetConfig = {
    entry: "./src/PullToRefresh/widget/PullToRefresh.ts",
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: "src/PullToRefresh/widget/PullToRefresh.js",
        libraryTarget: "umd"
    },
    resolve: {
        extensions: [ ".ts", ".js", ".json" ]
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
    externals: [
        "react",
        "react-dom",
        "mxui/widget/_WidgetBase",
        "dojo/_base/declare",
        "dojo/dom-construct",
        "dojo/dom",
        "dojo/dom-class",
        "dojo/dom-style"
    ],
    plugins: [
        new CopyWebpackPlugin([
            { from: "src/**/*.js" },
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
        extensions: [ ".ts", ".js" ]
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
