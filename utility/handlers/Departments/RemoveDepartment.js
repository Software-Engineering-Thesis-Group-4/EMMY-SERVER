const { Settings } = require("../../../db/models/Settings");
const initializeSettings = require('../../database/InitializeDefaultSettings');

async function removeOneDepartment(department) {
	await initializeSettings();

	const departmentsSettings = await Settings.findOne({
		$and: [
			{ category: "EMPLOYEES" },
			{ key: "Departments" },
		]
	});

	let departmentList = departmentsSettings.state;

	if(!departmentList.find(value => value === department)) {
		const error = new Error('Department does not exist.');
		error.name = "DepartmentNotFound";
		throw error;
	}

	const newDepartmentlist = departmentList.filter(item => item !== department.toUpperCase());
	await departmentsSettings.updateOne({ state: newDepartmentlist });

	return department.toUpperCase();
}

module.exports = removeOneDepartment;