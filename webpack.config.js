const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
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
            {
                test: /\.css$/,
                use: [ MiniCssExtractPlugin.loader, "css-loader" ]
            }
        ]
    },
    mode: "development",
    devtool: "source-map",
    externals: [
        "mxui/widget/_WidgetBase", "dojo/_base/declare", "dojo/dom-construct", "dojo/dom", "dojo/dom-class",
        "dojo/dom-style" ],
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: "src/**/*.xml" },
                { from: "assets/Preview.png", to: "src/PullToRefresh/widget/Preview.png"}
            ]
        }),
        new MiniCssExtractPlugin({
            filename: "./src/PullToRefresh/widget/ui/PullToRefresh.css",
            ignoreOrder: false
        })
    ]
};
