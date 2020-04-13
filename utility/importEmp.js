const chunk         = require('chunk');

// import util and model
const { encrypt, decrypter } = require('./aes')
const { Employee } = require('../db/models/Employee');


const csvImport = async (stringData) => {


	const removeLast 	= (stringData.substring(0, stringData.length -1))
	const arrData 		= removeLast.split(',');
	const finalData 	= chunk(arrData, [ 9 ]);


	const headerVal = 'EMPLOYEE_ID,FIRSTNAME,LASTNAME,EMAIL,'
					+ 'GENDER,EMPLOYMENT_STATUS,DEPARTMENT,JOB_TITLE,FINGERPRINT_ID';
		
	let x = 1;
		
	if(finalData[0].toString().trim().toUpperCase() == headerVal) {

		while(x != finalData.length - 1){
			
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
		return true;
	} else {
		console.log('invalid csv format');
		return false;
	}
}


module.exports = {
	csvImport
}