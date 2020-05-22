const createCsvWriter 	= require('csv-writer').createObjectCsvWriter;
const fs 			 	= require('fs');
const childProc 		= require('child_process')
const path 				= require('path');
const PdfPrinter 		= require('pdfmake');

// path to csv file ---- static public files
const downloadPath = path.join(__dirname, '/../downloadables');


// TODO EDIT : MAKE IT FOR EMPLOYEE LOGS 
const csvWriter = createCsvWriter({
	path: './downloadables/generated.csv',
	header: [
		{ id: 'employeeId'			, title: 'EMPLOYEE_ID'},
		{ id: 'firstName'			, title: 'FIRSTNAME' },
		{ id: 'lastName'			, title: 'LASTNAME' },
		{ id: 'email'				, title: 'EMAIL' },
		{ id: 'isMale'				, title: 'GENDER' },
		{ id: 'employmentStatus'	, title: 'EMPLOYMENT_STATUS' },
		{ id: 'department'			, title: 'DEPARTMENT' },
		{ id: 'jobTitle'			, title: 'JOB_TITLE' },
		{ id: 'photo'				, title: 'PHOT' },
		{ id: 'fingerprintId'		, title: 'FINGERPRINT_ID' },
		{ id: 'terminated'			, title: 'TERMINATED' },
		{ id: 'latestLog'			, title: 'LATEST_LOG' }
	]
});

exports.toCsv = async (data) => {

	try{
		if (fs.existsSync(downloadPath + '\\generated.csv')) {
				childProc.execSync('del /f generated.csv', {
					cwd: downloadPath
				})

				await csvWriter.writeRecords(data);

				return true;
			} else {
				await csvWriter.writeRecords(data);

				return true;;
			}
	} catch (err) {
		console.log(err);
		return false;
	}
}

// Define font files
// var fonts = {
// 	Roboto: {
// 	//   normal: 'fonts/Roboto-Regular.ttf',
// 	//   bold: 'fonts/Roboto-Medium.ttf',
// 	//   italics: 'fonts/Roboto-Italic.ttf',
// 	//   bolditalics: 'fonts/Roboto-MediumItalic.ttf'
// 		normal: null,
// 		bold: null,
// 		italics: null,
// 		bolditalics: null
// 	}
//   };
  

exports.toPdf = () => {

	const fonts = {
		
		Helvetica: {
			normal: 'Helvetica',
			bold: 'Helvetica-Bold',
			italics: 'Helvetica-Oblique',
			bolditalics: 'Helvetica-BoldOblique'
		}
	}
	
const printer = new PdfPrinter(fonts);
  
	var docDefinition = {
		content: [{
		
		table: {
			// headers are automatically repeated if the table spans over multiple pages
			// you can declare how many rows should be treated as headers
			headerRows: 1,
			widths: [ '*', 'auto', 100, '*' ],
	
			body: [
			  [ 'First', 'Second', 'Third', 'The last one' ],
			  [ 'Value 1', 'Value 2', 'Value 3', 'Value 4' ],
			  [ { text: 'Bold value', bold: true }, 'Val 2', 'Val 3', 'Val 4' ]
			]
		  }	
	}],
		defaultStyle: {
		font: 'Helvetica'
		}
	};
  
  var options = {
	// ...
  }
  
  var pdfDoc = printer.createPdfKitDocument(docDefinition, options);
  pdfDoc.pipe(fs.createWriteStream(downloadPath + '\\document.pdf'));

  



  pdfDoc.end();

}