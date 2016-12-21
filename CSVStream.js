
// NPM Transform Stream
const Transform = require('stream').Transform;


// Parses lines

class CSVStream extends Transform {

  constructor() {

    super({
      objectMode : true
    });

  }

  _transform(chunk, encoding, done) {

    if(this.columnNames === undefined){

      this.columnNames = chunk.split(',')
        .map(this.removeQuotes);

    }else{

      var result = {};

      chunk.split(',')
        .map(this.removeQuotes)
        .forEach((item, index) => {
          result[this.columnNames[index]] = item;
        });

      this.push(result);

    }

    done();

  }

  removeQuotes(item){

    try{
      return JSON.parse(item);
    }catch(e){}

    return item;

  }

}

module.exports = CSVStream;
