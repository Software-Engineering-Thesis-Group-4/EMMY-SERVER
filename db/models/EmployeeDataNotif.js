const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EmployeeDataNotifSchema = new Schema({ // Employee CRUD Notif
	dateCreated: Date,
	author: {
		//admin user reference
		type: Schema.Types.ObjectId,
		ref: "User",
		autopopulate: true
	},
	employee: {
		type: Schema.Types.ObjectId,
		ref: "Employee",
		autopopulate: true
	},
	operation: {
		type: String,
	}
});

EmployeeDataNotifSchema.plugin(require('mongoose-autopopulate'));

const EmployeeDataNotification = mongoose.model("EmployeeDataNotifLog", EmployeeDataNotifSchema);

module.exports = {
	EmployeeDataNotifSchema,
	EmployeeDataNotification,
};
