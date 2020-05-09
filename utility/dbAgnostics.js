
const modelPicker = (modelName) => {


    switch(modelName) {

        case "AuditLog" : 
            const { AuditLog }          = require('../db/models/AuditLog'); 
            return AuditLog;
        
        case "Employee" : 
            const { Employee }          = require('../db/models/Employee'); 
            return Employee;

        case "EmployeeLogs" : 
            const { EmployeeLogs }      = require('../db/models/EmployeeLog'); 
            return EmployeeLogs;

        case "NotificationLog" : 
            const { NotificationLog }   = require('../db/models/NotificationLog'); 
            return NotificationLog;

        case "RefreshToken" : 
            const { RefreshToken }      = require('../db/models/RefreshToken'); 
            return RefreshToken;
        
        case "User" : 
            const { User }              = require('../db/models/User'); 
            return User;
    }
}
 
/*/----------------------------------------------------------------------------------------------

    findAll()
    findAllPopulate()
    findAllByField()
    findAllByFieldPopulate()

----------------------------------------------------------------------------------------------/*/

exports.findAll = async (Model) => {
    
    let isErr = {};

    try {
        
        Model = modelPicker(Model);

        const modelings = await Model.find({});
        
        if(modelings.length){
            return isErr = { value : false, output : modelings };
        }

        return isErr = { value : false, output : `${Model.modelName} is empty` };

    } catch (err) {
        return isErr = { value : true, message : err.message };
    }
}

exports.findAllPopulate = async (Model, populateOptions) => {

    let isErr = {};
    Model = modelPicker(Model);

    try {
       
        const modelings = await Model.find({}).populate(populateOptions);
        
        if(modelings.length){
            return isErr = { value : false, output : modelings };
        }

        return isErr = { value : false, output : `${Model.modelName} is empty` };

    } catch (err) {
        return isErr = { value : true, message : err.message };
    }
}

exports.findAllByField = async (Model,field,selectOptions) => {
    
    let isErr = {};

    try {
       
        Model = modelPicker(Model);

        const modelings = await Model.find(field);
        
        if(modelings.length){
            return isErr = { value : false, output : modelings };
        }

        return isErr = { value : false, output : `${Model.modelName} is empty` };

    } catch (err) {
        return isErr = { value : true, message : err.message };
    }
}

exports.findAllByFieldPopulate = async (Model,field,populateOptions) => {
    
    let isErr = {};

    try {
        
        Model = modelPicker(Model);

        const modelings = await Model.find(field).populate(populateOptions);
        
        if(modelings.length){
            return isErr = { value : false, output : modelings };
        }

        return isErr = { value : false, output : `${Model.modelName} is empty` };

    } catch (err) {
        return isErr = { value : true, message : err.message };
    }
}

exports
