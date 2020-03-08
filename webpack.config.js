const path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/app/index.js",
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "3DuF.js"
    },
    devServer: {
        contentBase: path.join(__dirname, "public"),
        port:8080,
        compress: true,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }
        ]
    },
};