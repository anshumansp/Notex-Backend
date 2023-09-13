require('dotenv').config();
const connectToMongo = require('./db');
const express = require('express')
const app = express();
const cors = require('cors');
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;

connectToMongo();

app.use(cookieParser());
app.use(express.json());

app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

app.get('/', (req, res) => {
  res.send('Hello Anshuman!')
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
