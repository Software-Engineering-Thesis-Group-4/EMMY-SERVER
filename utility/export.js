const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs              = require('fs');
const childProc       = require('child_process')
const path            = require('path');


// path to csv file ---- static public files
const pathCsv = path.join(__dirname,'/../public');

const csvWriter = createCsvWriter({
  path  : './public/generated.csv',
  header: [
    {id: 'Fullname' , title: 'Fullname'},
    {id: 'Email'    , title: 'Email'},
    {id: 'Mobile'   , title: 'Mobile'},
    {id: 'City'     , title: 'City'}
  ]

});

const toCsv = (data) => {
        if (fs.existsSync(pathCsv + '\\generated.csv')){
          childProc.execSync('del /f generated.csv',{
            cwd: pathCsv
        })
        csvWriter.writeRecords(data)
            .then(()=> console.log('The CSV file was written successfully'))
            .catch(err => console.error(err));       
      } else {
            csvWriter.writeRecords(data)
                .then(()=> console.log('The CSV file was written successfully'))
                .catch(err => console.error(err));
      }
  }

module.exports = { 
  toCsv 
}