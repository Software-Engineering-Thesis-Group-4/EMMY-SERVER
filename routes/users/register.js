const router = require('express').Router();
const bcrypt = require('bcryptjs');

// models
const { User } = require('../../db/models/User')

// utilities
const { RegisterRules } = require('../../utility/validators/users');
const { verifyAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const { VerifySession, VerifyAdminRights, ValidateFields, VerifyCredentials } = require('../../utility/middlewares');


/* ------------------------------------------------------------------------------------------
Route:
/api/users/register

Query Parameters:
- user (email of current user)
- access_token

Body:
- firstname
- lastname
- usernam
- email
- password
- isAdmin

Description:
- this route is used for registering new users to the system

Middlewares:
# ValidateSession
-	Ensures that the user requesting for the API has an existing valid session

# ValidateAdminRights
- Ensures that the user requesting for the API has administrator previliges

Author/s:
- Nathaniel Saludes
------------------------------------------------------------------------------------------ */
router.post('/register',
	[
		...RegisterRules,
		ValidateFields,
		VerifyCredentials,
		VerifySession,
		VerifyAdminRights
	],
	async (req, res) => {
		try {

			let access_token = verifyAccessToken(req.query.access_token);

			const {
				firstname,
				lastname,
				username,
				email,
				password,
				isAdmin
			} = req.body;

			// [1] return an error if the email or username is already being used to prevent duplication error
			const user = await User.findOne({
				$or: [
					{ email: email },
					{ username: username }
				]
			});

			if (user) {
				res.statusCode = 422;
				return res.send({
					errors: 'User already exists.'
				})
			}

			const hashed_password = bcrypt.hashSync(password);

			const new_user = new User({
				firstname: firstname,
				lastname: lastname,
				username: username,
				email: email,
				password: hashed_password,
				isAdmin: isAdmin,
			});

			await new_user.save();

			// TODO: Emit a socket event called 'new_user_enrolled'						

			// TODO: Record/Log registering of new user in system logs					

			res.statusCode = 200;
			return res.send({
				new_token: access_token,
				message: 'Successfully registered a new user.',
				user: new_user.email
			})

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
