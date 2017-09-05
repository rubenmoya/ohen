const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    // export itself to a global var
    libraryTarget: "var",
    // name of the global var: "Foo"
    library: "Observable"
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    inline: true,
    port: 8080,
  },
}
