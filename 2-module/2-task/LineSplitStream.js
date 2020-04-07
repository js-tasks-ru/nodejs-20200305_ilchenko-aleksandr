const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);

    this._stack = '';
  }

  _transform(chunk, encoding, callback) {
    this._stack += chunk.toString();

    callback();
  }

  _flush(callback) {
    const that = this;

    this._stack.split(os.EOL).forEach((line) => {
      that.push(line);
    });

    callback();
  }
}

module.exports = LineSplitStream;
