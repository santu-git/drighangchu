var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var BrandSchema = new Schema({
  title: {
    type         : String,
    index        : true,
    required     : true
  },
  logo :{
    url   : String,
    path  : String
  },
  facebook: {
    id           : String,
    token        : String,
    email        : String,
    name         : String
  },
  twitter: {
    id           : String,
    token        : String,
    token_secret : String,
    username     : String,
    displayName  : String
  },
  google: {
    id           : String,
    token        : String,
    email        : String,
    name         : String
  },
  created: Date,
  updated: [Date],
  creator: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  promotions: [{type: Schema.ObjectId, ref : 'Promotion'}]
});

/**
 * Pre hook.
 */

BrandSchema.pre('save', function(next, done){
  if (this.isNew)
    this.created = Date.now();

  this.updated.push(Date.now());

  next();
});

/**
 * Statics
 */
BrandSchema.statics = {
  load: function(id, cb) {
    this.findOne({
      _id: id,
    }).populate('creator', 'username').populate('promotions').exec(cb);
  }
};

/**
 * Methods
 */

BrandSchema.statics.findByTitle = function (title, callback) {
  return this.find({ title: title }, callback);
}

BrandSchema.methods.expressiveQuery = function (creator, date, callback) {
  return this.find('creator', creator).where('date').gte(date).run(callback);
}

/**
 * Plugins
 */

function slugGenerator (options){
  options = options || {};
  var key = options.key || 'title';

  return function slugGenerator(schema){
    schema.path(key).set(function(v){
      this.slug = v.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/-+/g, '');
      return v;
    });
  };
};

BrandSchema.plugin(slugGenerator());

/**
 * Define model.
 */

mongoose.model('Brand', BrandSchema);