const { AuditLog }          = require('../db/models/AuditLog'); 
const { Employee }          = require('../db/models/Employee'); 
const { EmployeeLogs }      = require('../db/models/EmployeeLog'); 
const { NotificationLog }   = require('../db/models/NotificationLog'); 
const { RefreshToken }      = require('../db/models/RefreshToken'); 
const { User }              = require('../db/models/User'); 

const modelPicker = (modelName) => {


    switch(modelName.toLowerCase()) {

        case "auditlog" : 
           return importModel = AuditLog; 

        case "employee" : 
            return importModel = Employee;
             
        case "employeelog" : 
            return importModel = EmployeeLogs;
             
        case "notificationlog" : 
            return importModel = NotificationLog;

        case "refreshtoken" : 
            return importModel = RefreshToken;
        
        case "user" : 
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


exports.findById = async (model,id) => {

    try {
        
        const Model = modelPicker(model);



        const modeling = await modeling.findById(id);

        if(!modeling){
            return isErr = { value : true, message :`Cant find document in ${Model.modelName} collection` };
        }

        return isErr = { value : false, output : modeling };

    } catch (err) {
        console.log(err.message)
        return isErr = { value : true, message : err.message };
    }
}  


exports.updateById = async (model,id,data) => {

    try {

        const Model = modelPicker(model);
        const updatedModeling = await Model.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true }
        );

        if(!updatedModeling){
            return isErr = { value : true, message : `Error updating a document in ${Model.name} collection` }; 
        }

        return isErr = { value : false, output : updatedModeling }
       
    
    } catch (err) {
        return isErr = { value : true, message : err.message };
    }
}


exports.save = async (model,data) => {

    try {
        
        const Model = modelPicker(model);

        const modeling = new Model(data);


        const savedModeling = await modeling.save();

        if(!savedModeling){
            return isErr = { value : true, message : `Error saving document for ${Model.name}` };
        }

        return isErr = { value : false, output : savedModeling };

    } catch (err) {
        console.log(err.message)
        return isErr = { value : true, message : err.message };
    }
}  

exports.findOne = async (model,field) => {
    

    try {
        
        Model = modelPicker(model);

        const modelings = await Model.findOne(field);
     
        if(!modelings){
            return isErr = { value : true, output : `Cant find document in ${Model.modelName} collection` };
        }

        return isErr = { value : false, output : modelings };

    } catch (err) {
        console.log(err)
        return isErr = { value : true, message : err.message };
    }
}


exports.findAll = async (model,field,options) => {

    try {
       
        Model = modelPicker(model);
      
        const modelings = await Model.find(field,options);
        
        if(modelings.length){
            return isErr = { value : false, output : modelings };
        }

        return isErr = { value : true, output : `${Model.modelName} is empty` };

    } catch (err) {
        return isErr = { value : true, message : err.message };
    }
}

exports.findAllPopulate = async (Model,field,populateOptions) => {
    
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