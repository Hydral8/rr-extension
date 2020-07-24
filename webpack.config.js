const path = require("path");
module.exports = {
  entry: {
      popup: "./popup.js",
      background: "./background.js",
      signin: "./signin.js"
  },
  devtool: "inline-source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
};
