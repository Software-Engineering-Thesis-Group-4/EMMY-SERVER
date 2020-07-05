const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// models
const { Employee } = require('../../db/models/Employee');

// utilities
const { ValidateFields, VerifyCredentials, VerifySession, VerifyAdminRights } = require('../../utility/middlewares');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const { UploadPhotoRules } = require('../../utility/validators/employees');

// middlewares
const storageConfig = multer.diskStorage({
	destination: './public/images/employees',
	filename: (req, file, cb) => {
		const employee_id = req.employee._id;

		// throw an error if the file being uploaded is not an image
		if (!file.mimetype.includes('image/')) {
			const error = new Error("Upload Failed. Invalid File Format.");
			error.name = "InvalidFileType";
			return cb(error);
		}

		const ext = file.originalname.split('.').pop();
		cb(null, `${employee_id}.${ext}`);
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

const CustomMiddleware = async (req, res, next) => {
	try {
		const id = req.params._id;

		const employee = await Employee.findById(id);
		if (!employee) {
			res.statusCode = 400;
			return res.send({
				errors: "Upload Failed. Employee not found."
			});
		}

		// attach employee to request object
		req.employee = employee;

		next();
	}
	catch (error) {
		console.log(error);
		res.statusCode = 500;
		return res.send({
			errors: error
		})
	}
}



/* --------------------------------------------------------------------------------------------------
Route:
/api/employees/:_id/photo

Query Parameters:
- user
- access_token

Description:
- This api is used uploading employee photo

Middlewares:
# VerifySession
-	Ensure that the user requesting for the API has an existing valid session

# CustomValidator
-	Check if the employee exists in the database

# VerifyAdminRights
-	Ensure if the user requesting for the api has administrator previliges

Author/s:
- Nathaniel Saludes
--------------------------------------------------------------------------------------------------- */
router.post('/:_id/photo',
	[
		...UploadPhotoRules,
		ValidateFields,
		VerifyCredentials,
		CustomMiddleware,
		multer({ storage: storageConfig }).single('photo'),
		VerifySession,
		VerifyAdminRights,
	],
	async (req, res) => {
		try {
			const new_token = verifyAccessToken(req.query.access_token);
			const employee = req.employee;

			if (!req.file) {
				res.statusCode = 404;
				return res.send({
					errors: "Upload Failed. No image provided."
				});
			}

			const photo = req.file;

			employee.photo = photo.filename;
			await employee.save();

			// get all images
			const files = fs.readdirSync(path.join(__dirname, '../../public/images/employees/'));

			if (files && files.length > 0) {

				// get all images corresponding to the id of employee
				let photos = files.filter(file => file.split(".").shift() === req.params._id);

				// if there are more than 1 image found that corresponds to the employee...
				if (photos && photos.length > 1) {

					// delete the other images that doesn't currently match the saved path in the database
					let delete_photos = photos.filter(photo => photo !== employee.photo);

					delete_photos.forEach(photo => {
						fs.unlinkSync(path.join(__dirname, `../../public/images/employees/${photo}`));
					});
				}
			}

			res.statusCode = 200;
			return res.send({
				new_token,
				message: "Successfully updated employee photo.",
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