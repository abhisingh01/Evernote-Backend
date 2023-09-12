const mongoose = require('mongoose')

const mongoURI = 'mongodb://127.0.0.1:27017/evernote'

const connectToMongoDb = async () => {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");
};
  
module.exports = connectToMongoDb;

// Or:
// conn.startSession().then(sesson => { /* ... */ });