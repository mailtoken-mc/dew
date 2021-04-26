const webpack = require("webpack");
const {VueLoaderPlugin} = require("vue-loader")
const path = require("path");

module.exports = {
    mode: "development",
    watch: true,
    entry: {
        register: "./src/client/register.js",
        recover: "./src/client/recover.js",
        reset: "./src/client/reset.js"
    },
    resolve: {
        alias: {
            "vue": "vue/dist/vue.esm-bundler.js"
        },
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: "vue-loader"
            },
            {
                test: /\.pug$/,
                loader: "pug-plain-loader"
            },
            {
                test: /\.css$/,
                use: [
                    "vue-style-loader",
                    "css-loader"
                ]
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            __VUE_OPTIONS_API__: true,
            __VUE_PROD_DEVTOOLS__: true
        }),
        new VueLoaderPlugin()
    ],
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
    }
};