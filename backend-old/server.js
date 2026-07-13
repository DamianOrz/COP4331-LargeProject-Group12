const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./api');
const { Client } = require('mongoose');

const app = express();
app.use(cors({
  origin: `*`,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(bodyParser.json());

require('dotenv').config();
const url = process.env.MONGODB_URI;

if(!url) {
  throw new Error(`No DB connection string`);
}

const client = new Client(url);

client.connect()
  .then(() => console.log("Connected successfully to MongoDB Atlas Cloud"))
  .catch((err) => console.error("MongoDB connection failed:", err));

app.use(routes);

app.listen(5000, () => {
  console.log('Server listening on port 5000');
});
