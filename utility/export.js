const createCsvWriter 	= require('csv-writer').createObjectCsvWriter;
const fs 			 	= require('fs');
const childProc 		= require('child_process')
const path 				= require('path');
const PdfPrinter 		= require('pdfmake');

// path to csv file ---- static public files
const downloadPath = path.join(__dirname, '/../downloadables');


exports.emotionPicker = (emo) =>{

	switch(emo){
		case 0:
			return 'Unsubmitted';
		case 1:
			return 'Angry';
		case 2:
			return 'Sad';
		case 3:
			return 'Ok';
		case 4:
			return 'Happy';
		case 5:
			return 'Amazing';
		
		default:
			return undefined;

	}
}




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


exports.toPdf = (data,startDate,endDate) => {

	
	try{

		let arrEmp = [];

			arrEmp.push([{text : 'EMPLOYEE', bold: true},
				{text : 'CLOCK-IN', bold: true},
				{text : 'CLOCK-OUT', bold: true},
				{text : 'EMOTION-IN', bold: true},
				{text : 'EMOTION-OUT', bold: true},
				{text : 'DATE', bold: true}
		])
		
		data.forEach(element => {
			arrEmp.push([element.employee,
				element.in,
				element.out,
				this.emotionPicker(element.emotionIn),
				this.emotionPicker(element.emotionOut),
				element.dateCreated,
			])
		});


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
			content: [
				{
					image: process.env.EMMY_LOGO,
					width: 300,
					alignment: "center",
					margin :[ 0,0,20,30]
				},{
					text: `Here are the employee logs from ${startDate} to ${endDate}`, 
					fontSize: 15,
					margin :[ 0,0,20,20],
					alignment: "center"
				},
				{
					table: {
						headerRows: 1,
						widths: [ 'auto','auto','auto','auto','auto','auto'],

						body: arrEmp
					},alignment: "center"
						
			}],
				defaultStyle: {
				font: 'Helvetica'
				}
			};

	
		var pdfDoc = printer.createPdfKitDocument(docDefinition);
		
		pdfDoc.pipe(fs.createWriteStream(downloadPath + '\\employee-logs.pdf', { WritebleState : {sync : false}}));
		
		pdfDoc.end();

		
		return { value : false }
	} catch (err){
		console.log(err)
		return { value : true , message : err.message}
	}
} 