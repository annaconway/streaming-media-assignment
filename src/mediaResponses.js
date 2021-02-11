const fs = require('fs');
const path = require('path');

const loadFile = (request, response, fileName, format) => {
  // Creating a file object
  const file = path.resolve(__dirname, fileName);

  // Provide statistics about the file w/ error handling
  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        response.writeHead(404);
      }
      return response.end(err);
    }

    // Did the client send us a range header?
    let { range } = request.headers;
    if (!range) {
      range = 'bytes=0-';
    }

    // Grab the byte string
    const positions = range.replace(/bytes=/, '').split('-');

    // Establish the starting range of the stream
    let start = parseInt(positions[0], 10);

    // Grab the total file size
    const total = stats.size;

    // Establish the ending range of the stream
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

    // Start should be before end
    if (start > end) {
      start = end - 1;
    }

    // How big is the chunk range?
    const chunksize = (end - start) + 1;

    // Communicate to the browser
    response.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': format,
    });

    // Creating a file stream using the file object and the start and end ranges
    const stream = fs.createReadStream(file, { start, end });

    // When the file is open, connect the stream to our response.
    stream.on('open', () => {
      stream.pipe(response);
    });

    // End response on an error and stop listening for bytes
    stream.on('error', (streamErr) => {
      response.end(streamErr);
    });

    return stream;
  });
};

const getParty = (request, response) => {
  loadFile(request, response, '../client/party.mp4', 'video/mp4');
};

const getBling = (request, response) => {
  loadFile(request, response, '../client/bling.mp3', 'audio/mpeg');
};

const getBird = (request, response) => {
  loadFile(request, response, '../client/bird.mp4', 'video/mp4');
};

module.exports.getParty = getParty;
module.exports.getBling = getBling;
module.exports.getBird = getBird;
