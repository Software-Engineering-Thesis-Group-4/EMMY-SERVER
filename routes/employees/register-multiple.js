const router = require('express').Router();
const multer = require('multer');

// utilities
const { RegisterMultipleRules } = require('../../utility/validators/employees');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const { ValidateFields, VerifyCredentials, VerifyAdminRights, VerifySession } = require('../../utility/middlewares/');
const processFileImport = require('../../utility/handlers/ImportEmployees/CSVImportHandler');

// middlewares
function CustomValidator(req, res, next) {
	if (!req.file) {
		res.statusCode = 404;
		return res.send({
			errors: "File is empty."
		})
	}

	next();
}

const storage = multer.diskStorage({
	destination: './uploads/',
	filename: (req, file, cb) => {
		cb(null, 'upload.csv');
	}
})

/* --------------------------------------------------------------------------------------------------
Route:
/api/employees/import

Query Parameters:
- user
- access_token

Description:
- This api is used for registering multiple employees in CSV format.

Middlewares:
# VerifySession
	-	Ensure that the user requesting for the API has an existing valid session

# VerifyAdminRights
	-	Ensure that the user requesting for the API has administrator previliges

Author/s:
- Nathaniel Saludes
--------------------------------------------------------------------------------------------------- */
router.post('/import',
	[
		multer({ storage: storage }).single('csv'),
		...RegisterMultipleRules,
		ValidateFields,
		VerifyCredentials,
		CustomValidator,
		VerifySession,
		VerifyAdminRights
	],
	async (req, res) => {
		try {
			const new_token = verifyAccessToken(req.query.access_token);
			const employees = await processFileImport(req.file);

			if (employees && employees.length > 0) {
				res.statusCode = 200;
				return res.send({
					new_token,
					message: `Successfully uploaded (${employees.length}) employees.`,
				});
			}


		} catch (error) {
			switch (error.name) {
				case "IncompleteCredentials":
					console.log("[Register Error] Access Token Missing.".red)
					res.statusCode = 401;
					return res.send({
						errors: "Unauthorized Access. Access Token Required."
					})

				case "InvalidAccessToken":
					console.log("[Register Error] Invalid Access Token.".red)
					res.statusCode = 401;
					return res.send({
						errors: "Unauthorized Access. Invalid Access Token."
					});

				case "DuplicateValidationError":
					res.statusCode = 422;
					return res.send({
						errors: error
					});

				case "InvalidFileType":
					res.statusCode = 422;
					return res.send({
						errors: error.message
					});

				case "EmptyFileError":
					res.statusCode = 422;
					return res.send({
						errors: error.message
					});

				case "DatabaseDuplicateError":
					res.statusCode = 422;
					return res.send({
						errors: error
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