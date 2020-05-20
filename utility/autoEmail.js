
const { Employee } = require('../db/models/Employee');

const mailer = require('./mailer');
const logger = require('./logger');

////--------------------------------- GLOBAL VARIABLES ---------------------------------

let startDate   = new Date();
let endDate     = new Date();

// default 1 day 
let dayDuration = 1;
endDate.setDate(endDate.getDate() + dayDuration);

////--------------------------------- GLOBAL VARIABLES ---------------------------------



////--------------------------------- AUTO EMAIL SETTINGS ---------------------------------

// email template
exports.emailTemplate = `<p>We noticed that you are not feeling alright this past few days.` 
						+ ` Please know that your HR team cares for you and we'd like to hear you out.</p>\n`
						+ `<p>Having said, may we invite you on your convenient availability over the next couple`
						+ ` of weeks for a casual and friendly chat? Please reply to (email) to set an appointment.</p>\n`
                        + `<p>Thanks!</p>\n`
                        + `<p>See you!</p>`;

// button for turning auto email system on or off (default on)
exports.activateAutoEmailSystem = true;

////--------------------------------- AUTO EMAIL SETTINGS ---------------------------------

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


// checks if the duration entered is finish
// will run checker at cron job every 2:AM same as database backup ( checking time still under discussion)
exports.startEndDateChecker = async () => {

    try{
        console.log('Checking if duration is finished for automated email')

        // if day and month is the same for start date and end date clean db then reset startDate and endDate
        if(startDate.getDate() == endDate.getDate() && startDate.getMonth() == endDate.getMonth()){

            const employees = await Employee.find({ sendAutoEmail : true }, 
                                                { firstName : 1, lastName : 1, sendAutoEmail : 1 });

            if(!employees) {
                logger.serverRelatedLog('Employee',4,'Error getting employees or employee collection is empty');
                console.log('Error getting employees or employee collection is empty');
            } else {
    
                employees.forEach(emp => {

                    emp.sendAutoEmail = false;

                    emp.save((err, doc) => {
                        if(err){
                            logger.serverRelatedLog(`Employee`,4,err.message);
                        } else {
                            logger.serverRelatedLog(`${doc.firstName} ${doc.lastName}`,4,err.message);
                        }
                    });
                });

                // reset date 
                startDate = new Date();
                endDate = new Date();
                endDate.setDate(endDate.getDate() + dayDuration);

                console.log('.............................resetting some fields for employee collection'.blue);

                logger.serverRelatedLog('finished',3);
                console.log('Duration finished for automated email.')
            }
        } else {
            // run logger
            logger.serverRelatedLog('not yet finished',3);
            console.log('Duration not yet finsihed for automated email')
        }
    } catch (err){
        console.log(err);
        logger.serverRelatedLog('Employee',4,err.message);
    }
}




exports.putToEmailQueue = async (employeeId) => {

    try{
        const employee = await Employee.findOne({ employeeId },{   
                                                firstName           : 1, 
                                                lastName            : 1, 
                                                sendAutoEmail       : 1, 
                                                leaderboardEmoCount : 1 
                                            });
        
        if(!emp){

            logger.serverRelatedLog(`employee`,4,'Cant find employee');
        
        } else {

            if(employee.sendAutoEmail == false && this.activateAutoEmailSystem == true ){

                employee.sendAutoEmail       = true;
                employee.leaderboardEmoCount = employee.leaderboardEmoCount + 1;
                    
                employee.save((err, doc) => {
                    if(err){
                        logger.serverRelatedLog(`employee`,4,err.message);
                    } else {
                        logger.serverRelatedLog(`${doc.firstName} ${doc.lastName}`,4,err.message);
                    }
                });
            }

            if(employee.sendAutoEmail == true && this.activateAutoEmailSystem == true){

                employee.leaderboardEmoCount = employee.leaderboardEmoCount + 1;

                employee.save((err, doc) => {
                    if(err){
                        logger.serverRelatedLog(`employee`,4,err.message);
                    } else {
                        logger.serverRelatedLog(`${doc.firstName} ${doc.lastName}`,4,err.message);
                    }
                }); 
            }

            // if auto email system is turned off update leaderboards
            if(this.activateAutoEmailSystem == false){
                
                employee.leaderboardEmoCount = employee.leaderboardEmoCount + 1;

                employee.save((err, doc) => {
                    if(err){
                        logger.serverRelatedLog(`employee`,4,err.message);
                    } else {
                        logger.serverRelatedLog(`${doc.firstName} ${doc.lastName}`,4,err.message);
                    }
                }); 
            }
        }
    } catch (err) {
        console.log(err);
        logger.serverRelatedLog(`employee`,4,err.message);
    }
}


exports.scheduledAutoEmail = async () => {

    try{

        const employees = await Employee.find({ sendAutoEmail : true },{ email : 1, _id : 0,  firstName : 1 });
        
        if(!employees.length){ 
            logger.serverRelatedLog(`no employees.`,2);
        } else {

            employees.forEach(async emp => {

                const emailErr  = await mailer.sendAutoEmail(emp.email,emp.firstName);
                
                if(emailErr.value){
                    logger.serverRelatedLog(emp.email,2,emailErr.message);
                } else {
                    logger.serverRelatedLog(emp.email,2);    
                }
            });
        }
    } catch (err) {
        console.log(err.message);
        logger.serverRelatedLog(`corresponding employees`,2,err.message);
    }
}