const path     = require('path');
const mongooseQue = require('./mongooseQue');

// TODO: MAKE RESET PASSWORD FUNCTION MODULAR
exports.resetPassword =  () => {

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