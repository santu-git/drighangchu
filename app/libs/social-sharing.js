
var mongoose  = require('mongoose'),
    Brand     = mongoose.model('Brand'),
    fs        = require('fs'),
    appRoot   = require('app-root-path');
    //url       = require('url');

exports.facebookPost = function(promotion){
  Brand.findOne({_id: promotion.publisher}).exec(function(err,publisher){
    var FB = require('fb');
    FB.setAccessToken(publisher.facebook.token);
    // //FB.api('me/photos', 'post', { message: req.body.message, source:  fs.createReadStream(req.file.path)}, function (res) {
    if (promotion.image && promotion.image.url){
      FB.api('me/photos', 'post', { message: promotion.message, url:  'http://drighangchu.herokuapp.com'+promotion.image.url}, function (res) {
        if(!res || res.error) {
          console.log(!res ? 'error occurred' : res.error);
          return;
        }
        promotion.update({facebook:{post_id: res.id}},function(err,raw){
          if(err)
            console.log(err);
          console.log(raw);
        });
        console.log('With image Post Id: ' + res.id);
      });
    }else{
      FB.api('me/feed', 'post', { message: promotion.message}, function (res) {
        if(!res || res.error) {
          console.log(!res ? 'error occurred' : res.error);
          return;
        }
        promotion.update({facebook:{post_id: res.id}},function(err,raw){
          if(err)
            console.log(err);
          console.log(raw);
        });
        console.log('Post Id: ' + res.id);
      });
    } 
  });
}

exports.twitterPost = function(promotion){
  Brand.findOne({_id: promotion.publisher}).exec(function(err,publisher){
    var soicalCredentails = require(appRoot+'/config/social-credentials');
    var Twit = require('twit');
    var T = new Twit({
      consumer_key:         soicalCredentails.twitterAuth.consumerKey,
      consumer_secret:      soicalCredentails.twitterAuth.consumerSecret,
      access_token:         publisher.twitter.token,
      access_token_secret:  publisher.twitter.token_secret,
      timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests. 
    });
    if (promotion.image && promotion.image.path){
      var b64content = fs.readFileSync(promotion.image.path, { encoding: 'base64' });
      T.post('media/upload', { media_data: b64content }, function(err, data, response) {
        var mediaIdStr = data.media_id_string
        var params = { status: promotion.message, media_ids: [mediaIdStr] }
        T.post('statuses/update', params, function (err, data, response) {
          if (err)
            console.log(err);
          promotion.update({twitter:{twit_id: data.id}},function(err,raw){
            if(err)
              console.log(err);
            console.log(raw);
          });
        });
      });
    }else{
      T.post('statuses/update', { status: promotion.message }, function(err, data, response) {
        if (err)
            console.log(err);
        promotion.update({twitter:{twit_id: data.id}},function(err,raw){
          if(err)
            console.log(err);
          console.log(raw);
        });
      });
    }
  });
}
