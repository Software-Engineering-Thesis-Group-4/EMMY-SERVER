const { AuditLog } = require('../db/models/AuditLog');
const { Employee } = require('../db/models/Employee');
const { EmployeeLog } = require('../db/models/EmployeeLog');
const { EmployeeDataNotification } = require('../db/models/EmployeeDataNotif');
const { EmotionNotification } = require('../db/models/EmotionNotification')
const { RefreshToken } = require('../db/models/RefreshToken');
const { User } = require('../db/models/User');

const modelPicker = (modelName) => {


	switch (modelName.toLowerCase()) {

		case "auditlog":
			return importModel = AuditLog;

		case "employee":
			return importModel = Employee;

		case "employeelog":
			return importModel = EmployeeLog;

		case "refreshtoken":
			return importModel = RefreshToken;

		case "emotionnotification":
			return importModel = EmotionNotification;

		case "employeedatanotification":
			return importModel = EmployeeDataNotification;

		case "user":
			return importModel = User;
	}
}

/*/----------------------------------------------------------------------------------------------

    save()
    findOne()
    findAll()
    findById()
    updateById()
    findAllPopulate()

----------------------------------------------------------------------------------------------/*/


exports.findById = async (model, _id) => {

	try {

		const Model = modelPicker(model);



		const modeling = await Model.findById(_id);

		if (!modeling) {
			return isErr = { value: true, message: `Cant find document in ${Model.modelName} collection`, statusCode: 204 };
		}

		return isErr = { value: false, output: modeling };

	} catch (err) {
		console.log(err.message)
		return isErr = { value: true, message: err.message, statusCode: 500 };
	}
}


exports.updateById = async (model, id, data) => {

	try {

        const Model = modelPicker(model);
        
        const updatedModeling = await Model.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true }
        );

        if(!updatedModeling){
            return isErr = { value : true, message : `Error updating a document in ${Model.modelName} collection`, statusCode : 204 };
        }

		return isErr = { value: false, output: updatedModeling }


	} catch (err) {
		return isErr = { value: true, message: err.message, statusCode: 500 };
	}
}


exports.save = async (model, data) => {

	try {

        const Model = modelPicker(model);
       
        const modeling = new Model(data);


		const savedModeling = await modeling.save();

        if(!savedModeling){
            return isErr = { value : true, message : `Error saving document for ${Model.modelName}`, statusCode : 204 };
        }

		return isErr = { value: false, output: savedModeling };

	} catch (err) {
		console.log(err.message)
		return isErr = { value: true, message: err.message, statusCode: 500 };
	}
}

exports.findOne = async (model, field, options) => {


	try {

		Model = modelPicker(model);

		const modelings = await Model.findOne(field, options);

		if (!modelings) {
			return isErr = { value: true, message: `Cant find document in ${Model.modelName} collection`, statusCode: 204 };
		}

		return isErr = { value: false, output: modelings };

	} catch (err) {
		console.log(err)
		return isErr = { value: true, message: err.message, statusCode: 500 };
	}
}


exports.findAll = async (model, field, options) => {

	try {

		Model = modelPicker(model);

		const modelings = await Model.find(field, options);

		if (modelings.length) {
			return isErr = { value: false, output: modelings };
		}

		return isErr = { value: true, message: `${Model.modelName} is empty`, statusCode: 204 };

	} catch (err) {
		return isErr = { value: true, message: err.message, statusCode: 500 };
	}
}

exports.findAllPopulate = async (Model, field, populateOptions) => {

	try {

		Model = modelPicker(Model);

		const modelings = await Model.find(field).populate(populateOptions);

		if (modelings.length) {
			return isErr = { value: false, output: modelings };
		}

		return isErr = { value: false, message: `${Model.modelName} is empty`, statusCode: 204 };

    } catch (err) {
        return isErr = { value : true, message : err.message, statusCode : 500 };
    }
}

