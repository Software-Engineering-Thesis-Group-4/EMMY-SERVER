const router = require('express').Router();
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// models
const { User } = require('../../db/models/User');

// utilities
const { LoginRules } = require('../../utility/validators/authentication');
const { createRefreshToken } = require('../../utility/tokens/RefreshTokenUtility');
const { createAccessToken } = require('../../utility/tokens/AccessTokenUtility');
const { VerifyNonDuplicateSession } = require('../../utility/middlewares');

// middlewares
const CustomValidator = (req, res, next) => {
	const errors = validationResult(req);

	// validate user input, and send a response if errors 
	if (!errors.isEmpty()) {
		console.log(errors.mapped());
		res.statusCode = 401;
		return res.send({
			errors: ERR_INVALID_CREDENTIALS
		});
	}

	next();
}

const ERR_INVALID_CREDENTIALS = "Invalid email or password.";

/* ------------------------------------------------------------------------------------------
Route:
/api/auth/login

Body:
- email
- password

Description:
- this route is used loggin in users

Author/s:
- Nathaniel Saludes
------------------------------------------------------------------------------------------ */
router.post('/login',
	[
		...LoginRules,
		CustomValidator,
		VerifyNonDuplicateSession
	],
	async (req, res) => {
		try {
			const { email, password } = req.body;

			// [1] check if user exists
			const user = await User.findOne({ email: email });
			if (!user) {
				console.log('Login Failed. User not found.'.red);
				res.statusCode = 401;
				return res.send({
					errors: ERR_INVALID_CREDENTIALS
				})
			}


			// [2] check if entered password is valid
			const passwordIsValid = await bcrypt.compare(password, user.password);
			if (!passwordIsValid) {
				console.log('Login Failed. Invalid password input.'.red)
				res.statusCode = 401;
				return res.send({
					errors: ERR_INVALID_CREDENTIALS
				})
			}

			// [3] if credential validation is success, generate and store new refresh token in db to register new user session.
			await createRefreshToken(email);

			// [4] generate new access token for accessing protected resources
			const access_token = createAccessToken();

			// TODO: Create audit log for the successful registration of a new user	

			res.statusCode = 200;
			return res.send({
				token: access_token,
				user: {
					_id: user._id,
					firstname: user.firstname,
					lastname: user.lastname,
					username: user.username,
					email: user.email,
					isAdmin: user.isAdmin,
					photo: user.photo,
				}
			});

		} catch (error) {
			console.log(`[${error.name}] ${error.message}`);
			res.statusCode = 500;
			return res.send({
				errors: error
			});
		}

	}
);

module.exports = router;