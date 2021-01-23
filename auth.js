const bcrypt = require('bcrypt');

module.exports = function(app, myDatabase) {
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


  app.route('/register')
     .post((req, res, next) => {
       const hash = bcrypt.hashSync(req.body.password, 12);
       myDataBase.findOne({ username: req.body.username }, function(err, user) {
         if (err) {
           next(err);
         } else if (user) {
           res.redirect('/');
         } else {
           myDataBase.insertOne({
             username: req.body.username,
             password: hash
           },
             (err, doc) => {
               if (err) {
                 res.redirect('/');
               } else {
                 // The inserted document is held within
                 // the ops property of the doc
                 next(null, doc.ops[0]);
               }
             }
           )
         }
       })
     },
       passport.authenticate('local', { failureRedirect: '/' }),
       (req, res, next) => {
         res.redirect('/profile');
       }
     );
}