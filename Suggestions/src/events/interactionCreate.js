"use strict";
                                                                                                                                                                        
const { Permissions, CommandInteraction } = require("discord.js");
const { getKeyByValue, msToMinAndSec } = require("../util/util.js");
const { red } = require("colors/safe");

module.exports.data = {
  name: "interactionCreate",
  once: false,
};

/**
 * Handle the clients interactionCreate event.
 * @param {CommandInteraction} interaction The interaction that triggered the event.
 */
module.exports.run = async (interaction) => {
  try {
    /* 
    
    Only handle command interactions.
    Return if the command does not exist or is not loaded / registered - deployed.
    Add a cooldown to the user and return an error 
    */

    if (!interaction.isCommand()) return;
    const command = interaction.commandName.toLowerCase();
    let cmdFile;
    if (interaction.client.commands.has(command))
      cmdFile = interaction.client.commands.get(command);
    else return; /* Return if command doesn't exist. */

    /* Check if command is on cooldown. */
    if (cmdFile.cooldown.users.has(interaction.member.id)) {
      await interaction.reply({
        content: `${
          emojis.error
        } | You can only use this command every ${msToMinAndSec(
          cmdFile.cooldown.length
        )} minutes.`,
        ephemeral: true,
      });
      return;
    }

   
    /* Array containing all the missing permissions of the client/user to run the interaction. Ideally those arrays are empty. */
    let missingClientPermissions = [],
      missingUserPermissions = [];

    /* Check if the client is missing any permissions. */
    cmdFile.permissions?.clientPermissions.forEach((flag) => {
      if (!interaction.guild.me.permissions.has(flag))
        missingClientPermissions.push(getKeyByValue(Permissions.FLAGS, flag));
    });

    /* If the client is missing any permissions, don't run the command. */
    if (missingClientPermissions.length != 0) {
      await interaction.reply({
        content: `${
          emojis.error
        } | I am missing the following permissions.\n \`${missingClientPermissions.toString()}\``,
        ephemeral: true,
      });
      return;
    }

    /* Check if the user is missing any permissions. */
    cmdFile.permissions?.userPermissions.forEach((flag) => {
      if (!interaction.member.permissions.has(flag))
        missingUserPermissions.push(getKeyByValue(Permissions.FLAGS, flag));
    });

    const args = [];

    for (let option of interaction.options.data) {
      if (option.type === "SUB_COMMAND") {
        if (option.name) args.push(option.name);
        option.options?.forEach((x) => {
          if (x.value) args.push(x.value);
        });
      } else if (option.value) args.push(option.value);
    }

    /* Only run the command if the user is not missing any permissions. */
    if (missingUserPermissions.length == 0) {
      cmdFile.run(interaction, args).catch((err) => console.error(red(err)));
      /* If user doesn't has Admin perms, add him a cooldown. */
      if (
        !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
      ) {
        /* Adding cooldown onto the command */
        cmdFile.cooldown?.users.add(interaction.member.id);
        setTimeout(() => {
          cmdFile.cooldown?.users.delete(interaction.member.id);
        }, cmdFile.cooldown?.length);
      }
    } else
      await interaction.reply({
        content: `${
          emojis.error
        } | You are missing the following permissions.\n \`${missingUserPermissions.toString()}\``, // here is what we were talking about (custom) permissions-
        ephemeral: true,
      });
  } catch (err) {
    console.error(red(err));
  }
};