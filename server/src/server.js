const http = require('node:http');

const mongoose = require('mongoose');

require('dotenv').config();


const app = require('./app');
const { loadingPlanetsData } = require('./models/planets.model');
const { loadLaunchDataFromSpaceXApi } = require ('./models/launches.model');
const { connectMongo } = require ('utils/mongo.js');
const { connectMongo } = require('./utils/mongo');

const _SPACE_X_API_URL_QUERY = 'https://api.spacexdata.com/v4/launches/query';

const MONGO_URL = process.env.MONGO_URL;

const server = http.createServer(/*SOMETHINg*/ app);

const PORT = process.env.PORT || 8000;
let listeningServerMessage = `Server listening on port ${PORT}`;



//because await is only valid in async functions and the top level bodies of modules
//common pattern to load data before server starting 
async function startServer() {
    mongoose.set({
        strictQuery:false,
    });
    await connectMongo(MONGO_URL);
    //populate planets data
    await loadingPlanetsData();
    //populate spaceX api data
    await loadLaunchDataFromSpaceXApi(_SPACE_X_API_URL_QUERY);
    server.listen(PORT, () => console.log('\x1b[33m%s\x1b[0m',listeningServerMessage));
}

startServer();


