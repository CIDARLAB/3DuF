module.exports = {
    transpileDependencies: ["vuetify"],
    configureWebpack: {
        devtool: "source-map"
    },
    devServer: {
        port: 8082,
        disableHostCheck: true,
        proxy: {
            '/api': { target: 'http://localhost:8080', changeOrigin: true },
            '/socket.io': { target: 'http://localhost:3000', ws: true }
        }
    }
};
