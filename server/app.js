const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const config = require('./config/config')

// Mongoose
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
mongoose.connect(config.dbURL, config.dbOptions)
  .then(() =>  console.log('MongoDB: connection succesful'))
  .catch((err) => console.error('MongoDB: ' + err))

// Routes
const game = require('./routes/game')

// App
const app = express()
app.use(logger('dev'))
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({'extended':'false'}))
app.use(express.static(path.join(__dirname, '../dist')))

app.use('/api/game', game)
app.use('/*', express.static(path.join(__dirname, '../dist')))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
});

// Restful api error handler
app.use(function(err, req, res, next) {
  console.log(err)

  if (req.app.get('env') !== 'development') {
      delete err.stack
  }

    res.status(err.statusCode || 500).json(err)
});

module.exports = app;