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
  
    const channel = interaction.options.getChannel("channel") || interaction.channel;
    const guildQuery = await Guild.findOne({ id: interaction.guild.id });

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
    } else {
      if (channel.type != "GUILD_TEXT") {
        interaction.reply({
          content: `This is not a valid channel!`,
          ephemeral: true,
        });
        return;
      }

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
  