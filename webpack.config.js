const {VueLoaderPlugin} = require('vue-loader')
const path = require('path');

module.exports = {
    mode: 'development',
    watch: true,
    entry: './src/client/components.js',
    resolve: {
        alias: {
            vue: 'vue/dist/vue.js'
        },
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: "vue-loader"
            },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ],
    output: {
        filename: 'components.js',
        path: path.resolve(__dirname, 'dist'),
    }
};