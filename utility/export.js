const createCsvWriter 	= require('csv-writer').createObjectCsvWriter;
const fs 			 	= require('fs');
const childProc 		= require('child_process')
const path 				= require('path');

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
