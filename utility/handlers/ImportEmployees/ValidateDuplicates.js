
const validateDuplicates = async (rows) => {

	const requiredUniqueFields = ['EMPLOYEE_ID', 'FINGERPRINT_ID', 'EMAIL'];
	const duplicates = {};

	requiredUniqueFields.forEach((fieldName) => {
		duplicates[fieldName] = [...filterDuplicates(rows, fieldName)];
	});

	return duplicates;
}

const filterDuplicates = (array, fieldName) => {
	const duplicateValues = new Set();

	array.forEach((item, index, self) => {
		let duplicates = self.filter(value => {
			if (value[fieldName] === item[fieldName]) {
				return value;
			}
		});

		if (duplicates.length > 1) {
			duplicateValues.add(item[fieldName]);
		}
	});

	return duplicateValues;
}

module.exports = validateDuplicates;