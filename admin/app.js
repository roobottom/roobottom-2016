/*

user types `note`

	notebot says: "Say `title`, `tags`, `images` or `body`. Say `/exit` to cancel, or `/save` to save the note." (firstResponse)
	app starts a new post array in memory

user says: `title`

	notebot says: "Tell me the title of your new post"
	user types the title
	app pushes title into array
	notebot says: "OK, Title is <title>", then firstResponse

user says: `tags`

	notebot says: "Type tags, say `/tags` when you're done"
	user types n tags
	app pushes tag into array.tags
	notebot says: "Tag <tag> added, type more or type `/tags` to finish"
	user types `/tags`
	notebot says: "OK, tags are [<tag>,<tag>,etc]", then firstResponse

user says: `images`

	notebot says: "Here's the images in the inbox:"
	app pushes images in inbox to notebot
	notebot says: "Type the id(s) of the images you want to include, or say `all`"
	

*/

var _ = require('lodash');
var Botkit = require('botkit');
var extractor = require('unfluff');

	var controller = Botkit.slackbot({
	  debug: false
	});

	// connect the bot to a stream of messages
	controller.spawn({
	  token: 'xoxb-21165613684-zvutqBEKj4rqaOCNPou5IiMD',
	}).startRTM()

	// give the bot something to listen for.
	controller.hears('new','direct_message',function(bot,message) {

	  bot.startConversation(message,function(err,convo) {

      var note = {};
      note.attributes = {};

      var attributes = [
        'title',
        'tags',
        'images'
      ]

      var firstResponse = {
	      text: "Recent images you've uploaded",
	      //username: "ReplyBot",
	      //icon_emoji: ":dash:",
				"attachments": [
        {
            "fallback": "Required plain-text summary of the attachment.",

            "color": "#36a64f",

            //"pretext": "Optional text that appears above the attachment block",

            //"title": "Slack API Documentation",
            //"title_link": "https://api.slack.com/",

            "text": "Image `A`",

            // "fields": [
            //     {
            //         "title": "Priority",
            //         "value": "High",
            //         "short": false
            //     }
            // ],

            "image_url": "http://www.andrew.cmu.edu/user/cfperron/cats/images/cat7.jpg",
            "thumb_url": "http://www.andrew.cmu.edu/user/cfperron/cats/images/cat7.jpg"
        }
    ]
	    };

      convo.ask(firstResponse,[

        {
	        pattern: 'title',
	        callback: function(response,convo) {
	          convo.say('you said title');
            convo.repeat();
            convo.next();
	        }
	      },
        {
	        pattern: 'tags',
	        callback: function(response,convo) {
	          convo.say('You said tags');
            convo.repeat();
            convo.next();
	        }
	      },
        {
          default: true,
          callback: function(response,convo) {

            console.log(response);

            if(response.sub_type === 'file_share') {
              console.log(response.file.permalink_public);
              console.log(extractor(response.file.permalink_public));
            }

            convo.repeat();
            convo.next();
          }
        }

      ]);
    });

	});


//controller.on(‘file_shared’,function(bot,message) {…});
//no you need to pass an authentication header in your request for the file
