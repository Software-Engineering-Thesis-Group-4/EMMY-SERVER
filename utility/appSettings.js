const autoEmail = require('./autoEmail');

exports.changeEmailTemplate = async (template) => {

    try{
        
        autoEmail.emailTemplate = template;
        return isErr = { value : false }

    } catch (err) {
        console.log(err)
        return isErr = { value : true, message : err.message }
    }
}

exports.turnOnOffAutoEmail = async (buttonVal) => {

    try{
        
        autoEmail.activateAutoEmailSystem = buttonVal;
        return isErr = { value : false }

    } catch (err) {
        console.log(err)
        return isErr = { value : true, message : err.message }
    }
}
