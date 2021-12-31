"use strict";

const { GuildMember, MessageEmbed, Role } = require("discord.js");
const Guild = require("../models/welcome.js");
const client = require("../util/bot.js");

module.exports.data = {
  name: "guildMemberAdd",
  once: false,
};

/**
 * Handle the clients ready event.
 * @param {GuildMember} member The client that triggered the event.
 */

module.exports.run = async (member) => {
  try {
    const embed = new MessageEmbed()
      .setTitle("👋 Welcome!")
      .setDescription(`Welcome to **${member.guild.name}** ${member}!`)
      .setColor("GREEN")
      .setTimestamp()
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter(member.guild.name, member.displayAvatarURL({ dynamic: true }));
    

    // Query the database for the Guilds Settings (Channel)
    const guildQuery = await Guild.findOne({ id: member.guild.id });
    const role = member.guild.roles.cache.find(
      (role) => role.id == guildQuery.role
    );
    if (guildQuery) {
      
      // Sending message when new user joins the Server.
      const guild = member.client.guilds.cache.get(member.guild.id);
      const logging = guild.channels.cache.get(guildQuery.channel);
      logging.send({ embeds: [embed] });

      member.roles.add(role); // role.id
    }

    if (!guildQuery) return;
  } catch (err) {
    return Promise.reject(err);
  }
};
