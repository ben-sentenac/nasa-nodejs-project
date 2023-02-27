const path = require('node:path');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const api = require('./routes/api.route');



const app = express();

var whitelist = ['http://localhost:8000','http://localhost:3000'];

var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS policy'))
    }
  }
}

//cors cross site policy
app.use(cors(corsOptions));
//server log message
app.use(morgan('combined'));
//parse JSOn middleware from body of incoming request
app.use(express.json());

app.use(express.static(path.join(__dirname,'..','build')));

app.use('/v1',api);




app.get('/*', (req,res) => {
  res.sendFile(path.join(__dirname,'..','build','index.html'));
});

module.exports = app;