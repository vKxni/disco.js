const Discord = require('discord.js')
const moment = require('moment')
const schema = require('../../database/schemas/Code')
const User = require('../../database/schemas/User')


module.exports = {
  name: 'redeem',
  category: 'Premium',
  description: 'Redeem a generated premium code.',

  run: async (client, message, args, user, guild) => {
   
    // Check if the user with a unique ID is in our database.
    user = await User.findOne({
      Id: message.author.id, // if you are using slash commands, swap message with interaction.
    })

    // Check Users input for a valid code. Like `!redeem ABCD-EFGH-IJKL`
    let code = args[0]

    // Return an error if the User does not include any Premium Code
    if (!code)
      return message.channel.send({
        embeds: [
          new Discord.MessageEmbed()
            .setColor('0xff0000')
            .setDescription(`**Please specify the code you want to redeem!**`),
        ],
      })

    // If the user is already a premium user, we dont want to save that so we return it.
    if (user && user.isPremium) {
      return message.channel.send({
        embeds: [
          new Discord.MessageEmbed()
            .setColor('0xff0000')
            .setDescription(`**> You already are a premium user**`),
        ],
      })
    }

    // Check if the code is valid within the database
    const premium = await schema.findOne({
      code: code.toUpperCase(),
    })

    // Set the expire date for the premium code
    if (premium) {
      const expires = moment(premium.expiresAt).format(
        'dddd, MMMM Do YYYY HH:mm:ss',
      )

      // Once the code is expired, we delete it from the database and from the users profile
      user.isPremium = true
      user.premium.redeemedBy.push(message.author)
      user.premium.redeemedAt = Date.now()
      user.premium.expiresAt = premium.expiresAt
      user.premium.plan = premium.plan

      // Save the User within the Database
      user = await user.save({ new: true }).catch(() => {})
      client.userSettings.set(message.author.id, user)
      await premium.deleteOne().catch(() => {})

      // Send a success message once redeemed
      message.channel.send({
        embeds: [
          new Discord.MessageEmbed()
            .setTitle('Premium Redeemed')
            .setDescription(
              `**You have successfully redeemed premium!**\n\n\`Expires at: ${expires}\``,
            )
            .setColor('0x5eff00')
            .setTimestamp(),
        ],
      })

      // Error message if the code is not valid.
    } else {
      return message.channel.send({
        embeds: [
          new Discord.MessageEmbed()
            .setColor('0xff0000')
            .setDescription(
              `**The code is invalid. Please try again using valid one!**`,
            ),
        ],
      })
    }
  },
}