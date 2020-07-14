const router = require('express').Router();
const multer = require('multer');

// models
const { Employee } = require('../../db/models/Employee');

// utilities
const { ValidateFields, VerifyCredentials, VerifySession, VerifyAdminRights } = require('../../utility/middlewares');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const { UploadPhotoRules } = require('../../utility/validators/employees');
const { UploadEmployeePhoto } = require('../../utility/handlers/UploadPhoto/UploadEmployeePhoto');

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
			req.employee;
			req.file;

			const photo = await UploadEmployeePhoto(req.employee, req.file);

			res.statusCode = 200;
			return res.send({
				new_token,
				message: "Successfully updated employee photo.",
				photo
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