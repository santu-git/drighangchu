'use strict';

/**
 *  Route middleware to ensure user is authenticated.
 */
exports.ensureAuthenticated = function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}

/**
 * Brand authorizations routing middleware
 */
exports.brand = {
  hasAuthorization: function(req, res, next) {
    if (req.brand.creator._id.toString() !== req.user._id.toString()) {
      return res.send(403);
    }
    next();
  },
  setBrandSession: function(req,res,next){
    console.log("Set Brand Session"+req.brand._id);
    req.session.brand = req.brand._id;
    next();
  }
};
