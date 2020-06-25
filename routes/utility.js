const express = require('express');
const path = require('path');
const router = express.Router();

function getPath(file) {
	return path.join(__dirname, `../views/${file}`)
}

router.get('/', (req, res) => {
	res.sendFile(getPath('log_employee.html'));
});

router.get('/login', (req, res) => {
	res.sendFile(getPath('test-login.html'));
});

router.get('/account-settings', (req, res) => {
	res.sendFile(getPath('accountSettings.html'));
});

router.get('/edit-employeelogs', (req, res) => {
	res.sendFile(getPath('editEmployeeLog.html'))
})

router.get('/edit-extremeEmo', (req, res) => {
	res.sendFile(getPath('extremeEmotions.html'))
})

router.get('/logs', (req, res) => {
	res.sendFile(getPath('user_log.html'));
})

router.get('/email-notif', (req, res) => {
	res.sendFile(getPath('email_notif.html'));
});

router.get('/db-backup', (req, res) => {
	res.sendFile(getPath('dbBackup.html'))
})

router.get('/register/user', (req, res) => {
	res.sendFile(getPath('enroll_user.html'));
});

router.get('/register/employee', (req, res) => {
	res.sendFile(getPath('enroll_employee.html'));
});

router.get('/login', (req, res) => {
	res.sendFile(getPath('test_login.html'));
})

router.get('/reset-password', (req, res) => {
	res.sendFile(getPath('resetPass.html'));
})

router.get('/reset-password-key', (req, res) => {
	res.sendFile(getPath('resetPassEmail.html'));
})

router.get('/csv', (req, res) => {
	res.sendFile(getPath('mass_upload.html'));
})

module.exports = router;