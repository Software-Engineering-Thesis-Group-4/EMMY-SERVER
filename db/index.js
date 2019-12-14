const mongoose = require('mongoose');

const createConnection = (db_name) => {   
   // get db connection
   mongoose.connect(`mongodb://localhost:27017/${db_name}`, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => console.log(`Successfully connected to MongoDB database! [${db_name}]\n------------------------------------------`))
      .catch((err) => console.error(err));
   
   // prevent deprecation warnings (from MongoDB native driver)
   mongoose.set('useCreateIndex', true);
   mongoose.set('useFindAndModify', false);

   return mongoose;
}

module.exports = {
   createConnection
}