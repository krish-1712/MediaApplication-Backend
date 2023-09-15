

// const dbUrl = `mongodb+srv://${process.env.EMAIL}:${process.env.PASSWORD}@cluster0.v5ee5wa.mongodb.net/${process.env.DB_NAME}`

// module.exports = { dbUrl }     

// const dbUrl = `mongodb+srv://${process.env.EMAIL}:${process.env.PASSWORD}@cluster0.v5ee5wa.mongodb.net/${process.env.DB_NAME}`;


// module.exports = { dbUrl };




const mongoose = require('mongoose');

const dbUrl = `mongodb+srv://${process.env.EMAIL}:${process.env.PASSWORD}@cluster0.v5ee5wa.mongodb.net/${process.env.DB_NAME}`;


mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

module.exports = { dbUrl };
