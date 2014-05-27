var pinoccio = require('pinoccio'),
    twitter = require('twit');

// Pinoccio API
var pinoccioAPI = pinoccio("asdf");

// Twitter API
var twitterAPI = new twit({
  consumer_key:         'asdf',
  consumer_secret:      'asdf',
  access_token:         'asdf',
  access_token_secret:  'asdf'
});

// Open the tweet stream, and act on incoming tweets
var tweetStream = twitter.stream('user');

tweetStream.on('tweet', function(tweet){

  // change links back into their original text
  tweet.entities.urls.forEach(function(url){
    tweet.text = tweet.text.replace(url.url, url.display_url);
  });

  // If this was a command tweet to our Scout
  var match = /^@pinocciodev\b.*>(.+)/gi.exec(tweet.text);

  if (match) {

    var command = match[1];
    console.log('got command `'+command+'` from @'+tweet.user.screen_name);

    // send the command to the scout
    pinoccioAPI.rest({url:'/v1/27/2/command', method:'post', data:{command: command}}, function(err, res){
      if (res) {
        var reply = '@'+tweet.user.screen_name+' '+(res.reply.trim() || '✔');
        twitter.post('statuses/update', {status: reply, in_reply_to_status_id:tweet.id}, function(err, data, res){
          console.log(err || 'replied with "'+reply+'"');
        })
      };
    });
  };
})