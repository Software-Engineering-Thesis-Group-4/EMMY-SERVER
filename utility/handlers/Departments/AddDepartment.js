const { Settings } = require("../../../db/models/Settings");
const initializeSettings = require('../../database/InitializeDefaultSettings');


async function addOneDepartment(department) {
	await initializeSettings();

	const departmentsSettings = await Settings.findOne({
		$and: [
			{ category: "EMPLOYEES" },
			{ key: "Departments" },
		]
	});

	let departmentList = departmentsSettings.state;

	if(departmentList.find(value => value === department)) {
		const error = new Error('Department already exists');
		error.name = "DuplicateDepartmentError";
		throw error;
	}

	departmentList.push(department.toUpperCase());

	await departmentsSettings.updateOne({ state: departmentList });

	return department.toUpperCase();
}

module.exports = addOneDepartment