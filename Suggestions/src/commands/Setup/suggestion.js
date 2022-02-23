"use strict";

const { SlashCommandBuilder } = require("@discordjs/builders");
const { CommandInteraction, MessageEmbed } = require("discord.js");

// Database queries
const Guild = require("../../models/suggestions");

module.exports.cooldown = {
  length: 10000,
  users: new Set(),
};

/**
 * @param {CommandInteraction} interaction
 */

module.exports.run = async (interaction) => {
  
    // Check if the guild has some data in the database.
    const guildQuery = await Guild.findOne({ id: interaction.guild.id });
    const channel = interaction.options.getChannel("channel") || interaction.channel;

    // If not data, create new data.
    if (!guildQuery) {
      const newLogs = new Guild({
        id: interaction.guild.id,
        channel: channel.id,
      });
      newLogs.save();
      interaction.reply({
        content: `Successfully set the suggestion channel to ${channel}`,
        ephemeral: true,
      });
      
    // We want the user to change the channel any time
    // This is a huge quality of live ad-on
    } else {
      if (channel.type != "GUILD_TEXT") {
        interaction.reply({
          content: `This is not a valid channel!`,
          ephemeral: true,
        });
        return;
      }
  
      // Update the guilds channel to the new mentioned channel
      await Guild.findOneAndUpdate({
        id: interaction.guild.id,
        channel: channel.id,
      });
      interaction.reply({
        content: `Successfully changed suggestion channel to ${channel}`,
        ephemeral: true,
      });
    }
  
};

module.exports.data = new SlashCommandBuilder()
  .setName("suggestion")
  .setDescription("Setup/Remove suggestions")
  .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("Select the channel for sending suggestions.")
          .setRequired(false)
      )
  
