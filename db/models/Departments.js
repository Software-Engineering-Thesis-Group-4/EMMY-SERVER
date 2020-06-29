const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DepartmentSchema = new Schema({
	name: {
		type: String,
		unique: true,
		required: true
	}
});

const Department = mongoose.model('Department', DepartmentSchema);

module.exports = {
	Department,
	DepartmentSchema
}