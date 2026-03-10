const { MongoClient } = require('mongodb');
require('dotenv').config();

let db;
let client;

async function connectDB() {
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db();
  console.log('Base de datos:', client.db().databaseName);
  console.log('Conectado a MongoDB Atlas');
  return client;
}

function getDB() {
  if (!db) throw new Error('Base de datos no inicializada');
  return db;
}

function getClient() {
  if (!client) throw new Error('Cliente no inicializado');
  return client;
}

module.exports = { connectDB, getDB, getClient };