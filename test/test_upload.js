const fs = require('fs');
const path = require('path');

const ValidateDuplicates = require('../utility/handlers/ImportEmployees/ValidateDuplicates');

const data = fs.readFileSync(path.resolve(__dirname, './test_duplicate_values.csv'), 'utf8');

(async () => {
	await ValidateDuplicates(data);
})();

