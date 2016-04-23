'use strict';

var mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    GoogleStrategy = require('passport-google-oauth2').Strategy,
    User = mongoose.model('User'),
    Brand = mongoose.model('Brand');

var soicalCredentails = require('./social-credentials');

// Serialize sessions
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({ _id: id }, function (err, user) {
    done(err, user);
  });
});

// Use local strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    User.findOne({ email: email }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {
          'errors': {
            'email': { type: 'Email is not registered.' }
          }
        });
      }
      if (!user.authenticate(password)) {
        return done(null, false, {
          'errors': {
            'password': { type: 'Password is incorrect.' }
          }
        });
      }
      return done(null, user);
    });
  }
));
//Brand Facebook Strategy
passport.use(new FacebookStrategy({
    clientID        : soicalCredentails.facebookAuth.clientID,
    clientSecret    : soicalCredentails.facebookAuth.clientSecret,
    callbackURL     : soicalCredentails.facebookAuth.callbackURL,
    profileFields   : ['id', 'name', 'email'],
    passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

  },
  function(req, token, refreshToken, profile, done) {
    // asynchronous
    process.nextTick(function() {
      Brand.findById(req.session.brand, function(err, brand) {
        brand.facebook.id    = profile.id;
        brand.facebook.token = token;
        brand.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
        brand.facebook.email = (profile.emails[0].value || '').toLowerCase();

        brand.save(function(err) {
          if (err)
              return done(err);
              
          return done(null, brand);
        });
      });
    });
  }
));

// Brand twitter strategy
passport.use(new TwitterStrategy({
    consumerKey        : soicalCredentails.twitterAuth.consumerKey,
    consumerSecret     : soicalCredentails.twitterAuth.consumerSecret,
    callbackURL        : soicalCredentails.twitterAuth.callbackURL,
    passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

  },
  function(req, token, tokenSecret, profile, done) {
    // asynchronous
    process.nextTick(function() {
      Brand.findById(req.session.brand, function(err, brand) {
        brand.twitter.id    = profile.id;
        brand.twitter.token = token;
        brand.twitter.token_secret = tokenSecret;
        brand.twitter.username  = profile.username;
        brand.twitter.displayName = profile.displayName;
        
        brand.save(function(err) {
          if (err)
              return done(err);
              
          return done(null, brand);
        });
      });
    });
  }
));

// Brand twitter strategy
passport.use(new GoogleStrategy({
    clientID        : soicalCredentails.googleAuth.clientID,
    clientSecret    : soicalCredentails.googleAuth.clientSecret,
    callbackURL     : soicalCredentails.googleAuth.callbackURL,
    passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

  },
  function(req, token, refreshToken, profile, done) {
    // asynchronous
    
    process.nextTick(function() {
      Brand.findById(req.session.brand, function(err, brand) {
        brand.google.id    = profile.id;
        brand.google.token = token;
        brand.google.name  = profile.displayName;
        brand.google.email = (profile.emails[0].value || '').toLowerCase(); 
        
        brand.save(function(err) {
          if (err)
              return done(err);
              
          return done(null, brand);
        });
      });
    });
  }
));
