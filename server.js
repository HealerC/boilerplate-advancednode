'use strict';
require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');

const http = require('http').createServer(app);
const io = require('socket.io')(http);

const passportSocketIo = require('passport.socketio');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');

const myDB = require('./connection');						// Connection to MONGODB Database
const fccTesting = require('./freeCodeCamp/fcctesting.js');	// Testing
const routes = require('./routes.js');
const auth = require('./auth.js');


fccTesting(app); //For FCC testing purposes

app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  	secret: process.env.SESSION_SECRET,
  	resave: true,
	saveUninitialized: true,
  	cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'pug');		// Template engine



myDB(async client => {
  const myDataBase = await client.db('database').collection('users');
  routes(app, myDataBase);
  auth(app, myDataBase);


  const URI = process.env.MONGO_URI;
  const store = new MongoStore({ url: URI });
  
  io.use(
    passportSocketIo.authorize({
      cookieParser: cookieParser,
      key: 'express.sid',
      secret: process.env.SESSION_SECRET,
      store: store,
      success: onAuthorizeSuccess,
      fail: onAuthorizeFail
    })
  );

  function onAuthorizeSuccess(data, accept) {
    console.log('successful connection to socket.io');
  
    accept(null, true);
  }
  
  function onAuthorizeFail(data, message, error, accept) {
    if (error) throw new Error(message);
    console.log('failed connection to socket.io:', message);
    accept(null, false);
  }

  
  /* Emit from server to io */
  let currentUsers = 0;

  io.on('connection', socket => {
  	console.log("A user has connected");
  	console.log("user " + socket.request.user.name + ' connected.');

  	++currentUsers;
  	io.emit('user count', currentUsers);

  	socket.on('disconnect', () => {
  	  console.log("A user has just disconnected");
  	  
  	  --currentUsers;
  	  io.emit('user count', currentUsers);
  	})
  });

}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('pug', { title: e, message: 'Unable to login' });
  });
});
// app.listen out here...



const port = process.env.PORT || 3000
http.listen(port, () => {
  console.log('Listening on port ' + port);
});
