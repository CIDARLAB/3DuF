const path  = require("path");

module.exports = {
    mode: "development",
    entry: "./src/app/appSetup.js",
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
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
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