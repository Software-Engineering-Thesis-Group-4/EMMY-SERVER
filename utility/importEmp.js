const chunk         = require('chunk');
const replaceString = require('replace-string');

// import util and model
const { encrypt, decrypter } = require('./aes')
const { Employee } = require('../db/models/Employee');


const csvImport = async (csvFile) => {

	try {

		if (csvFile.name.substring(csvFile.name.length, csvFile.name.length - 3) != 'csv') {
			return isErr = { value: true, message: 'Invalid file format, must be csv file' };

		}
		
		const rawData = csvFile.data;
			
		// replace all \n and \r in csv file to coma
		const stringData 	= replaceString(rawData.toString(), ('\r\n'), ',');

		const removeLast 	= (stringData.substring(0, stringData.length -1))
		const arrData 		= removeLast.split(',');
		const finalData 	= chunk(arrData, [ 9 ]);
		

		const headerVal = 'EMPLOYEE_ID,FIRSTNAME,LASTNAME,EMAIL,'
						+ 'GENDER,EMPLOYMENT_STATUS,DEPARTMENT,JOB_TITLE,FINGERPRINT_ID';

		let x = 1;

		if(finalData[0].toString().trim().toUpperCase() == headerVal) {

			while(x < finalData.length){

				// const empId 		= encrypt(finalData[x][0]);
				// const firstName 	= encrypt(finalData[x][1]);
				// const lastName 		= encrypt(finalData[x][2]);
				// const email 		= encrypt(finalData[x][3]);
				// const fingerprintId = encrypt(parseInt(finalData[x][8]))
				const gender 		= finalData[x][4].toLowerCase() === 'm' ? true : false;
				const empStat 		= finalData[x][5].toLowerCase() === 'full-time' ? true : false;

				// TODO validate finalData[][] for csv
				// CSV Validation

				const newEmp = new Employee({
					employeeId		: finalData[x][0],
					firstName		: finalData[x][1],
					lastName		: finalData[x][2],
					email			: finalData[x][3],
					isMale			: gender,
					employmentStatus: empStat,
					department		: finalData[x][6],
					jobTitle		: finalData[x][7],
					fingerprintId	: finalData[x][8]

				})

				await newEmp.save();
				x++;
			}

			return isErr = { value : false, message : 'Successfully imported employees' };

		} else {
			console.log('invalid csv format');
			return isErr = { value : true, message : `invalid csv format must follow this header format \n`
														+ `${headerVal} (not case sensitive)` };
		}
	} catch (err) {
		
		console.log(err.message.red);

		if(err.code === 11000){
			return isErr = { 
				value 			: true, 
				message 		: `ERROR : Duplicate value for ${err.keyValue}`,
				duplicateValue	: err.keyValue
			};
		} else {
			return isErr = { 
				value 			: true, 
				message 		: err.message
			};
		}


	}
}


module.exports = {
	csvImport
}