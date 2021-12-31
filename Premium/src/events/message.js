const client = require('../index')
const config = require('../config.json')
const { Collection } = require('discord.js')
const Timeout = new Collection()
const ms = require('ms')
const User = require('../database/schemas/User')


client.on('messageCreate', async message => {
  if (message.author.bot) return

  const prefix = config.prefix

  if (!message.content.startsWith(prefix)) return
  if (!message.guild) return

  const args = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g)
  const cmd = args.shift().toLowerCase()

  if (cmd.length == 0) return
  let command = client.commands.get(cmd)
  if (!command) command = client.commands.get(client.aliases.get(cmd))

  if (command) {
    let user = message.client.userSettings.get(message.author.id)

    if (!user) {
      const findUser = await User.findOne({ Id: message.author.id })
      if (!findUser) {
        const newUser = await User.create({ Id: message.author.id })
        message.client.userSettings.set(message.author.id, newUser)
        user = newUser
      } else return
    }

    // Command Cooldown, cooldown: 1000 * 60 * 60 for 1h etc...
    try {
      if (command.cooldown) {
        if (Timeout.has(`${command.name}${message.author.id}`))
          return message.channel.send(
            `You are on a \`${ms(
              Timeout.get(`${command.name}${message.author.id}`) - Date.now(),
            )}\` cooldown.`,
          )
        command.run(client, message, args, user)
        Timeout.set(
          `${command.name}${message.author.id}`,
          Date.now() + command.cooldown,
        )
        setTimeout(() => {
          Timeout.delete(`${command.name}${message.author.id}`)
        }, command.cooldown)
      } else command.run(client, message, args, user)
    } catch (error) {
      console.log(error)
      message.channel.send({ content: 'Something went wrong.' }) // If something goes wrong, log the error and error into the Channel "Something went wrong".
    }
  }
})