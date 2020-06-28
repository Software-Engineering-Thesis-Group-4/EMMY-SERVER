
const validateDuplicates = (rows) => {

	const requiredUniqueFields = ['EMPLOYEE_ID', 'FINGERPRINT_ID', 'EMAIL'];
	const duplicates = {};

	requiredUniqueFields.forEach((fieldName) => {
		duplicates[fieldName] = [...filterDuplicates(rows, fieldName)];
	});

	if (duplicates.EMPLOYEE_ID.length || duplicates.FINGERPRINT_ID.length || duplicates.EMAIL.length) {
		const error = new Error('Invalid Format. Duplicate values found for unique fields.')
		error.name = "DuplicateValidationError";
		error.duplicate_fields = duplicates;
		throw error;
	}
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