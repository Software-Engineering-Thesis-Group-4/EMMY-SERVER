const autoEmail = require('./autoEmail');


// email template
exports.emailTemplate = `<p>We noticed that you are not feeling alright this past few days.` 
						+ ` Please know that your HR team cares for you and we'd like to hear you out.</p>\n`
						+ `<p>Having said, may we invite you on your convenient availability over the next couple`
						+ ` of weeks for a casual and friendly chat? Please reply to (email) to set an appointment.</p>\n`
                        + `<p>Thanks!</p>\n`
                        + `<p>See you!</p>`;

// button for turning auto email system on or off (default on)
exports.activateAutoEmailSystem = true;



exports.changeEmailTemplate = async (template) => {

    try{
        
        this.emailTemplate = template;
        return isErr = { value : false }

    } catch (err) {
        console.log(err)
        return isErr = { value : true, message : err.message }
    }
}

exports.turnOnOffAutoEmail = async (buttonVal) => {

    try{
        
        this.activateAutoEmailSystem = buttonVal;
        return isErr = { value : false }

    } catch (err) {
        console.log(err)
        return isErr = { value : true, message : err.message }
    }
}
