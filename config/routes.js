
var path      = require('path'),
    appRoot   = require('app-root-path'),
    passport  = require('passport'),
    auth = require(appRoot+'/config/auth');

module.exports = function(app) {
    
  // User Routes
  var users = require(appRoot+'/app/controllers/users');

  /*app.get('/auth/signup', function(req, res, next) {
    console.log("Call me");
    res.render('users/signup', { message: req.flash('signupMessage') });
  });*/
  app.get('/auth/users',users.new);
  
  app.post('/auth/users', users.create);
  app.get('/users/:userId',auth.ensureAuthenticated, users.show);

  // Check if username is available
  // todo: probably should be a query on users
  //app.get('/auth/check_username/:username', users.exists);

  // Session Routes
  var session = require(appRoot+'/app/controllers/session');
  //app.get('/auth/session', auth.ensureAuthenticated, session.session);
  app.post('/auth/session', session.login);
  app.get('/auth/logout', session.logout);

  // Brand routes
  var brands = require(appRoot+'/app/controllers/brands');
  app.get('/brands', auth.ensureAuthenticated, brands.all);
  app.get('/brands/new', auth.ensureAuthenticated, brands.new);
  app.post('/brands', auth.ensureAuthenticated, brands.create);
  app.get('/brands/:brandId', auth.ensureAuthenticated, brands.show);
  app.put('/brands/:brandId', auth.ensureAuthenticated, auth.brand.hasAuthorization, brands.update);
  app.del('/brands/:brandId', auth.ensureAuthenticated, auth.brand.hasAuthorization, brands.destroy);
  app.post('/brands/:brandId/publish', auth.ensureAuthenticated, auth.brand.hasAuthorization, brands.publish);
  
  // Brand FB link
  app.get('/brands/:brandId/facebook', auth.ensureAuthenticated,auth.brand.setBrandSession, passport.authorize('facebook', { scope : ['email','publish_actions'] }));
  //app.get('/brands/:brandId/facebook', auth.ensureAuthenticated, auth.brand.hasAuthorization, brands.facebookConnect);
  app.get('/auth/facebook/callback',
            passport.authorize('facebook', {failureRedirect : '/brands'}),
               function(req,res){
                  res.redirect('/brands');
               }
  );

  //Brand twitter link
  app.get('/brands/:brandId/twitter', auth.ensureAuthenticated,auth.brand.setBrandSession, passport.authorize('twitter', { scope : ['email'] }));
  //app.get('/brands/:brandId/facebook', auth.ensureAuthenticated, auth.brand.hasAuthorization, brands.facebookConnect);
  app.get('/auth/twitter/callback',
            passport.authorize('twitter', {failureRedirect : '/brands'}),
               function(req,res){
                  res.redirect('/brands');
               }
  );

  //Brand Google link
  //Brand twitter link
  app.get('/brands/:brandId/google', auth.ensureAuthenticated, auth.brand.setBrandSession, passport.authorize('google', { scope : ['profile','email'] }));
  //app.get('/brands/:brandId/facebook', auth.ensureAuthenticated, auth.brand.hasAuthorization, brands.facebookConnect);
  app.get('/auth/google/callback',
            passport.authorize('google', {failureRedirect : '/brands'}),
               function(req,res){
                  res.redirect('/brands');
               }
  );
  //Setting up the brandId param
  app.param('brandId', brands.brand);

  // Angular Routes
  

  app.get('/*',  function(req, res) {
    if(req.session.passport.user){
      res.redirect('/brands');
    }
    res.render('index', { title: 'Express' });
  });

}