const fs = require('fs');
const path = require('path');

async function UploadEmployeePhoto(employee, photo) {
	if (!photo) {
		const error = new Error('Upload Failed. No image provided.');
		error.name = "InvalidFileUpload";
		throw error;
	}

	employee.photo = photo.filename;
	await employee.save();

	// get all images
	const files = fs.readdirSync(path.join(__basedir, './public/images/employees/'));

	if (files && files.length > 0) {

		// get all images corresponding to the id of employee
		let photos = files.filter(file => file.split(".").shift() === employee._id);

		// if there are more than 1 image found that corresponds to the employee...
		if (photos && photos.length > 1) {

			// delete the other images that doesn't currently match the saved path in the database
			let delete_photos = photos.filter(photo => photo !== employee.photo);

			delete_photos.forEach(photo => {
				fs.unlinkSync(path.join(__basedir, `./public/images/employees/${photo}`));
			});
		}
	}

	return photo.filename;
}

module.exports = { UploadEmployeePhoto };