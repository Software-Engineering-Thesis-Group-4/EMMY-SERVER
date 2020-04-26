const { AuditLog } 	= require('../db/models/AuditLog');





exports.userRelatedLog = (userId,log,user) => {

    try{

        let audLog = null;

        switch(log){

            case 0  : audLog = 'Recently changed account settings'   ; break;
            case 1  : audLog = 'Changed password email sent'         ; break;
            case 2  : audLog = 'Recently changed password'           ; break;

            // admin privileges
            case 3  : audLog = `Added a new user ${user}`                      ; break;
            case 4  : audLog = `Deleted user ${user}`                          ; break;
            case 5  : audLog = `Recently changed account settings for ${user}` ; break;
            default : audLog = 'Unknown log';                
        }

        const newLog = new AuditLog({
            message : audLog,
            user    : userId
        })
        
        newLog.save();
        console.log('Succesfully added log');

    } catch (error) {
        console.log(error);
    }
};

exports.employeeRelatedLog = (userId,log,emp) => {

    try{
        let audLog = null;

        switch(log){

            case 0  : audLog = 'Imported CSV file'          ; break;
            case 1  : audLog = 'Exported CSV file'          ; break;
            case 2  : audLog = 'Exported PDF file'          ; break;
            
            // admin privileges 
            case 3  : audLog = `Added Employee ${emp}`      ; break;
            case 4  : audLog = `Deleted Employee ${emp}`    ; break;
            case 5  : audLog = `Updated Employee ${emp}`    ; break;
            case 6  : audLog = `Sent email to ${emp}`       ; break;
            case 7  : audLog = 'Made database backup'       ; break;
            case 8  : audLog = 'Restored database backup'   ; break;
            default : audLog = 'Unknown log';                
        }

        const newLog = new AuditLog({
            message : audLog,
            user    : userId
        })
        
        newLog.save();
        console.log('Succesfully added log');

    } catch (error) {
        console.log(err);
    }  
};

exports.serverRelatedLog = (log) => {

    try{
        let audLog = null;

        switch(log){

            case 0  : audLog = 'Successfully made database backup (SERVER)'; break;
            default : audLog = 'Unknown log';               
        }

        const newLog = new AuditLog({
            message : audLog,
            user    : null
        });
        
        newLog.save();

    } catch (error) {
        console.log(err);
    }  
};