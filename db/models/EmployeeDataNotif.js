const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EmployeeDataNotifSchema = Schema({ // Employee CRUD Notif
	dateCreated: Date,
	author: {
		//admin user reference
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	employee: {
		type: Schema.Types.ObjectId,
		ref: "Employee",
	},
	operation: {
		type: String,
	},
	seenBy: []
});

const EmployeeDataNotification = mongoose.model("EmployeeDataNotifLog", EmployeeDataNotifSchema);

module.exports = {
	EmployeeDataNotifSchema,
	EmployeeDataNotification,
};
