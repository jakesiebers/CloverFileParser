
// NPM Transform Stream
const Transform = require('stream').Transform;


// Parses lines

class LinerStream extends Transform {

  constructor(delineators, columns) {

    super({
      objectMode : true
    });

    this.unendedLine = '';

  }

  _transform(chunk, encoding, done) {

    // Split unendedLine and incoming chunk into lines
    var lines = (this.unendedLine + chunk.toString(16)).split('\n');

    // Push all the completed lines
    lines.forEach((line, index) => {
      if(index < lines.length - 1) this.push(line);
    });

    // Store the last line as incomplete
    this.unendedLine = lines[lines.length - 1];

    done();

  }

  _flush(callback) {

    // Push the incompleted line if it is not empty
    if(this.unendedLine) this.pushLine(this.unendedLine);

    callback();

  }

}

module.exports = LinerStream;
