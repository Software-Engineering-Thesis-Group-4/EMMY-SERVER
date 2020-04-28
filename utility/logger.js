const { AuditLog } 	= require('../db/models/AuditLog');





exports.userRelatedLog = (logerId,logUsername,log,inputUser,errMessage) => {

    /*/======================================//
        
        DONE LOGS : 3/8
        
        2,3,4

    //======================================/*/

    try{

        let audLog = null;

        switch(log){

            case 0  : audLog = `${logUsername} recently changed account settings.`   ; break;
            case 1  : audLog = `Recently changed password for user ${logUsername}.`  ; break;
            case 2  : audLog = `${logUsername} logged in.`                           ; break;
            case 3  : audLog = `${logUsername} logged out.`                          ; break;

            // admin privileges
            case 4  : audLog = `${logUsername} added new user ${inputUser}.`                        ; break;
            case 5  : audLog = `${logUsername} deleted user ${inputUser}.`                          ; break;
            case 6  : audLog = `${logUsername} recently changed account settings for ${inputUser}.` ; break;
            default : audLog = 'Unknown user related log.';                
        }


        if(errMessage){
            audLog = `ERROR: ${errMessage} on log: ${audLog}`;
        }

        const newLog = new AuditLog({
            message : audLog,
            user    : logerId
        })
        
        newLog.save();
        console.log('Succesfully added log');

    } catch (error) {
        console.log(error);
    }
};

exports.employeeRelatedLog = (logerId,logUsername,log,emp,errMessage) => {

     /*/======================================//
        
        DONE LOGS : 5/8
        
        0,3,4,7,8

    //======================================/*/

    try{

        let audLog = null;

        switch(log){

            case 0  : audLog = `${logUsername} imported CSV file.`          ; break;
            case 1  : audLog = `${logUsername} exported CSV file.`          ; break;
            case 2  : audLog = `${logUsername} exported PDF file.`          ; break;
            
            // admin privileges 
            case 3  : audLog = `${logUsername} added Employee ${emp}.`              ; break;
            case 4  : audLog = `${logUsername} deleted Employee (marks as terminated) ${emp}.`            ; break;
            case 5  : audLog = `${logUsername} updated Employee ${emp}.`            ; break;
            case 6  : audLog = `${logUsername} sent email to ${emp}.`               ; break;
            case 7  : audLog = `${logUsername} downloaded database backup.`         ; break;
            case 8  : audLog = `${logUsername} restored database backup.`           ; break;
            default : audLog = 'Unknown employee related log.';                
        }


        if(errMessage){
            audLog = `ERROR: ${errMessage} on log: ${audLog}`;
        }
        const newLog = new AuditLog({
            message : audLog,
            user    : logerId
        })
        
        newLog.save();
        console.log('Succesfully added log');

    } catch (error) {
        console.log(error);
    }  
};


exports.employeelogsRelatedLog = (logMail,log,errMessage) => {

    /*/======================================//
       
       DONE LOGS :
       

   //======================================/*/


   try{
       
       

   } catch (error) {
       console.log(error);
   }  
};

exports.serverRelatedLog = (logMail,log,errMessage) => {

     /*/======================================//
        
        DONE LOGS : 1/2
        1

    //======================================/*/


    try{
        
        let audLog = null;

        switch(log){

            case 0  : audLog = 'Made database backup (SERVER)'                          ; break;
            case 1  : audLog = `EMMY sent a changed password key email to ${logMail}.`  ; break;
            default : audLog = 'Unknown server related log';               
        }

        if(errMessage){
            audLog = `ERROR: ${errMessage} on log: ${audLog}`;
        }

        const newLog = new AuditLog({
            message : audLog,
            user    : null
        });
        
        newLog.save();

    } catch (error) {
        console.log(error);
    }  
};