
// NPM Transform Stream
const Transform = require('stream').Transform;
const LinerStream = require('./LinerStream');
const fs = require('fs');

// FileFormat

class FileFormat extends Transform {

  constructor(name, columns) {

    super({
      objectMode : true
    });

    this.name = name;
    this.columns = columns;

  }

  parseFile(fileName, date){

    fs.createReadStream('./data/' + fileName, { encoding : 'UTF-8' })
      .pipe(new LinerStream())
      .pipe(this);

  }

  _transform(line, encoding, done) {

    var result = {};
    var index = 0;

    this.columns.forEach((column) => {

      result[column['column name']] = this['parse' + column.datatype](line.substring(index, index + column.width));
      index += column.width;

    });

    this.push({
      tableName : this.name,
      record : result
    });

    done();

  }

  parseTEXT(item){
    return item;
  }

  parseBOOLEAN(item){
    return Boolean(item);
  }

  parseINTEGER(item){
    return parseInt(item);
  }

}

module.exports = FileFormat;
