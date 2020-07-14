const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// models
const { User } = require('../../db/models/User');

// utilities
const { ValidateFields, VerifyCredentials, VerifySession } = require('../../utility/middlewares');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const { UploadPhotoRules } = require('../../utility/validators/users');
const createAuditLog = require('../../utility/handlers/AuditLogs/CreateAuditLog');

// middlewares
const storageConfig = multer.diskStorage({
	destination: './public/images/users',
	filename: (req, file, cb) => {
		const user_id = req.user._id;

		// validate file type
		if (!file.mimetype.includes('image/')) {
			const error = new Error("Upload Failed. Invalid File Format.");
			error.name = "InvalidFileType";
			return cb(error);
		}

		const ext = file.originalname.split('.').pop();
		cb(null, `${user_id}.${ext}`);
	}
});

const uploadErrorHandler = (error, req, res, next) => {
	if (error.name === "InvalidFileType") {
		res.statusCode = 400;
		return res.send({
			errors: error.message
		})
	}

	res.statusCode = 500;
	return res.send({
		errors: error.message
	})
}

const CustomValidator = async (req, res, next) => {
	try {
		const email = req.query.user;

		// validate if user exists
		const user = await User.findOne({ email });
		if (!user) {
			res.statusCode = 400;
			return res.send({
				errors: "Upload Failed. User not found."
			});
		}

		// attach user to request object
		req.user = user;

		next();
	} catch (error) {
		console.log(error);
		res.statusCode = 500;
		return res.send({
			errors: error
		});
	}

}



/* --------------------------------------------------------------------------------------------------
Route:
/api/users/photo

Query Parameters:
- user
- access_token

Description:
- This api is used uploading user photo

Middlewares:
# VerifySession
	-	Ensure that the user requesting for the API has an existing valid session

# CustomValidator
	-	Check if the user exists in the database

Author/s:
- Nathaniel Saludes
--------------------------------------------------------------------------------------------------- */
router.post('/photo',
	[
		...UploadPhotoRules,
		ValidateFields,
		VerifyCredentials,
		CustomValidator,
		multer({ storage: storageConfig }).single('photo'),
		VerifySession
	],
	async (req, res) => {
		try {
			const new_token = verifyAccessToken(req.query.access_token);
			user = req.user;

			// validate if file exists
			if (!req.file) {
				res.statusCode = 404;
				return res.send({
					errors: "Upload Failed. No image provided."
				});
			}

			const photo = req.file;

			user.photo = photo.filename;
			await user.save();

			// get all images
			const files = fs.readdirSync(path.join(__dirname, '../../public/images/users/'));

			if (files && files.length > 0) {

				// get all images corresponding to the id of user
				let photos = files.filter(file => file.split(".").shift() === user.id);

				// if there are more than 1 image found that corresponds to the user...
				if (photos && photos.length > 1) {

					// delete the other images that doesn't currently match the saved path in the database
					let delete_photos = photos.filter(photo => photo !== user.photo);

					delete_photos.forEach(photo => {
						fs.unlinkSync(path.join(__dirname, `../../public/images/users/${photo}`));
					});
				}
			}

			await createAuditLog(
				user.email,
				'UPDATE',
				`${user.firstname} ${user.lastname} uploaded a new photo.`,
				false
			);

			res.statusCode = 200;
			return res.send({
				new_token,
				message: "Successfully updated photo.",
				photo: photo.filename
			});

		} catch (error) {
			switch (error.name) {
				case "IncompleteCredentials":
					console.log("[Upload Error] Access Token Missing.".red)
					res.statusCode = 401;
					return res.send({
						errors: "Unauthorized Access. Access Token Required."
					})

				case "InvalidAccessToken":
					console.log("[Upload Error] Invalid Access Token.".red)
					res.statusCode = 401;
					return res.send({
						errors: "Unauthorized Access. Invalid Access Token."
					});

				default:
					console.log(`[${error.name}] ${error.message}`);
					res.statusCode = 500;
					return res.send({
						errors: error
					});
			}
		}
	},
	uploadErrorHandler
);

module.exports = router;