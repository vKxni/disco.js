const { Collection, Client } = require('discord.js')
const client = new Client({
  intents: [
    'GUILDS',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS',
    'GUILD_PRESENCES',
    'GUILD_MEMBERS',
    'DIRECT_MESSAGES'
  ],
  partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE'],
  allowedMentions: {
    parse: ['roles', 'users', 'everyone'],
    repliedUser: true,
  },
})

// Require Modules and Init the Client
const mongoose = require('./database/mongoose')
const path = require('path')
const fs = require('fs')

const config = require('./config.json')
module.exports = client

// Require the Bots Collections and Settings
client.commands = new Collection()
client.prefix = config.prefix
client.aliases = new Collection()
client.userSettings = new Collection()

// load the Command and Handlers for the Bot, commands not in these paths, won't work.
client.categories = fs.readdirSync(path.resolve('src/commands'))
;['command'].forEach(handler => {
  require(path.resolve(`src/handlers/${handler}`))(client)
})

// Init the Database and login the Bot
mongoose.init()
client.login(config.token)
