const mongoose = require('mongoose');

const createDBConnection = async (db_name, port) => {
   try {
      mongoose.set('useCreateIndex', true);
      mongoose.set('useFindAndModify', false);
      
      // get db connection
      const connection = await mongoose.connect(`mongodb://localhost:${port}/${db_name}`, { useNewUrlParser: true, useUnifiedTopology: true });
      // prevent deprecation warnings (from MongoDB native driver)

      console.log(`Successfully connected to MongoDB database! [${db_name}]\n------------------------------------------`);

      return connection;

   } catch (error) {
      console.error(error);
      throw new Error(error);
   }
}

module.exports = { createDBConnection }