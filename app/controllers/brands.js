'use strict';

var mongoose  = require('mongoose'),
    passport  = require('passport'),
    appRoot   = require('app-root-path'),
    multer    = require('multer'),
    fs        = require('fs'),
    url       = require('url');

var Brand         = mongoose.model('Brand'),
    Promotion     = mongoose.model('Promotion');
    
var brand_logo_storage   =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, appRoot+'/public/uploads/brands');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now()+'-'+file.originalname.replace(/ /g,"-"));
  }
});

var promotion_imgae_storage   =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, appRoot+'/public/uploads/promotions');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now()+'-'+file.originalname);
  }
});

/**
 * Find brand by id
 */
exports.brand = function(req, res, next, id) {
  Brand.load(id, function(err, brand) {
    if (err) return next(err);
    if (!brand) return next(new Error('Failed to load brand ' + id));
    req.brand = brand;
    console.log(brand.promotions);
    next();
  });
};


exports.new = function(req, res, next){
  res.render('brands/new', { message: "" });
}

/**
 * Create a brand
 */
exports.create = function(req, res) {
  var logo_upload = multer({ storage : brand_logo_storage}).single('brand-logo');
  logo_upload(req,res,function(err) {
    if(err) {
        return res.end("Error uploading file.");
    }
    var brand = new Brand({title: req.body.title});
    brand.logo.url = '/uploads/brands/'+req.file.filename;
    brand.logo.path = req.file.path;
    brand.creator = req.user;
    brand.save(function(err) {
      if (err) {
        res.render('brands/new', err);
      } else {
        res.redirect('/brands');
      }
    });
  });
  
  

  
};

/**
 * Update a brand
 */
exports.update = function(req, res) {
  var brand = req.brand;
  brand.title = req.body.title;
  brand.content = req.body.content;
  brand.save(function(err) {
    if (err) {
      res.json(500, err);
    } else {
      res.json(brand);
    }
  });
};

/**
 * Delete a blog
 */
exports.destroy = function(req, res) {
  var brand = req.brand;

  brand.remove(function(err) {
    if (err) {
      res.json(500, err);
    } else {
      res.json(brand);
    }
  });
};

/**
 * Show a blog
 */
exports.show = function(req, res) {
  res.render('brands/show.ejs', {
     brand : req.brand

  });
  //res.json(req.brand);
};

/**
 * List of Blogs
 */
exports.all = function(req, res) {
  
  Brand.find({"creator": req.session.passport.user}).sort('-created').populate('creator', 'username').exec(function(err, brands) {
    if (err) {
      res.json(500, err);
    } else {
      res.render('brands/index.ejs', {
            brands : brands
      });
    }
  });
};

exports.publish = function(req, res,next){
  
  var promotion_image_upload = multer({ storage : promotion_imgae_storage}).single('promotion-image');
  
  
  promotion_image_upload(req,res,function(err) {
    if(err) {
        return res.end("Error uploading file.");
    }
    var promotion = new Promotion({message: req.body.message});
    if(req.file){
      promotion.image.url = '/uploads/promotions/'+req.file.filename;
      promotion.image.path = req.file.path;
    }
    promotion.publisher = req.brand._id;
    
    promotion.save(function(err) {
      if (err) {
        console.log(err);
      }

    });
    req.brand.promotions.push(promotion);   
    req.brand.save(function(err,data){
      console.log(err);
      console.log(data);
    }); 
  });

  res.redirect('/brands/'+req.brand._id);
};

