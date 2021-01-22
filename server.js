'use strict';
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const ObjectID = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');

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

myDB(async client => {
  const myDataBase = await client.db('database').collection('users');

  // Be sure to change the title
  app.route('/').get((req, res) => {
    //Change the response to render the Pug template
    res.render(__dirname + '/views/pug', {
      title: 'Connected to Database',
      message: 'Please login',
      showLogin: true,
      showRegistration: true
    });
  });

  // Serialization and deserialization here...
  passport.serializeUser((user, done) => {
  	done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
  	myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
   		done(null, doc);
    });
  });

  passport.use(new LocalStrategy(
    function(username, password, done) {
      myDataBase.findOne({ username: username }, function (err, user) {
        console.log('User '+ username +' attempted to log in.');
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (password !== user.password) { return done(null, false); }
        return done(null, user);
      });
    }
  ));
  // Be sure to add this...

  app.post('/login', passport.authenticate('local', { failureRedirect: '/'}), 
  	(req, res) => {
	  res.redirect('/profile');
	}
  );

  app.get('/profile', ensureAuthenticated, (req, res) => {
  	res.render(__dirname + 'views/pug/profile', {username: req.user.username});
  });

  function ensureAuthenticated(req, res, next) {
  	if (req.isAuthenticated()) {
  	  return next();
  	}
  	res.redirect('/');
  }

  app.route('/logout')
     .get((req, res) => {
     	req.logout();
     	res.redirect('/');
     });

  app.use((req, res, next) => {
  	res.status(404)
  	   .type('text')
  	   .send('Not Found');
  });


}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('pug', { title: e, message: 'Unable to login' });
  });
});
// app.listen out here...



const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log('Listening on port ' + port);
});
