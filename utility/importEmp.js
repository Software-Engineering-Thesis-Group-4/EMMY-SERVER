const chunk         = require('chunk');

// import util and model
const { encrypt, decrypter } = require('./aes')
const { Employee } = require('../db/models/Employee');


const csvImport = async (stringData) => {

	try {

		const removeLast 	= (stringData.substring(0, stringData.length -1))
		const arrData 		= removeLast.split(',');
		const finalData 	= chunk(arrData, [ 9 ]);

		let errMessage = {};

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


			return errMessage = { isErr : false, message : 'Successfully imported employees' };
		} else {
			console.log('invalid csv format');
			return errMessage = { isErr : true, message : `invalid csv format must follow this header format \n`
														+ `${headerVal} (not case sensitive)` };
		}
	} catch (err) {
		
		console.log(err.message);
		
		if(err.code === 11000){
			return errMessage = { 
				isErr 			: true, 
				message 		: `ERROR : Duplicate value for ${err.keyValue}`,
				duplicateValue	: err.keyValue
			};
		} else {
			return errMessage = { 
				isErr 			: true, 
				message 		: 'Error importing employees, check if fields are correct and complete.'
			};
		}

		
	}
}


module.exports = {
	csvImport
}