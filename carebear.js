const Discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord client
const client = new Discord.Client({
   token: auth.token,
   autorun: true
});
let sourceChannel;
let targetChannel;
let currentMessage;

client.on('ready', function (event) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(client.username + ' - (' + client.id + ')');
});

client.on('messageCreate', function (user, userID, channelID, message, event) {
    // if message was sent in the source channel, save and delete it
    // and post it to the target channel
    // unless it was sent by our carebear. just delete if that's the care
    if (channelID == sourceChannel && user != 'Carebear'){
        currentMessage = message;
        client.deleteMessage({channelID: channelID, messageID: event.d.id});
        if (!targetChannel){
            client.sendMessage({
                to: channelID,
                message: 'Please set target channel first.'
            });
        }
        client.sendMessage({
            to: targetChannel,
            message: currentMessage
        });
    } else if (channelID == sourceChannel && user == 'Carebear'){
        client.deleteMessage({channelID: channelID, messageID: event.d.id});
    }

    // check if author of the message is admin
    let isAdmin = event.d.member.roles.some( (elem) => {
        return elem == '566371725126664204';
    });

    // only accept commands from admins
    if (message.substring(0, 1) == '!' && isAdmin) {
        if (message == '!care help'){
            client.sendMessage({
                to: channelID,
                message: 'Heya, I can\'t do much but here are my commands:\nUse `!care source` in the channel you wish the bot to listen in.\nUse `!care target` in your target channel, to tell the bot where to send the anonymous messages.'
            });
        } else if (message.includes('!care target')) {
            targetChannel = channelID;
                client.sendMessage({
                    to: channelID,
                    message: 'current channel set as target'
                });
        } else if (message.includes('!care source')) {
            sourceChannel = channelID;
                client.sendMessage({
                    to: channelID,
                    message: 'current channel set as source'
                });
        } else {
            client.sendMessage({
                to: channelID,
                message: 'Invalid command, sorry.'
            });
        }
        client.deleteMessage({channelID: channelID, messageID: event.d.id});
     }
});