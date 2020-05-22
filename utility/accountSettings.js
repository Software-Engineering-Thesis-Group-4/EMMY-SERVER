const path     = require('path');
const mongooseQue = require('./mongooseQue');
const db = require('./mongooseQue');
const mailer = require('./mailer')
const jwt = require('./jwt');
const aes = require('./aes');

exports.resetPassword = async (email) => {

    try{

        const user = await db.findOne('user', { email });

        if (user.value) {
            return res.status(500).send('Email doesnt exist in database');
        }
				
		const username 		= user.output.username;
		const decryptUser 	= user.output.email;

		// create token with user info ------- 1 min lifespan
		const resetToken = jwt.createResetPassToken({ email : user.output.email });

		// gets last 7 char in token and makes it the verif key
		const key = resetToken.substring(resetToken.length - 7)

		// encrypt token before sending to user
		const encTok =  aes.encrypt(resetToken);
       
		// send key to user email
        let isErr = await mailer.resetPassMail(decryptUser, username, key);

        if(isErr.value){
            return isErr = { value: true, message: isErr.message };
        } else {
            return isErr = { value: false, output: { resetTok: encTok } };
        }
        
    } catch (err) {
        console.log(err.message);
		return isErr = { value: true, message: err.message };
    }

}

exports.resetPasswordKey = async (resetTok,key) => {

    try{

        const decryptedToke = aes.decrypter(resetTok)
        
		const verifiedToken = await jwt.verify(decryptedToke, 'authtoken');
			
		if(verifiedToken.value){
            return isErr = { value: true, message: "Unauthorized Access." };
		}
       
        if (key === decryptedToke.substring(decryptedToke.length - 7)) {
            // if token is not expired and key is correct, proceed to change password page
            return isErr = { value: false, output: verifiedToken.output.email };
        } else {
            return isErr = { value: true, message: 'Invalid reset password key' };
        }
        
    } catch (err) {
        console.log(err.name);
		return isErr = { value: true, message: err.message };
    }

}

exports.changeUserPhoto = async (imageFile,userId) => {

    try{

        const fileType = imageFile.mimetype.split('/')[1];
        const pathToImage = path.join(__dirname,`../images/users/${userId}.${fileType}`);

        await imageFile.mv(pathToImage);

        const updatedUser = await mongooseQue.updateById('user',userId,{ photo : pathToImage})

        if(updatedUser.value){
            return isErr = { value: true, message: updatedUser.message };
        }

        return isErr = { value : false, output : updatedUser.output };

	} catch (err) {
		console.log(err);
		return isErr = { value: true, message: err.message };
	}
}