const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.limit = options.limit;
  }

  _transform(chunk, encoding, callback) {
    this.limit -= chunk.byteLength;

    this.limit >= 0 ? callback(null, chunk) : callback(new LimitExceededError(), null);
  }
}

module.exports = LimitSizeStream;
