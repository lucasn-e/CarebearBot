const Discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord bot
const bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
let sourceChannel;
let targetChannel;
let currentMessage;
let adminRole;

bot.on('ready', function (event) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('messageCreate', function (user, userID, channelID, message, event) {
    // if message was sent in the source channel, save and delete it
    // and post it to the target channel
    // unless it was sent by our carebear. just delete if that's the care
    if (channelID == sourceChannel && user != 'Carebear'){
        currentMessage = message;
        bot.deleteMessage({channelID: channelID, messageID: event.d.id});
        if (!targetChannel){
            bot.sendMessage({
                to: channelID,
                message: 'Please set target channel first.'
            });
        }
        bot.sendMessage({
            to: targetChannel,
            message: currentMessage
        });
    } else if (channelID == sourceChannel && user == 'Carebear'){
        bot.deleteMessage({channelID: channelID, messageID: event.d.id});
    }

    // check if author of the message is admin
    let isAdmin = event.d.member.roles.some( (elem) => {
        return elem == adminRole;
    });

    // only accept commands from admins
    if (message.substring(0, 1) == '!' && isAdmin) {
        if (message == '!care help'){
            bot.sendMessage({
                to: channelID,
                message: 'Heya, I can\'t do much but here are my commands:\nUse `!care source` in the channel you wish the bot to listen in.\nUse `!care target` in your target channel, to tell the bot where to send the anonymous messages.'
            });
        } else if (message.includes('!care target')) {
            targetChannel = channelID;
            bot.sendMessage({
                to: channelID,
                message: 'current channel set as target'
            });
        } else if (message.includes('!care source')) {
            sourceChannel = channelID;
            bot.sendMessage({
                to: channelID,
                message: 'current channel set as source'
            });
        } else if (message.includes('!care setrole')) {
            adminRole = event.d.member.roles[0];
            bot.sendMessage({
                to: channelID,
                message: 'admin role set'
            });
        } else {
            bot.sendMessage({
                to: channelID,
                message: 'Invalid command, sorry.'
            });
        }
        bot.deleteMessage({channelID: channelID, messageID: event.d.id});
     } else if (!adminRole) {
         if (message.includes('!care setrole')){
            adminRole = event.d.member.roles[0];
            bot.sendMessage({
                to: channelID,
                message: 'admin role set'
            });
         } else {
            bot.sendMessage({
                to: channelID,
                message: 'no admin role set - please use !care setrole to set the bot admin role'
            });
         }
     }
});