"use strict";

const { SlashCommandBuilder } = require("@discordjs/builders");
const { CommandInteraction, Permissions, MessageEmbed } = require("discord.js");

// Database queries
const Guild = require("../../models/suggestions");
const User = require("../../models/usersuggestions");

module.exports.cooldown = {
    length: 320000, /* in ms */
    users: new Set()
};

// generate random ID
function generateID() {
    var length = 12,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

/**
 * Runs the command.
 * @param {CommandInteraction} interaction The Command Interaciton
 * @param {any} utils Additional util
 */
module.exports.run = async (interaction) =>
{
    try
    {
    
        // Chef is the guild is within the database
        const guildQuery = await Guild.findOne({ id: interaction.guild.id })
        if(!guildQuery) return interaction.reply({ content: `This guild has **no** suggestion system setup.`, ephemeral: true })
        
        // Some variables
        const suggestion = interaction.options.getString("suggestion")
        const pin = generateID(); // generate a random ID
        const user = interaction.user;

        if(suggestion.length >= 150) return interaction.reply({ content: `Description must be less than **150** characters.`, ephemeral: true })

        const embed = new MessageEmbed()
        .setTitle(`New Suggestion`)
        .setDescription(`${suggestion}\n\nWaiting for the community to vote!`)
        .setTimestamp()
        .setFooter({ text: `Pin: ${pin}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true })})
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setColor("#36393F")

        // If guild has some data, save the suggestion including message + id in the database
        // Send the message into the channel and react with upvote/downvote emojis
        // Feel free to change them if you want.
        if(guildQuery) {
            const guild = interaction.client.guilds.cache.get(interaction.guild.id);
            const suggestionchannel = guild.channels.cache.get(guildQuery.channel);
            const message = await suggestionchannel.send({ embeds: [embed] }); 

            // As mentioned above, save the suggestion under the users ID
            const userSuggestion = new User({
                userID: interaction.user.id,
                suggestion: suggestion,
                message: message.id,
                pin: pin
            })
            userSuggestion.save();

            await message.react(`✅`)
            await message.react(`❌`)

            interaction.reply({ content: `Successfully sent suggestion.`, ephemeral: true, fetchReply: true });
        }
    }
    catch (err)
    {
        return Promise.reject(err);
    }
};

module.exports.permissions = {
    clientPermissions: [Permissions.FLAGS.SEND_MESSAGES],
    userPermissions: [Permissions.FLAGS.SEND_MESSAGES]
};

module.exports.data = new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("Suggest some Ideas for the Server.")
    .addStringOption(option => option.setName("suggestion").setDescription("Provide the reason for the ban, add proofs via Imgur.").setRequired(true))
