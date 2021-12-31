"use strict";

const { SlashCommandBuilder } = require("@discordjs/builders");
const { CommandInteraction, Permissions } = require("discord.js");
const { getAllFiles } = require("../../util/util.js");
const path = require('path');


module.exports.cooldown = {
    length: 0, /* in ms */
    users: new Set()
};

/**
 * Reloads a certain command.
 * @param {CommandInteraction} interaction The Command Interaciton
 * @param {any} utils Additional util
 */
module.exports.run = async (interaction, utils) =>
{
    try
    {
        /* Load commands. */
        await interaction.reply({ content: "Loading Commands . . .", ephemeral: true });
        /* Get an array of all files in the commands folder. */
        const commands = getAllFiles(path.join(__dirname, "../"));
        if (commands.length <= 0)
            await interaction.editReply({ content: "NO COMMANDS FOUND", ephemeral: true });
        else
        {
            /* Iterate every file in the array and require it. Also map it to the commands collection. */
            commands.forEach((file, i) =>
            {
                delete require.cache[file];
                const props = require(`${file}`);
                commands[i] = file.split('\\').pop().split('/').pop();
                interaction.client.commands.set(props.data.name, props);
            });
            await interaction.editReply({ content: `Reloaded all commands.\n\`${commands.toString()}\``, ephemeral: true });
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
    .setName("reloadcommands")
    .setDescription("Reloads all commands.");