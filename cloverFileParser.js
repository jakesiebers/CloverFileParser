
const LinerStream = require('./LinerStream');
const CSVStream = require('./CSVStream');
const FileFormat = require('./FileFormat');
const mergeStream = require('merge-stream');

const fs = require('fs');
const promisify = require("es6-promisify");

// Get all our file formats
var getFileFormats = () => promisify(fs.readdir)('./specs')
  // Turn our spec files into fileformat classes
  .then((fileNames) => Promise.all(fileNames.map((fileName) => makeFileFormatFromFile(fileName))))
  .then((fileFormats) => {
    // Map our fileformats by name
    var namedFileFormats = {};
    fileFormats.forEach((fileFormat) => {
      namedFileFormats[fileFormat.name] = fileFormat;
    });
    return namedFileFormats;
  });

// Stream in a fileformat file and return a fileformat class
var makeFileFormatFromFile = (fileName) => {

  var p = Promise.defer();

  var columns = [];
  var name = fileName.split('.').slice(0, -1).join('.');

  fs.createReadStream('./specs/' + fileName, { encoding : 'UTF-8' })
    .pipe(new LinerStream())
    .pipe(new CSVStream())
    .on('data', (column) => {
      columns.push(column);
    })
    .on('end', () => {
      p.resolve(new FileFormat(name, columns));
    });

  return p.promise;

}

// Get all our data files
var getData = (fileFormats) => {

  var result = mergeStream();

  for(var name in fileFormats){
    result.add(fileFormats[name]);
  }

  promisify(fs.readdir)('./data')
    .then((fileNames) => fileNames.map((fileName) => {

      var name = fileName.split('.').slice(0, -1).join('.').split('_');

      var fileFormat = name.slice(0, -1).join('_');
      var date = new Date(name[name.length - 1]);

      fileFormats[fileFormat].parseFile(fileName, date);

    }));

  return result;

};

var parseFiles = () => {

  // Get all our spec files
  getFileFormats()
    .then(getData)
    .then((res) => {
      res.on('data', console.log)
    });

};

parseFiles()
