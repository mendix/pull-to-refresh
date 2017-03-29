const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: "./src/PullToRefresh/widget/PullToRefresh.ts",
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: "src/PullToRefresh/widget/PullToRefresh.js",
        libraryTarget: "umd"
    },
    resolve: {
        extensions: [ "", ".ts", ".js", ".json" ]
    },
    errorDetails: true,
    module: {
        loaders: [
            { test: /\.ts$/, loader: "ts-loader" },
            { test: /\.json$/, loader: "json" },
            { test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader") }
        ]
    },
    devtool: "source-map",
    externals: [
        "mxui/widget/_WidgetBase", "dojo/_base/declare", "dojo/dom-construct", "dojo/dom", "dojo/dom-class",
        "dojo/dom-style" ],
    plugins: [
        new CopyWebpackPlugin([
            { from: "src/**/*.js" },
            { from: "src/**/*.xml" }
        ], {
            copyUnmodified: true
        }),
        new ExtractTextPlugin("./src/PullToRefresh/widget/ui/PullToRefresh.css")
    ],
    watch: true
};
