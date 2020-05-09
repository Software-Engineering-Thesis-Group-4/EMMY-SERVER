
const { Employee } = require('../db/models/Employee');

const mailer = require('./mailer');
const logger = require('./logger');

////--------------------------------- GLOBAL VARIABLES ---------------------------------

let startDate   = new Date();
let endDate     = new Date();

// default 1 day 
let dayDuration = 1;
endDate.setDate(endDate.getDate() + dayDuration);

// max negativeEmotions default 1
let maxNegativEmotions = 1;
 
////--------------------------------- GLOBAL VARIABLES ---------------------------------




exports.editAutoEmailOptions = async (day, negaEmoCap) => {

    try{
        
        // if options are changed clean database and reset startDate and endDate
        startDate   = new Date();
        endDate     = new Date();


        dayDuration = day;
        maxNegativEmotions = negaEmoCap;


        endDate.setDate(endDate.getDate() + dayDuration);

        const employees = await Employee.find({ angryEmoCount: { $gt: 0 } }, 
                                            { angryEmoCount : 1, firstName : 1, lastName : 1, sendAutoEmail : 1 });

        if(!employees) {
            logger.serverRelatedLog('Employee',4,'Error getting employees or employee collection is empty');
            console.log('Error getting employees or employee collection is empty');
        } else {

            employees.forEach(emp => {

                emp.angryEmoCount = 0;
                emp.sendAutoEmail = false;

                emp.save((err, doc) => {
                    if(err){
                        logger.serverRelatedLog(`Employee`,4,err.message);
                    } else {
                        logger.serverRelatedLog(`${doc.firstName} ${doc.lastName}`,4,err.message);
                    }
                });
            });
        }
        
        console.log('.............................resetting some fields for employee collection'.blue);

    } catch (err){
        console.log(err);
        logger.serverRelatedLog('Employee',4,err.message);
    }
}


// checks if the duration entered is finish
// will run checker at cron job every 2:AM same as database backup ( checking time still under discussion )
exports.startEndDateChecker = async () => {

    try{
        console.log('Checking if duration is finished for automated email')

        // if day and month is the same for start date and end date clean db then reset startDate and endDate
        if(startDate.getDate() == endDate.getDate() && startDate.getMonth() == endDate.getMonth()){
            
            startDate = new Date();
            endDate = new Date();
            endDate.setDate(endDate.getDate() + dayDuration);

            const employees = await Employee.find({ angryEmoCount: { $gt: 0 } }, 
                                                { angryEmoCount : 1, firstName : 1, lastName : 1, sendAutoEmail : 1 });

            if(!employees) {
                logger.serverRelatedLog('Employee',4,'Error getting employees or employee collection is empty');
                console.log('Error getting employees or employee collection is empty');
            } else {
    
                employees.forEach(emp => {
    
                    emp.angryEmoCount = 0;
                    emp.sendAutoEmail = false;

                    emp.save((err, doc) => {
                        if(err){
                            logger.serverRelatedLog(`Employee`,4,err.message);
                        } else {
                            logger.serverRelatedLog(`${doc.firstName} ${doc.lastName}`,4,err.message);
                        }
                    });
                });
            }
            console.log('.............................resetting some fields for employee collection'.blue);

            logger.serverRelatedLog('finished',3);
            console.log('Duration finished for automated email.')
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


exports.checkIfSendEmail = async (employeeId) => {

    try{

        // TODO : GET REQUIRED FIELDS ONLY
        
        const employee = await Employee.findOne({ employeeId },
                                            { 
                                                angryEmoCount       : 1, 
                                                firstName           : 1, 
                                                lastName            : 1, 
                                                sendAutoEmail       : 1, 
                                                leaderboardEmoCount : 1 
                                            });


        if(!emp){

            // TODO: ADD LOGGER
            // cant find employee

        } else {

            // check if employee exceedes extreme emotion cap and not yet included in scheduled auto email
            if(employee.angryEmoCount + 1 >= maxNegativEmotions && employee.sendAutoEmail == false)  {
                
                employee.sendAutoEmail       = true;
                employee.angryEmoCount       = employee.angryEmoCount + 1;
                employee.leaderboardEmoCount = employee.leaderboardEmoCount + 1;
                

                employee.save((err, doc) => {
                    if(err){
                        logger.serverRelatedLog(`Employee`,4,err.message);
                    } else {
                        logger.serverRelatedLog(`${doc.firstName} ${doc.lastName}`,4,err.message);
                    }
                });
            }


            // if employee hasnt excede extreme emotion
            if(employee.angryEmoCount + 1 < maxNegativEmotions){

                employee.angryEmoCount       = employee.angryEmoCount + 1;
                employee.leaderboardEmoCount = employee.leaderboardEmoCount + 1;

                employee.save((err, doc) => {
                    if(err){
                        logger.serverRelatedLog(`Employee`,4,err.message);
                    } else {
                        logger.serverRelatedLog(`${doc.firstName} ${doc.lastName}`,4,err.message);
                    }
                });  
            }


            // if employee exceedes extreme emotion cap and sad sad emotion is still adding and email was already sent
            if(employee.angryEmoCount >= maxNegativEmotions && employee.sendAutoEmail == true){

                employee.angryEmoCount       = employee.angryEmoCount + 1;
                employee.leaderboardEmoCount = employee.leaderboardEmoCount + 1;

                employee.save((err, doc) => {
                    if(err){
                        logger.serverRelatedLog(`Employee`,4,err.message);
                    } else {
                        logger.serverRelatedLog(`${doc.firstName} ${doc.lastName}`,4,err.message);
                    }
                }); 
                //TODO: notify HR
            }
        }
    } catch (err) {
        console.log(err);
        logger.serverRelatedLog(undefined,2,err.message);
    }
}

// TODO: MAKE SEND EMAIL SCHEDULED METHOD
exports.scheduledAutoEmail = async () => {

    try{

        const employees = await Employee.find({ angryEmoCount: { $gte: maxNegativEmotions }, 
                                                sendAutoEmail : false },{ email : 1, _id : 0 });

        if(!employees.length){
            logger.serverRelatedLog(`no employees.`,2);
        } else {

            const strEmp    = employees.toString();
            const emailErr  = await mailer.sendAutoEmail(strEmp);

            if(emailErr.value){
                logger.serverRelatedLog(strEmp,2,emailErr.message);
            } else {
                logger.serverRelatedLog(strEmp,2);    
            }
        }
    } catch (err) {
        console.log(err.message);
        logger.serverRelatedLog(`corresponding employees`,2,err.message);
    }
}