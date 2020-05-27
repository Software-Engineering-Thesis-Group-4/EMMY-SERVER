const pdfDocument = require('pdfkit');
const fs = require('fs');
const moment = require('moment');

// Import Models to get necessary data
const { Employee } = require('../db/models/Employee'); // per specified month
const { EmployeeLog } = require('../db/models/EmployeeLog'); // per specified month
const { EmotionNotification } = require('../db/models/EmotionNotification'); //total number of emotion (angry/sad) per specified month

// output all these following data
// Employee Satisfaction
// Sentiment of the Week
// Positive Sentiment by Gender
// Negative Sentiment by Gender
// Overall Sentiment by Month

getLogsPerMonth = async (month) => {
   try {
      const logs = await EmployeeLog.find({  });

      if (!logs){
         console.log("No logs found for " + month);
         return null;
      }
      console.log("Logs found for " + month);
      return logs;

   } catch(error){
      console.log(error);
      return null;
   }

}


getEmotionNotifNumber = async(month, emotion) => {
   try {
      // const notifs = await EmotionNotification.find({ dateCreated: { $eq: month.toString() }, emotion: { $eq: emotion });
      // then count the number of notifications
      if (!notifs) {
         console.log("PDF Create: No notifications found for " + month);
         return null;
      }
      // let sadNotifs = notifs.sad.length;
      // let angryNotifs = notifs.sad.length;

      let numberOfNotifs = notifs.length;
      console.log("PDF Create: Notifs found for " + month);
      return numberOfNotifs;
   } catch(error) {
      console.log(error);
      return null;
   }
}

exports.createPDF = (specifiedMonth) => {
   console.log('Create PDF - Month: ' + specifiedMonth);
   const logs = getLogsPerMonth(specifiedMonth) //returns object 'logs' or 'null'
}

// Document elements creation
const doc = new pdfDocument();
const myname = 'Paolo';

//PDF file creation output
doc.pipe(fs.createWriteStream('../../outputsample123.pdf'));

doc.fontSize(15).text('LOGO HERE');

doc
.fontSize(15)
.text('Employee Mood Monitoring System');

doc
.fontSize(15)
.text('My name is ' + myname);

// Dashboard
// Employee Satisfaction - Sentiment of the Week - Positive Sentiment By Gender - Negative Sentiment By Gender - Overall Sentiment By Month


// doc.image('../public/favicon.png', {
//    fit: [250, 300],
//    align: 'center',
//    valign: 'center'
//  });

// Add another page
doc
   .addPage()
   .fontSize(10)
   .text('Here is some text from another page...', 100, 100);

// doc
//    .text('Link here')
//    .link(100, 100, 160, 27, 'http://google.com/');


// Finalize PDF file only
doc.end();

// ------------------------------------------------------------------------------------------------------------------------------------------------------------

// https://codepen.io/blikblum/pen/gJNWMg?editors=1010
// Use in browser and run download() when button is clicked
// <div>PDF Output <button onclick="download()">Download</button></div>
// <iframe width="100%" height="800px"></iframe>
//
//
// const a = document.createElement("a");
// document.body.appendChild(a);
// a.style = "display: none";
//
// let blob;
//
// function download() {
//   if (!blob) return;
//   var url = window.URL.createObjectURL(blob);
//   a.href = url;
//   a.download = 'test.pdf';
//   a.click();
//   window.URL.revokeObjectURL(url);
// }

// stream.on("finish", function() {
//   // get a blob you can do whatever you like with
//   blob = stream.toBlob("application/pdf");

//   // or get a blob URL for display in the browser
//   const url = stream.toBlobURL("application/pdf");
//   const iframe = document.querySelector("iframe");
//   iframe.src = url;
// });