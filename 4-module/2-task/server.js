const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  if (pathname.includes('/')) {
    res.statusCode = 400;
    res.end('Bad Request');

    return;
  }

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
      const file = fs.createWriteStream(filepath, {flags: 'wx'});
      const limitStream = new LimitSizeStream({limit: 1e6});

      file.on('error', (err) => {
        if (err.code === 'EEXIST') {
          res.statusCode = 409;
          res.end('Conflict: File Already Exists');
        }

        res.statusCode = 500;
        res.end('Internal Server Error');
      });

      limitStream.on('error', (err) => {
        if (err.code === 'LIMIT_EXCEEDED') {
          res.statusCode = 413;
          res.end('Payload Too Large');

          fs.unlink(filepath, () => {});
        }
      });

      req.pipe(limitStream).pipe(file);

      file.on('close', () => {
        res.statusCode = 201;
        res.end('saved');
      });

      req.on('aborted', () => {
        fs.unlink(filepath, () => {});
      });

      break;
    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
