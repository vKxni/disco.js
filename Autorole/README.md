
<p align="center">
  <a href="https://discord.gg/3eNaWPhWZE" target="blank"><img src="https://cdn.discordapp.com/attachments/881491251784978452/925487363017277510/djs.png" width="200" height="200" alt="Djs" /></a>
</p>

# Disco.js | Autorole
This guide will explain you how to create an autorole system for your Discord.js Bot.

## Requirements
* Basic Knowledge of JavaScript/NodeJS
* Basic+ Knowledge of MongoDB/Mongoose
* Basic+ experience with NPM
* Good experience with Discord.js
* A working connection to MongoDB with Schemas

Discord.js v12 or higher.
Nodejs v14 or higher.

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
`schemas`, the path would look like this: `src/schemas`.
In there, create a file called `welcome.js`.

```js
const { Schema, Types, model } = require("mongoose");

const welcomeSchema = new Schema({
    id:
    {
        type: String,
        unique: true,
        required: true
    },
    role:
    {
        type: String,
        required: false
    },
    channel:
    {
        type: String,
        required: true
    },
}, { timestamps: true });

const Welcome = model("Welcome", welcomeSchema);

module.exports = Welcome
```
This should give you a small template about the Schema.
However, your Bot/Project may have a different structure, so adjust it.
(There could be errors later if you don't adjust it to yours).

Cool, we now want to create a command that can setup a welcome channel and the autorole.
Go ahead and create a file called `setwelcome.js` within your commands folder.
The path would look like this: `src/commands/setup/setwelcome.js`.

The handler may look different, just act like creating a new command and add the queries into it, ignore the stuff around it.
```js
// Path to the welcome schema created from the last step
const Guild = require("../../models/welcome");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { CommandInteraction, Permissions, MessageEmbed } = require("discord.js");

module.exports.run = async (interaction, utils) => {
  try {

    // Find the Guild in the Database
    const isSetup = await Guild.findOne({ id: interaction.guild.id });
    
    // Define the role from the Users input
    const role = interaction.options.getRole("role");

    // If its not in the Database, check if the User mentioned a valid channel, if yes, save it to the Database
    if (!isSetup) {
    
     // Define the channel from the users input
      const channel = interaction.options.getChannel("channel", true);

    // check if the channel is a text channel, if not, return an error
      if (channel.type != "GUILD_TEXT") {
        interaction.reply({
          content: ":x: | This is not a valid Channel!",
          ephemeral: true,
        });
        return;
      }
      
      // If its not a valid role, return an error
      if(!role) {
          interaction.reply({ content: ":x: | This is not a valid Role!", ephemeral: true})
      }

      // create a new Database for the guild, save the guild id, channel id, role id.
      const newLogs = new Guild({
        id: interaction.guild.id,
        channel: channel.id,
        role: role.id
      });

      // Save it and return an success message
      newLogs.save();
      interaction.reply({
        content: `✅ | Successfully set the Welcome Channel to ${channel}`, ephemeral: true
      });

      // If the Guild has already done the Setup before, update it to the new channel.
    } else {
      const channel = interaction.options.getChannel("channel", true);

      await Guild.findOneAndUpdate({
        id: interaction.guild.id,
        channel: channel.id,
        role: role.id
      });
      
      // and we are done :)
      await interaction.reply({
        content: `🌀 | Successfully changed Welcome channel to ${channel} with the ${role} Role`,
        ephemeral: true,
      });
    }
  } catch (err) {
    return Promise.reject(err);
  }
};

module.exports.data = new SlashCommandBuilder()
  .setName("setwelcome")
  .setDescription("Setup Welcoming on your Server")
  .addChannelOption((option) => opion.setName("channel").setDescription("Select the Channel for sending Leave Messages").setRequired(true))
  .addRoleOption((option) => option.setName("role").setDescription("Set the Role the Users should receive when joining the Guild").setRequired(true))
```
Sweet, we now have a setup command for our welcome system. 
Check your MongoDB Client if the Data got saved.

<p align="center">
  <a href="https://discord.gg/3eNaWPhWZE" target="blank"><img src="https://media.discordapp.net/attachments/924636816865390604/926458432641466428/unknown.png" width="700" height="400" alt="Generate Code" /></a>
</p>

Good.
The next step is creating the event once a user joins the guild.
Go into your `events` folder, it's the folder where the most people have their `ready.js` file.
Now create a file called `guildMemberAdd.js`

```js
// As I said, act like creating a new event and just add the import(s) + the queries below.
// Import the Guild Schema created before, import client from the Bots main file.
const { GuildMember, MessageEmbed  = require("discord.js");
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

// We need member here as a single parameter, nothing else.
module.exports.run = async (member) => {

  try {
  
    // The welcome embed once a user joins a user, change it if you want
    const embed = new MessageEmbed()
      .setTitle("👋 Welcome!")
      .setDescription(`Welcome to **${member.guild.name}** ${member}!`)
      .setColor("GREEN")
      .setTimestamp()
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter(member.guild.name, member.displayAvatarURL({ dynamic: true }));
    

    // Query the database for the Guilds Settings (saved Channel + Role)
    const guildQuery = await Guild.findOne({ id: member.guild.id });
    const role = member.guild.roles.cache.find((role) => role.id == guildQuery.role);
    
    // If there are no settings, don't do anything
    if (!guildQuery) return;
    if (guildQuery) {
    
      // Sending message when new user joins the Server.
      const guild = member.client.guilds.cache.get(member.guild.id);
      const logging = guild.channels.cache.get(guildQuery.channel);
      logging.send({ embeds: [embed] });

      // Add the saved role to the user once joined
      member.roles.add(role); // role.id
    }
  } catch (err) {
    return Promise.reject(err);
  }
};
```
Awesome.
The last step is to test if it works. 
Start the Bot, run `/deployCommands` (the way you deploy commands and events).
Now let a User join your Server.

<p align="center">
  <a href="https://discord.gg/3eNaWPhWZE" target="blank"><img src="https://media.discordapp.net/attachments/924636816865390604/926458280941858866/unknown.png" width="500" height="200" alt="Generate Code" /></a>
</p>

Yay, it sent an message. But did the User received his role?

<p align="center">
  <a href="https://discord.gg/3eNaWPhWZE" target="blank"><img src="https://media.discordapp.net/attachments/924636816865390604/926458303544983602/unknown.png" width="700" height="300" alt="Generate Code" /></a>
</p>

YES! Perfect, it's working.
You now have successfully setup a Welcome/Autorole System within your Discord Bot using the latest Version `13.5.0`.
