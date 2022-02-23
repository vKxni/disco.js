"use strict";

const { SlashCommandBuilder } = require("@discordjs/builders");
const { CommandInteraction, MessageEmbed } = require("discord.js");

// Database queries
const Guild = require("../../models/suggestions"); // For guild
const UserSuggestion = require("../../models/usersuggestions"); // Users suggestions

module.exports.cooldown = {
  length: 10000,
  users: new Set(),
};

/**
 * @param {CommandInteraction} interaction
 */

module.exports.run = async (interaction) => {
  await interaction.deferReply();
  const sub = interaction.options.getSubcommand();

  // Adding a sub command to accept suggestion
  if (sub === "accept") {
    const suggestionid = interaction.options.getString("id");

    // Query the guild and the user for the suggestions
    const guildQuery = await Guild.findOne({ id: interaction.guild.id });
    const suggestionQuery = await UserSuggestion.findOne({ pin: suggestionid });

    // Get the suggestion (message)
    const suggestionmessage = suggestionQuery.suggestion;

    // if no guild setup, dont execute it.
    if (!guildQuery)
      return interaction.reply({
        content: `No suggestion setup found`,
        ephemeral: true,
      });

    // if suggestion id is wrong, return an error.
    if (!suggestionQuery)
      return interaction.reply({
        content: `No suggestion found with that ID.`,
        ephemeral: true,
      });

    // if the channel cannot be found, return an error.
    const schannel = interaction.guild.channels.cache.get(guildQuery.channel);
    if (!schannel)
      return interaction.reply(
        `No suggestion channel found.`
      );

    const embed = new MessageEmbed()
      .setTitle(`Suggestion accepted`)
      .setDescription(`${suggestionmessage}\n\nThanks for this cool idea!`)
      .setColor("RED")
      .setFooter({
        text: `Bot:: Suggestions`,
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setTimestamp();

    // Fetch the message, edit it and remove all reactions
    const message = suggestionQuery.message;

    await schannel.messages.fetch(message).then((editm) => {
      editm.edit({ embeds: [embed] });
      editm.reactions.removeAll();
    });

    // Delete suggestion from database.
    suggestionQuery.delete();

    interaction.followUp({
      content: `Suggestion successfully **accepted**!`,
      ephemeral: true,
    });
    
    // Adding a sub command to deny suggestion
  } else if (sub === "deny") {
    const suggestionid = interaction.options.getString("id");

    // Query the guild and the user for the suggestions
    const guildQuery = await Guild.findOne({ id: interaction.guild.id });
    const suggestionQuery = await UserSuggestion.findOne({ pin: suggestionid });

    // Get the suggestion (message)
    const suggestionmessage = suggestionQuery.suggestion;

    // the same as above
    if (!guildQuery)
      return interaction.reply({
        content: `No suggestion setup found`,
        ephemeral: true,
      });

    // the same as above
    if (!suggestionQuery)
      return interaction.reply({
        content: `No suggestion found with that ID.`,
        ephemeral: true,
      });

    // the same as above
    const schannel = interaction.guild.channels.cache.get(guildQuery.channel);
    if (!schannel)
      return interaction.reply(
        `No suggestion channel found.`
      );

    const embed = new MessageEmbed()
      .setTitle(`Suggestion denied`)
      .setDescription(
        `${suggestionmessage}\n\nSadly, this suggestion is not good enough.`
      )
      .setColor("RED")
      .setFooter({
        text: `Bot:: Suggestions`,
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setTimestamp();

    // Fetch the message, edit it and remove all reactions
    const message = suggestionQuery.message;

    await schannel.messages.fetch(message).then((editm) => {
      editm.edit({ embeds: [embed] });
      editm.reactions.removeAll();
    });

    // Delete suggestion from database.
    suggestionQuery.delete();

    interaction.followUp({
      content: `Suggestion successfully **denied**!`,
      ephemeral: true,
    });
  }
};

module.exports.data = new SlashCommandBuilder()
  .setName("suggestions")
  .setDescription("Accept or deny a suggestion")
  .addSubcommand((sub) =>
    sub
      .setName("accept")
      .setDescription("Accept a suggestion")
      .addStringOption((option) =>
        option
          .setName("id")
          .setDescription("Enter the Suggestion ID you would like to accept")
          .setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("deny")
      .setDescription("Deny a suggestion")
      .addStringOption((option) =>
        option
          .setName("id")
          .setDescription("Enter the Suggestion ID you would like to accept")
          .setRequired(true)
      )
  );
