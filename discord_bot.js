var Discord = require("discord.js");
var d20 = require("d20");

// Authentication token
var token = process.env.AUTH_TOKEN;
if(!token) {
  console.log("Please set the AUTH_TOKEN environment variable with a token.\n");
  process.exit();
}

// Debug mode
var debug = process.env.APP_DEBUG;
if(!debug) {
  debug = false;
}

var startTime = Date.now();

// Util function to choose a random from array
var randomFromArray = function(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Util function to convert string to Title Case
String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

// Util function that returns a user tag
var tagUser = function(user) {
  return "<@" + user.id + ">";
}

var removeRegions = function(msg, cb) {
  var user = msg.sender;

  var regions = regionRoles(msg);

  user.removeFrom(regions, function(err) {
    if (!err) {
      console.log('Region roles removed for user: ' + user.username);
      cb();
    } else {
      console.log('Error removing region roles for user: ' + user.username, err);
    }

  });
}

var logMessage = function(bot, message, channelname) {
  if (!channelname) {
    channelname = 'user-logs';
  }
  var channel = bot.channels.get("name", channelname);
  bot.sendMessage(channel, message);
}

var setRole = function(msg, rolename) {
  var user = msg.sender;
  var role = msg.channel.server.roles.get("name", rolename);
  var message = "";
  if (!user.hasRole(role)) {
    user.addTo(role);
    message = user + " has been added to " + role.name;
  } else {
    message = user + " already has " + role.name; 
  }
  return message;
}

var unsetRole = function(msg, rolename) {
  var user = msg.sender;
  var role = msg.channel.server.roles.get("name", rolename);
  var message = "";
  if (user.hasRole(role)) {
    user.removeFrom(role);
    message = user + " has been removed from " + role.name;
  } else {
    message = user + " does not have " + role.name;
  }
  console.log("message", message)
  return message;
}

var regionRoles = function(msg) {
  var regionArray = [
    msg.channel.server.roles.get("name", "Europe"),
    msg.channel.server.roles.get("name", "North America"),
    msg.channel.server.roles.get("name", "South America"),
    msg.channel.server.roles.get("name", "Middle East"),
    msg.channel.server.roles.get("name", "Oceania"),
    msg.channel.server.roles.get("name", "Africa"),
    msg.channel.server.roles.get("name", "Asia")
  ];
  
  return regionArray;
}

var welcomeMessage = "Welcome to Gaymers! \n" +
  "type `!help` to see how I work. \n" +
  "To set your region type `!setregion YOUR-REGION-HERE` in any channel. \n" +
  "For help on what regions are available type `!regions` in any channel. \n" +
  "To gain access to the #over-18 channel, type `!set18` in any channel. \n" +
  "If you have any questions, use the `@admin` command or PM one of the admins. \n" +
  "Please review our rules here: https://goo.gl/670LtP";
  
var welcomeBackMessage = "Welcome back to Gaymers! \n" +
  "type `!help` to see how I work. \n" +
  "To set your region type `!setregion YOUR-REGION-HERE` in any channel. \n" +
  "For help on what regions are available type `!regions` in any channel. \n" +
  "To gain access to the #over-18 channel, type `!set18` in any channel. \n" +
  "If you have any questions, use the `@admin` command or PM one of the admins. \n" +
  "Please remember our rules that are available here: https://goo.gl/670LtP";
  
var regionMessage = "To set your region type `!setregion YOUR-REGION-HERE` in any channel. \n" +
  "Here is the list of available regions: \n";

var hugReplies = [
  '*hugs $USER*',
  '*hugs $USER*',
  '*hugs $USER*',
  '*hugs $USER*',
  '*licks $USER*',
  '*pounces $USER*',
  '*jumps on $USER*',
  '*glomps $USER*',
  '*falls on $USER*',
  '*bear hugs $USER*',
  '*tightly squeezes $USER*',
  '*embraces $USER*',
  '*holds $USER close*',
  '*cuddles $USER*',
  '*takes $USER into his arms*'
];

var pokeReplies = [
  'STOP TOUCHING ME!',
  'LEAVE ME ALONE',
  'can I go home now?',
  'It\'s dark in here..',
  'AAAAAAAAAAAAH',
  'NO',
  '*giggles*',
  '*moans*',
  ';)',
  ':(',
  'h-hello?',
  '*pokes back*',
  'D: not there!',
  'A bit lower...',
  'WHAT DO YOU WANT?!',
  'bleep',
  'Well hello there ;)',
  '*blush* not now! everybody is watching..',
  '*falls over*',
  '*winks*',
  'N-nani',
  'Don\'t stop there.',
  'More please ;)',
  'Only one finger?',
  'Come here ;)'
];

var slapReplies = [
  '*slaps $USER around a bit with a large, girthy trout*',
  '*slaps $USER with a meaty sausage*',
  '*slaps $USER with a massive bag of spaghetti*'
];

var commands = {
  "ping": {
    description: "responds pong, useful for checking if bot is alive",
    process: function(bot, msg, suffix) {
      bot.sendMessage(msg.channel, msg.sender + " pong!");
    }
  },

  "roll": {
    usage: "[# of sides] or [# of dice]d[# of sides]( + [# of dice]d[# of sides] + ...)",
    description: "Roll one die with x sides, or multiple dice using d20 syntax. Default value is 10",
    process: function(bot, msg, suffix) {
      if (suffix.split("d").length <= 1) {
        bot.sendMessage(msg.channel, msg.author + " rolled a " + d20.roll(suffix || "10"));
      } else if (suffix.split("d").length > 1) {
        var eachDie = suffix.split("+");
        var passing = 0;
        for (var i = 0; i < eachDie.length; i++) {
          if (eachDie[i].split("d")[0] < 50) {
            passing += 1;
          };
        }
        if (passing == eachDie.length) {
          bot.sendMessage(msg.channel, msg.author + " rolled a " + d20.roll(suffix));
        } else {
          bot.sendMessage(msg.channel, msg.author + " tried to roll too many dice at once!");
        }
      }
    }
  },
  "uptime": {
    usage: "uptime",
    description: "Returns the amount of time since the bot started",
    process: function(bot, msg, suffix) {
      var now = Date.now();
      var msec = now - startTime;
      console.log("Uptime is " + msec + " milliseconds");
      var days = Math.floor(msec / 1000 / 60 / 60 / 24);
      msec -= days * 1000 * 60 * 60 * 24;
      var hours = Math.floor(msec / 1000 / 60 / 60);
      msec -= hours * 1000 * 60 * 60;
      var mins = Math.floor(msec / 1000 / 60);
      msec -= mins * 1000 * 60;
      var secs = Math.floor(msec / 1000);
      var timestr = "";
      if (days > 0) {
        timestr += days + " days ";
      }
      if (hours > 0) {
        timestr += hours + " hours ";
      }
      if (mins > 0) {
        timestr += mins + " minutes ";
      }
      if (secs > 0) {
        timestr += secs + " seconds ";
      }
      bot.sendMessage(msg.channel, "Uptime: " + timestr);
    }
  },
  "regions": {
    usage: "regions",
    description: "List the available regions.",
    process: function(bot, msg, suffix) {
      var message = regionMessage;
      
      var regions = regionRoles(msg);
          
      for (var i = 0; i < regions.length; i++) {
        if (i === 0) {
          message = message + regions[i].name;
        } else {
          message = message + ", " + regions[i].name;
        }
      }
      
      bot.sendMessage(msg.channel, message);
    }
  },
  "setregion": {
    usage: "setregion <region>",
    description: "Set your region, get pretty color.",
    process: function(bot, msg, suffix) {
      var region = suffix.toProperCase();
      var role = msg.channel.server.roles.get("name", region);

      if (suffix) {
        removeRegions(msg, function() {
          console.log('adding role');
          msg.sender.addTo(role, function(err) {
            if (!err) {
              var message = msg.sender + " set region to " + region;
              bot.sendMessage(msg.channel, message);
            }
          });
        });
      }
    }
  },
  "unsetregion": {
    usage: "unsetregion",
    description: "Remove your region, remain mysterious.",
    process: function(bot, msg) {
      removeRegions(msg);
      var message = msg.sender + " region removed.";
      bot.sendMessage(msg.channel, message);
    }
  },
  "set18": {
    usage: "set18",
    description: "sets 18+, gives access to #over-18",
    process: function(bot, msg) {
      var message = setRole(msg, "18+");
      bot.sendMessage(msg.channel, message);
    }
  },
  "unset18": {
    usage: "unset18",
    description: "unsets 18+",
    process: function(bot, msg) {
      var message = unsetRole(msg, "18+");
      bot.sendMessage(msg.channel, message);
    }
  },
  "setlol": {
    usage: "setlol",
    description: "sets League of Legends",
    process: function(bot, msg) {
      var message = setRole(msg, "League of Legends");
      console.log('setlol', message);
      bot.sendMessage(msg.channel, message);
    }
  },
  "unsetlol": {
    usage: "unsetlol",
    description: "unsets League of Legends",
    process: function(bot, msg) {
      var message = unsetRole(msg, "League of Legends");
      console.log(message);
      console.log('unsetlol', message);
      bot.sendMessage(msg.channel, message);
    }
  },
  "settts": {
    usage: "settts",
    description: "sets Table Top Simulator",
    process: function(bot, msg) {
      var message = setRole(msg, "Table Top Simulator");
      bot.sendMessage(msg.channel, message);
    }
  },
  "unsettts": {
    usage: "unsettts",
    description: "unsets Table Top Simulator",
    process: function(bot, msg) {
      var message = unsetRole(msg, "Table Top Simulator");
      bot.sendMessage(msg.channel, message);
    }
  },
  "spray": {
    usage: "spray <user>",
    description: "Spray someone thirsty...",
    process: function(bot, msg) {
      bot.sendMessage(msg.channel, "*sprays " + msg.sender + " with the fire hose*");
    }
  },

  "hug": {
    usage: "hug <user>",
    description: "hug",
    process: function(bot, msg, suffix) {
      var args = suffix.split(' ');
      var user = args.shift();
      if (suffix) {
        var message = randomFromArray(hugReplies).replace('$USER', user)
        bot.sendMessage(msg.channel, message);
      } else {
        var message = randomFromArray(hugReplies).replace('$USER', msg.sender);
        bot.sendMessage(msg.channel, message);
      }
    }
  },

  "slap": {
    usage: "slap <user>",
    description: "slap",
    process: function(bot, msg, suffix) {
      var args = suffix.split(' ');
      var user = args.shift();
      if (suffix) {
        var message = randomFromArray(slapReplies).replace('$USER', user)
        bot.sendMessage(msg.channel, message);
      } else {
        var message = randomFromArray(slapReplies).replace('$USER', msg.sender);
        bot.sendMessage(msg.channel, message);
      }
    }
  },

  "poke": {
    description: "Poke Discobot :3",
    process: function(bot, msg) {
      bot.sendMessage(msg.channel, randomFromArray(pokeReplies));
    }
  },

  "suggest": {
    usage: "!suggest <suggestion to send devs>",
    description: "Suggest a new bot feature!",
    process: function(bot, msg, suffix) {
      if (suffix) {
        var message = "Thanks for the suggestion, I've PM'd it to a developer."

        if(!msg.channel.recipient){
          var chan = msg.channel;  
          var devRole = chan.server.roles.get("name", "bot-dev");
          var devUsers = chan.server.usersWithRole(devRole);

          for (var devUser in devUsers){
            var devMsg = tagUser(msg.sender)+" has suggested: \n```\n"+suffix+"\n```";
            bot.sendMessage(devUsers[devUser], devMsg);
          }
          bot.sendMessage(msg.channel, message);

        }
        else{
          var message = "I cant take suggestions in private, sorry!"
          bot.sendMessage(msg.author, message);
        }
      }
      else {
        var message = "If you have something to say, then say it!"
        bot.sendMessage(msg.channel, message);
      }
    }
  },
  "lapdance": {
    description: "have a *sexy* lapdance",
    process: function(bot, msg) {

      // Hax to detect PMs
      if (msg.channel.recipient) {
        bot.sendMessage(msg.channel, "I don't give private shows, you ***freak!***");
      } else if (msg.sender.hasRole(msg.channel.server.roles.get("name", "Admin"))) {
        var message = '*gives $USER a sexy lapdance*';
        bot.sendMessage(msg.channel, message.replace('$USER', msg.sender));
      } else {
        bot.sendMessage(msg.channel, 'NO!');
      }
    }
  },
  "currentlyplaying": {
    usage: "!currentlyplaying",
    description: "See a list of who's playing what",
    process: function(bot,msg) {
      var output = "Currently being played:\n";
      
      var userList = bot.internal.users.getAll("status","online");
      var gamers = "";

      for (var i = 0; i < userList.length; i++) {
        var isBot = userList[i].bot;
        var username = tagUser(userList[i]);
        var game = userList[i].game;

        if (!isBot && game) {
          gamers += "\t"+username + " is currently playing "+ game.name+"\n";
        }
      }
      if (gamers == ""){
        gamers = "No Games! :(";
      }
      output += gamers
      output += "";

      bot.sendMessage(msg.author, output);

    }
  },
  "whoisplaying": {
    usage: "<game>",
    description: "Find out who's playing a specific game",
    process: function(bot,msg,suffix) {

      var targetGame = suffix.toProperCase();
      var output = "People that are currently playing " +targetGame+":\n";
      var userList = bot.internal.users.getAll("status","online");
      var gamers = "";

      for (var i = 0; i < userList.length; i++) {
        var isBot = userList[i].bot;
        var username = tagUser(userList[i]);
        var game = userList[i].game;

        if (!isBot && game) {
          if (targetGame == game.name){
            gamers += "\t"+username + " is currently playing "+ game.name+"\n";
          }
        }
      }

      if (gamers == ""){
        gamers = "Nobody! :(";
      }

      output += gamers
      output += "";

      bot.sendMessage(msg.author, output);

    }
  },
  "choose": {
    usage: "!choose <one> <two> <three> <etc>",
    description: "Let DiscoBot choose for you",
    process: function(bot,msg,suffix){

  formats = [
    "I think \"%\" is the best choice",
    "I've decided on \"%\"",
    "Definitely \"%\"",
    "\"%\" would be best",
    "After much deliberation, \"%\"",
    "I reckon \"%\"",
    "I choose \"%\""
  ];

    var options = suffix.split(/\s*[ ,;]\s*|\sor\s/i)
    var choice = options[Math.floor(Math.random()*options.length)];
    var format = formats[Math.floor(Math.random()*formats.length)];

    if(msg.channel.recipient){
      // from pm - TODO proper channel distinction
      var to = msg.author;
    }
    else {
      var to = msg.channel
    }

    bot.sendMessage(to, format.replace("%", choice));

    }
  },
  "8ball": {
    usage: "!8ball",
    description: "See the future, have DiscoBot read your fortune.",
    process: function(bot,msg,suffix){

      ball = [
        "It is certain",
        "It is decidedly so",
        "Without a doubt",
        "Yes – definitely",
        "You may rely on it",
        "As I see it, yes",
        "Most likely",
        "Outlook good",
        "Signs point to yes",
        "Yes",
        "Reply hazy, try again",
        "Ask again later",
        "Better not tell you now",
        "Cannot predict now",
        "Concentrate and ask again",
        "Don't count on it",
        "My reply is no",
        "My sources say no",
        "Outlook not so good",
        "Very doubtful",
      ];

      var choice = ball[Math.floor(Math.random()*ball.length)];

      if(suffix){
        if(msg.channel.recipient){
          // from pm - TODO proper channel distinction
          var to = msg.author;
        }
        else {
          var to = msg.channel;
        }
        bot.sendMessage(to, choice);
      }
    }
  },
  "getavideoroom": {
    usage: "",
    description: "Generates a sync-video room and shares it to chat.",
    process: function(bot,msg,suffix){

      function getPathFromUrl(url) {
        return url.split(/[?#]/)[1];
      }

      if(!suffix){
        // work around for not being able to inject video from nodejs side.
        suffix = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      }

      var proto = "http://";
      var host = "sync-youtube.com";
      var video = getPathFromUrl(suffix);
      var path = '/watch?'+video;
      var link = proto + host + path;

      var http = require('follow-redirects').http;
      //var https = require('follow-redirects').https;

      var options = {
        host: host,
        path: path,
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36',
            'accept': '*/*'         
        }
      };

      var req = http.request(options, function (res) {
        bot.sendMessage(msg.channel,"Sync-video link:\n "+ res.fetchedUrls[0]);
      });

      req.end();
    }
  },
};

var bot = new Discord.Client();

bot.on("ready", function() {
  console.log("Ready to begin! Serving in " + bot.channels.length + " channels");
  // require("./plugins.js").init();
});

bot.on("disconnected", function() {
  console.log("Disconnected!");
  process.exit(1); //exit node.js with an error

});

bot.on("message", function(msg) {
  //check if message is a command
  if (msg.author.id != bot.user.id && (msg.content[0] === '!' || msg.content.indexOf(bot.user.mention()) == 0)) {
    console.log("treating " + msg.content + " from " + msg.author + " as command");
    var cmdTxt = msg.content.split(" ")[0].substring(1);
    var suffix = msg.content.substring(cmdTxt.length + 2); //add one for the ! and one for the space
    if (msg.content.indexOf(bot.user.mention()) == 0) {
      try {
        cmdTxt = msg.content.split(" ")[1].toLowerCase();
        suffix = msg.content.substring(bot.user.mention().length + cmdTxt.length + 2);
      } catch (e) { //no command
        bot.sendMessage(msg.channel, "Yes?");
        return;
      }
    }
    var cmd = commands[cmdTxt.toLowerCase()];
    if (cmdTxt === "help") {
      //help is special since it iterates over the other commands
      bot.sendMessage(msg.author, "Available Commands:", function() {
        var cmdString = '```\n';
        for (var cmd in commands) {
          var info = "!" + cmd;
          var usage = commands[cmd].usage;
          if (usage) {
            info += "\t" + usage;
          }
          var description = commands[cmd].description;
          if (description) {
            info += "\t" + description;
          }
          cmdString += info + "\n";
        }
        cmdString += "```";
        bot.sendMessage(msg.author, cmdString);
      });
    } else if (cmd) {
      try {
        cmd.process(bot, msg, suffix);
      } catch (e) {
        if (debug) {
          bot.sendMessage(msg.channel, "command " + cmdTxt + " failed :(\n" + e.stack);
        }
      }
    }
  } else {
    //message isn't a command or is from us
    //drop our own messages to prevent feedback loops
    if (msg.author == bot.user) {
      return;
    }

    if (msg.author != bot.user && msg.isMentioned(bot.user)) {
      bot.sendMessage(msg.channel, msg.author + ", you called?");
    }
  }
});

// Fires on new member http://discordjs.readthedocs.io/en/latest/docs_client.html#servernewmember
bot.on("serverNewMember", function(server, user) {
  if (user.username) {
    logMessage(bot, tagUser(user) + " joined the server.");
    logMessage(bot, "Welcome, " + tagUser(user) + "!", "general");
    bot.sendMessage(user, welcomeMessage);
  }
});

// Fires on new member http://discordjs.readthedocs.io/en/latest/docs_client.html#servermemberremoved
bot.on("serverMemberRemoved", function(server, user) {
  logMessage(bot, tagUser(user) + " left the server.");
});

// Fires on ban http://discordjs.readthedocs.io/en/latest/docs_client.html#userbanned
bot.on("userBanned", function(user, server) {
  logMessage(bot, tagUser(user) + " was banned from the server.");
});

// Fires on unban http://discordjs.readthedocs.io/en/latest/docs_client.html#userunbanned
bot.on("userUnbanned", function(user, server) {
  logMessage(bot, tagUser(user) + " was unbanned from the server.");
});

// Fires on user changes http://discordjs.readthedocs.io/en/latest/docs_client.html#presence
bot.on("presence", function(userOld, userNew) {
  if (userOld.status != userNew.status) {
    // Implied status change
    //logMessage(bot,"user: "+userNew.username+", status: "+userNew.status);
  }
  if (userNew.game) {
    // user is playing a game, null if not http://discordjs.readthedocs.io/en/latest/docs_user.html#game
    //logMessage(bot,"user: "+userNew.username+", is now playing: "+userNew.game.name);
  }
  if (userOld.username != userNew.username) {
    // username change, likely due to rejoin.
    logMessage(bot, tagUser(userNew) + " rejoined the server");
    logMessage(bot, "Welcome back, " + tagUser(userNew) + "!", "general");
    bot.sendMessage(userNew, welcomeBackMessage);
  }
});

exports.addCommand = function(commandName, commandObject) {
  try {
    commands[commandName] = commandObject;
  } catch (err) {
    console.log(err);
  }
}
exports.commandCount = function() {
  return Object.keys(commands).length;
}

bot.loginWithToken(token);