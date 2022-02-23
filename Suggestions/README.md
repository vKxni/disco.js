<p align="center">
  <a href="https://discord.gg/3eNaWPhWZE" target="blank"><img src="https://cdn.discordapp.com/attachments/881491251784978452/925487363017277510/djs.png" width="200" height="200" alt="Djs" /></a>
</p>

# Suggestions
This guide will explain you how to create an advanced suggestion system for your Discord.js Bot.

## Requirements
* Basic Knowledge of JavaScript/NodeJS
* Basic+ Knowledge of MongoDB/Mongoose
* Basic+ experience with NPM
* Good experience with Discord.js
* A working connection to MongoDB with Schemas

Discord.js v13 or higher.
Nodejs v16 or higher.

Understanding Pathing
```
/ = Root directory.
. = This location.
.. = Up a directory.
./ = Current directory.
../ = Parent of current directory.
../../ = Two directories backwards.
```

## Get started
Lets get started by installing some dependencies, open your favourite terminal.
Run the following Commands in your Terminal.
```shell
npm install discord.js@latest
npm install mongoose
```
Close your terminal, we won't need it while coding.
The next steps are very easy. Create a folder called
`schemas`, the path would look like this: `src/models`.
In there, create a file called `suggestions.js`.

We now want Mongoose to store the suggestions we generate.
```js
const { Schema, Types, model } = require("mongoose");

const suggestionSchema = new Schema({
    id:
    {
        type: String,
        unique: true,
        required: true
    },
    channel:
    {
        type: String,
        required: true
    },
}, { timestamps: true });

const Suggestion = model("Suggestion", suggestionSchema);


module.exports = Suggestion
```
We also need a User schema to store custom suggestions.
The file will be called `usersuggestions.js`
```js
const { Schema, Types, model } = require("mongoose");

const userSugSchema = new Schema({
    userID:    {
        type: String,
    },
    suggestion:
    {
        type: String
    },
    message: {
        type: String
    },
    pin:
    {
        type: String
    }
}, { timestamps: true });

const userSuggestions = model("user-suggestions", userSugSchema);


module.exports = userSuggestions
```

Awesome. This allows us to save data to our database.
Now let's create the command to setup our suggestions.

> src/commands/Suggestions/suggestion.js
```js
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
  
```
Easy, right?
This will save all of guilds data in the database.
Now we want to test our command and database.

```
$ npm run deploy
$ npm run dev

Bot is online!
```
> Testing the command
* Run `/suggestion` and choose a text channel
Now you should see something like `Successfully set the suggestion channel to <channel>`.
Perfect, now open MongoDB Compass and login with your connection string.

<img src="database.png"
     alt="Database showcase"
     style="float: left; margin-right: 10px;" />
If you see something like this, everything worked perfectly.

The next step is to create some utility, our first command will be called
`suggest.js`
Create a file within your commands folder called `suggest.js`.
The path would look like this: `src/commands/Suggestion/suggest.js`.

```js
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
  
```
Lets test this out.
Reload your bot and go back to your server.
Type `/suggest <message>`.
If everything worked, you will see a message in the channel

<img src="suggestion.png"
     alt="Suggestion showcase"
     style="float: left; margin-right: 10px;" />
     
Awesome!

If you check your database, you will see a user-suggestion there.

<img src="usersuggestion.png"
     alt="Suggestion showcase 2"
     style="float: left; margin-right: 10px;" />

We will now create a command to deny/accept a suggestion.
Path: `src/commands/Suggestion/suggestions.js`
```js
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

  if (sub === "accept") {
    const suggestionid = interaction.options.getString("id");

    // Query the guild and the user for the suggestions
    const guildQuery = await Guild.findOne({ id: interaction.guild.id });
    const suggestionQuery = await UserSuggestion.findOne({ pin: suggestionid });

    // Get the suggestion (message)
    const suggestionmessage = suggestionQuery.suggestion;

    if (!guildQuery)
      return interaction.reply({
        content: `No suggestion setup found`,
        ephemeral: true,
      });

    if (!suggestionQuery)
      return interaction.reply({
        content: `No suggestion found with that ID.`,
        ephemeral: true,
      });

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
        text: `Bottodir:: Suggestions`,
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
  } else if (sub === "deny") {
    const suggestionid = interaction.options.getString("id");

    // Query the guild and the user for the suggestions
    const guildQuery = await Guild.findOne({ id: interaction.guild.id });
    const suggestionQuery = await UserSuggestion.findOne({ pin: suggestionid });

    // Get the suggestion (message)
    const suggestionmessage = suggestionQuery.suggestion;

    if (!guildQuery)
      return interaction.reply({
        content: `No suggestion setup found`,
        ephemeral: true,
      });

    if (!suggestionQuery)
      return interaction.reply({
        content: `No suggestion found with that ID.`,
        ephemeral: true,
      });

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
        text: `Bottodir:: Suggestions`,
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
```
Awesome, now reload your Bot and run the following command.
`/suggestions accept <id>`

<img src="accept.png"
     alt="Accept showcase"
     style="float: left; margin-right: 10px;" />

Hit enter, now you will see the embed being edited.

<img src="accepted.png"
     alt="Accepted showcase"
     style="float: left; margin-right: 10px;" />

🎉 You have successfully created an advanced suggestion system.