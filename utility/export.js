const createCsvWriter 	= require('csv-writer').createObjectCsvWriter;
const fs 			 	= require('fs');
const childProc 		= require('child_process')
const path 				= require('path');
const PdfPrinter 		= require('pdfmake');

// path to csv file ---- static public files
const downloadPath = path.join(__dirname, '/../downloadables');


const csvWriter = createCsvWriter({
	path: './downloadables/employee-logs.csv',
	header: [
		{ id: 'employee'	, title: 'EMPLOYEE'},
		{ id: 'in'			, title: 'CLOCK-IN'},
		{ id: 'out'			, title: 'CLOCK-OUT' },
		{ id: 'emotionIn'	, title: 'EMOTION-IN' },
		{ id: 'emotionOut'	, title: 'EMOTION-OUT' },
		{ id: 'dateCreated'	, title: 'DATE' },
		]
});


exports.toCsv = async (data) => {
	
	try{
		if (fs.existsSync(downloadPath + `\\employee-logs.csv`)) {
				childProc.execSync(`del /f employee-logs.csv`, {
					cwd: downloadPath
				})

				await csvWriter.writeRecords(data);
				return { value : false };
			} else {
				await csvWriter.writeRecords(data);

				return { value : false };
			}
	} catch (err) {
		console.log(err);
		return { value : true, message : err.message };
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


// exports.toPdf = () => {

// 	const fonts = {

// 		Helvetica: {
// 			normal: 'Helvetica',
// 			bold: 'Helvetica-Bold',
// 			italics: 'Helvetica-Oblique',
// 			bolditalics: 'Helvetica-BoldOblique'
// 		}
// 	}

// const printer = new PdfPrinter(fonts);

// 	var docDefinition = {
// 		content: [{

// 		table: {
// 			// headers are automatically repeated if the table spans over multiple pages
// 			// you can declare how many rows should be treated as headers
// 			headerRows: 1,
// 			widths: [ '*', 'auto', 100, '*' ],

// 			body: [
// 			  [ 'First', 'Second', 'Third', 'The last one' ],
// 			  [ 'Value 1', 'Value 2', 'Value 3', 'Value 4' ],
// 			  [ { text: 'Bold value', bold: true }, 'Val 2', 'Val 3', 'Val 4' ]
// 			]
// 		  }	
// 	}],
// 		defaultStyle: {
// 		font: 'Helvetica'
// 		}
// 	};

//   var options = {
// 	// ...
//   }

//   var pdfDoc = printer.createPdfKitDocument(docDefinition, options);
//   pdfDoc.pipe(fs.createWriteStream(downloadPath + '\\document.pdf'));





//   pdfDoc.end();

// } 