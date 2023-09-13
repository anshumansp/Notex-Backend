const mongoose = require('mongoose');

const mongoURI = "mongodb+srv://anshumansp:" + encodeURIComponent(process.env.MONGO_PASS) + "@cluster0.ezqihij.mongodb.net/notex?retryWrites=true&w=majority";

const connectToMongo = () => {
    mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(error => {
        console.error('Error connecting to MongoDB:', error);
    });
};


module.exports = connectToMongo;