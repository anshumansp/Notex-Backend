const mongoose = require('mongoose');
const password = process.env.MONGO_PASS;

const mongoURI = "mongodb+srv://anshumansp:" + encodeURIComponent(password) + "@cluster0.ezqihij.mongodb.net/notex?retryWrites=true&w=majority";

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