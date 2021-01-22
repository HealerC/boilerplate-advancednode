'use strict';
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');

const myDB = require('./connection');						// Connection to MONGODB Database
const fccTesting = require('./freeCodeCamp/fcctesting.js');	// Testing

const app = express();

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
const pugIndex = __dirname + '/views/pug';
app.route('/').get((req, res) => {
  res.render(pugIndex, {title: "Hello", message: "Please login"});
});

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log('Listening on port ' + port);
});
