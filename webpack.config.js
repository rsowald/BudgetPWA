const WebpackPwaManifest = require("webpack-pwa-manifest");
const path = require("path");

const config = {
    mode: "development",

    // add entry points for JavaScript files for the three pages, home, detail, and favorites.
    entry: "./public/index.js",

    output: {
        path: __dirname + "/public/dist",
        filename: "bundle.js"
    },
    plugins: [
        new WebpackPwaManifest({
            fingerprints: false,
            inject: false,
            name: "Ready Cash Budget App",
            short_name: "Budget App",
            description: "An application for tracking personal budget",
            background_color: "#01579b",
            theme_color: "#ffffff",
            start_url: "/",
            icons: [{
                src: path.resolve("public/images/icons/icon-192x192.png"),
                sizes: [192, 512],
                destination: path.join("assets", "icons")
            }]
        })
    ],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }
        ]
    }
};
module.exports = config;