const fs = require('fs');
const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const sass = require('node-sass');

const inputFile = path.resolve('carbon.scss');
const outputFile = path.resolve('src', 'carbon.css');

const result = sass.renderSync({
  file: inputFile,
  includePaths: [path.resolve('node_modules')],
  importer(url) {
    if (url.startsWith('~')) {
      return { file: path.resolve('node_modules', url.substr(1)) };
    }
    return { file: url };
  },
});

fs.writeFileSync(outputFile, result.css);
