// TODO
// Needs more Testing
// https://www.freecodecamp.org/news/here-is-the-most-popular-ways-to-make-an-http-request-in-javascript-954ce8c95aaa/

const axios = require("axios");

const numberOfRequests = 2;

for (i = 0; i <= numberOfRequests; ++i) {
   let data = {
      email: i + "-testEmail@gmail.com",
      password: "test123"
   }
   const url = 'http://localhost:3000/auth/login';
   console.log("URL " + i + " :" + url);
   axios.get({
      method: 'POST',
      url: url,
      data: { data }
   })
   .then(data => console.log(data))
   .catch(err => console.error(err))

   //ERROR CODE
}