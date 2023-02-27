const mongoose = require('mongoose');


mongoose.connection.once('open', () => console.log('MogoDB connection ready!'));

mongoose.connection.on('error', (err) => console.log(err) );

async function connectMongo(_url) {
    await mongoose.connect(_url);
}

async function disconnectMongo() {
    await mongoose.disconnect();
}

module.exports = {
    connectMongo,
    disconnectMongo
}