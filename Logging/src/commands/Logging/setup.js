"use strict";

const { SlashCommandBuilder } = require("@discordjs/builders");
const { CommandInteraction, Permissions } = require("discord.js");

// Database query
const Guild = require("../../models/logging");

module.exports.cooldown = {
    length: 10000, /* in ms */
    users: new Set()
};

/**
 * Runs ping command.
 * @param {CommandInteraction} interaction The Command Interaciton
 * @param {any} utils Additional util
 */
module.exports.run = async (interaction, utils) =>
{
    try
    {
        const isSetup = await Guild.findOne({ id: interaction.guild.id });
        const channel = interaction.options.getChannel("channel") || interaction.channel;
    
        if (!isSetup) {
          if (channel.type != "GUILD_TEXT") {
            interaction.reply({
              content: `${emojis.error} | This is not a valid channel!`,
              ephemeral: true,
            });
            return;
          }
    
          let webhookid;
          let webhooktoken;
    
          let newwebhook = await channel
            .createWebhook("Bottodir-Logging", {
              avatar:
                "https://media.discordapp.net/attachments/937076782404878396/941768103807840336/Zofia_Hund_R6.jpg?width=664&height=648",
            })
            .then((webhook) => {
              webhookid = webhook.id;
              webhooktoken = webhook.token;
            });
    
          const newLogs = new Guild({
            id: interaction.guild.id,
            channel: channel.id,
            webhookid: webhookid,
            webhooktoken: webhooktoken,
          });
          newLogs.save();
    
          interaction.reply({
            content: `Successfully set the logging Channel to ${channel}`,
            ephemeral: true,
          });
        }
    }
    catch (err)
    {
        return Promise.reject(err);
    }
};

module.exports.permissions = {
    clientPermissions: [Permissions.FLAGS.SEND_MESSAGES],
    userPermissions: [Permissions.FLAGS.ADMINISTRATOR]
};

module.exports.data = new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Setup logging")
    .addChannelOption((option) =>
    option
      .setName("channel")
      .setDescription("Select the channel to send log messages")
      .setRequired(false)
  )
