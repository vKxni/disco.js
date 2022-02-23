"use strict";

const { GuildMember, MessageEmbed, WebhookClient } = require("discord.js");

// Database queries
const Guild = require("../models/logging");

module.exports.data = {
  name: "messageDelete",
  once: false,
};

/**
 * Handle the clients event.
 * @param {GuildMember} member The client that triggered the event.
 * @param {CommandInteraction} interaction The Command Interaciton
 */

module.exports.run = async (message) => {
  try {
    
    if(message.author.bot) return;

    const embed = new MessageEmbed()
      .setTitle(`:x: | Message deleted`)
      .setDescription(`[Message](${message.url})\nFrom ${message.author.tag}\n\nDeleted message:\n**${message.content ? message.content : "None"}**`.slice(0, 4096))
      .setColor("RED")
      .setTimestamp()
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Member: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true })})
    

    // Query the database for the Guilds Settings (Channel)
    const guildQuery = await Guild.findOne({ id: message.guild.id });
    if (!guildQuery) return;

    if (guildQuery) {
      const webhookid = guildQuery.webhookid;
      const webhooktoken = guildQuery.webhooktoken;

      const webhookClient = new WebhookClient({ id: webhookid, token: webhooktoken });
    
      webhookClient.send({ embeds: [embed]});
    }
  } catch (err) {
    return Promise.reject(err);
  }
};