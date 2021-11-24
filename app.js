const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv/config');
const supertest = require("supertest");

const index = require('./routes/index');
const gps = require('./routes/gps');
const course = require('./routes/course');
const budget = require('./routes/budget');
const email = require('./routes/email');

const users = require('./routes/users');

const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema')

const resolvers = require('./resolvers/resolvers')

const app = express();
app.use(cors({}));


app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: resolvers,
  graphiql: true,
}));


//Set up default mongoose connection
// var env = process.env.MONGODB_URI || 'dev';

const MONGODB_URI = process.env.MONGOLAB_URI;
 // || process.env.LOCAL_HOST;

// var mongodb = process.env.API_HOST;
console.log(MONGODB_URI, 'mongodb log');


const connectWithRetry = () => {
  console.log('MongoDB connection with retry')
  mongoose.connect(MONGODB_URI, {useNewUrlParser: true}).then(()=>{
    console.log('MongoDB is connected')
  }).catch(err=>{
    console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
    setTimeout(connectWithRetry, 5000)
  })
}
connectWithRetry()

//Get the default connection
const db = mongoose.connection;

app.keepAliveTimeout = 0;



//Hopefully this will help with CORS... holy shit i am so done with this problem
// Add headers
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  // Either front-end deployed or localhost:3001
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin === 'https://group-timer.firebaseapp.com/' ? 'https://group-timer.firebaseapp.com/' : 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Origin', '*');

  
  // if(req.headers.origin === 'http://localhost:3001') {
  //   res.setHeader('Access-Control-Allow-Origin', '*');
  // }



  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(xmlparser());

app.use('/course', course)
app.use('/', index, email);
app.use('/gps', gps);
app.use('/budget', budget);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(cors());
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
