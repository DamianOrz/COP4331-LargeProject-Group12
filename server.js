const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 1. Configure MongoDB Client Connection
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://mealuser:mealuser1@ac-vktbbkw-shard-00-00.ts0chds.mongodb.net:27017,ac-vktbbkw-shard-00-01.ts0chds.mongodb.net:27017,ac-vktbbkw-shard-00-02.ts0chds.mongodb.net:27017/?ssl=true&replicaSet=atlas-90bp5t-shard-0&authSource=admin&appName=proj2cop4331';
const client = new MongoClient(url);

client.connect()
  .then(() => console.log("Connected successfully to MongoDB Atlas Cloud"))
  .catch((err) => console.error("MongoDB connection failed:", err));

// --- STEP 2 ROUTE EXTRACTION WIRES ---
// We import and call the endpoints from api.js directly below the database setup [cite: 70-72]
var api = require('./api.js'); 
api.setApp( app, client ); 
// -------------------------------------

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

// NOTE: All the old app.post() endpoints (/api/login, /api/addcard, /api/searchcards) 
// have been removed from here because they are safely inside api.js now! [cite: 6, 73]

app.listen(5000, () => {
  console.log('Server listening on port 5000');
});