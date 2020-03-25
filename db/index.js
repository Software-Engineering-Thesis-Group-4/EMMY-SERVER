const mongoose = require('mongoose');

exports.createDBConnection = (db_name, port) => {
   return new Promise(async (resolve, reject) => {
      try {

         // get db connection
         //console.time('Mongoose connection startup');
         const connection = await mongoose.connect(`mongodb://localhost:${port}/${db_name}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
         });
         console.log(`MongoDB Database: "${db_name}" ` + `(connected)`.green);
         //console.timeEnd('Mongoose connection startup');
         resolve(connection);

      } catch (error) {
         reject(error.message);

      }
   });
}

exports.closeDBConnection = async () => {
   try {
      console.log('closing connection...');
      await mongoose.connection.close();
      console.log('database connection closed.');
      console.log("-------------------------------------------------------------------");
   } catch (error) {
      throw new Error(error);
   }
}