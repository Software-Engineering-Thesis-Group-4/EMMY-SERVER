// It easily overwrites existing pdf file if same name

const pdfDocument = require('pdfkit');
const fs = require('fs');

// Document elements creation
const doc = new pdfDocument();
const myname = 'PAOLO';

//PDF file creation output
doc.pipe(fs.createWriteStream('outputsample123.pdf'));

doc
.fontSize(15)
.text('MY NAME IS ' + myname, 100, 100);

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