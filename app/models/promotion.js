
var appRoot   = require('app-root-path');
var share = require(appRoot+'/app/libs/social-sharing');


var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


var PromotionSchema = new Schema({
  message: {
    type         : String,
  },
  image: {
    url   : String,
    path  : String
  },
  facebook:{
    post_id   : String

  },
  twitter:{
    twit_id : String
  },
  created: Date,
  updated: [Date],
  publisher:{
    type : Schema.ObjectId,
    ref  : 'Brand'
  }

});

/**
 * Pre hook.
 */
PromotionSchema.pre('save', function(next, done){
  if (this.isNew)
    this.created = Date.now();

  this.updated.push(Date.now());

  next();
});

PromotionSchema.post('save', function(doc){
  share.facebookPost(doc);
  share.twitterPost(doc);
});

/**
 * Statics
 */
PromotionSchema.statics = {
  load: function(id, cb) {
    this.findOne({
      _id: id
    }).populate('publisher').exec(cb);
  }
};




mongoose.model('Promotion', PromotionSchema);
