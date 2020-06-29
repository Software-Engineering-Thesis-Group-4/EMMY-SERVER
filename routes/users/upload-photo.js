const router = require('express').Router();
const multer = require('multer');

// models
const { User } = require('../../db/models/User');

// utilities
const { query } = require('express-validator');
const { ValidateFields, VerifyCredentials, VerifySession } = require('../../utility/middlewares');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');

// middlewares
const storage = multer.diskStorage({
	destination: './public/images/',
	filename: (req, file, cb) => {
		const user_id = req.user._id;

		// validate file type
		if (!file.mimetype.includes('image/')) {
			const error = new Error("Invalid File Format.");
			error.name = "InvalidFileType";
			return cb(error);
		}

		const ext = file.originalname.split('.').pop();
		cb(null, `${user_id}.${ext}`);
	}
});

const UploadPhotoRules = [
	query('user').trim().escape(),
	query('access_token').trim().escape(),
]

const CustomValidator = async (req, res, next) => {
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
}



/* --------------------------------------------------------------------------------------------------
Route:
/api/users/photo

Query Parameters:
- user

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
		multer({ storage: storage }).single('photo'),
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

			// validate file type
			const photo = req.file;
			if (!photo.mimetype.includes('image/')) {
				res.statusCode = 404;
				return res.send({
					errors: "Upload Failed. Invalid format."
				});
			}

			user.photo = photo.filename;
			await user.save();

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
	}
);

module.exports = router;