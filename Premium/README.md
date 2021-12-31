<p align="center">
  <a href="https://discord.gg/3eNaWPhWZE" target="blank"><img src="https://cdn.discordapp.com/attachments/881491251784978452/925487363017277510/djs.png" width="200" height="200" alt="Djs" /></a>
</p>

# Premium.djs
This guide will explain you how to create a Premium System for your Discord.js Bot.

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
npm install voucher-code-generator
npm install moment
npm install discord.js@latest
npm install mongoose
npm install node-cron
```
Close your terminal, we won't need it while coding.
The next steps are very easy. Create a folder called
`schemas`, the path would look like this: `src/schemas`.
In there, create a file called `Code.js`.

We now want Mongoose to store the Data we generate.
```js
// Import mongoose from the NPM Package we've installed before
const mongoose = require('mongoose')

// Generate Premium Code
const premiumCode = mongoose.Schema({
  code: {
    type: mongoose.SchemaTypes.String,
    default: null
  },

  // Set the expire date and time. <Day, Week, Month, Year>
  expiresAt: {
    type: mongoose.SchemaTypes.Number,
    default: null
  },

  // Set the plan <Day, Week, Month>.
  plan: {
    type: mongoose.SchemaTypes.String,
    default: null
  }
})

module.exports = mongoose.model('premium-codes', premiumCode)
```
Great. Now we want to do the same for our Users/Members.
Create a file called `User.js` in the same Folder. 
The path would look like this: `src/schemas/User.js`

```js
// Import mongoose from the NPM Package we've installed before
const mongoose = require('mongoose')

// The heart of the User, here is everything saved that the User does.
// Such as Levels, Courses, Premium, Enrolled, XP, Leaderboard.
const user = mongoose.Schema({
  Id: {
    type: mongoose.SchemaTypes.String,
    required: true,
    unique: true
  },
  isPremium: {
    type: mongoose.SchemaTypes.Boolean,
    default: false
  },
  premium: {
    redeemedBy: {
      type: mongoose.SchemaTypes.Array,
      default: null
    },

    redeemedAt: {
      type: mongoose.SchemaTypes.Number,
      default: null
    },

    expiresAt: {
      type: mongoose.SchemaTypes.Number,
      default: null
    },

    plan: {
      type: mongoose.SchemaTypes.String,
      default: null
    }
  }
})
module.exports = mongoose.model('user', user)
```
Cool.
The next step is creating a code generator and a command to redeem them.
Let's start with generating a premium code for our users.
Go ahead and create a file called `generate.js` within your commands folder.
The path would look something like this: `src/commands/subfolder/generate.js`

```js
// Import the modules we have installed before.
const Discord = require('discord.js')
const moment = require('moment')
var voucher_codes = require('voucher-code-generator')

// This is our database schema called `Code.js`, the path will be different for you
// remove the whole string and start like the Guide explained at the beginning.
const schema = require('../../database/schemas/Code')

// Here you have to use your handler, I will use mine. Change it to yours!
module.exports = {
  name: 'gencode',
  category: 'Owner',
  description: 'Generates a premium code',
  ownerOnly: true,

  run: async (client, message, args, user, guild) => {
  
  // As defined in the Schema, leave codes as an empty array variable
    let codes = [];

    // Display available plans of the code
    const plan = args[0];
    const plans = ['daily', 'weekly', 'monthly', 'yearly'];

    // If the user does not send any argument after the Command, return.
    if (!plan) return message.channel.send({ content: `**> Please provide plan**` })

    // If the users input does not match the plans array above, return an error.
    if (!plans.includes(args[0]))
      return message.channel.send(
       { content:  `**Invalid Plan, available plans:** ${plans.join(', ')}`}
      )

    // Calculate time for the code to expire.
    let time;
    if (plan === 'daily') time = Date.now() + 86400000;
    if (plan === 'weekly') time = Date.now() + 86400000 * 7;
    if (plan === 'monthly') time = Date.now() + 86400000 * 30;
    if (plan === 'yearly') time = Date.now() + 86400000 * 365;

    // If the input is for ex. 10, generate 10 Codes. Default => 1 Code / Command.
    let amount = args[1];
    if (!amount) amount = 1;

    for (var i = 0; i < amount; i++) {
      const codePremium = voucher_codes.generate({
        pattern: '####-####-####'
      })

      // Save the Code as a String ("ABCDEF ...") in the Database 
      const code = codePremium.toString().toUpperCase()

      // Security check, check if the code exists in the database.
      const find = await schema.findOne({
        code: code
      })

      // If it does not exist, create it in the database.
      if (!find) {
        schema.create({
          code: code,
          plan: plan,
          expiresAt: time
        })
        
        // Push the new generated Code into the Queue
        codes.push(`${i + 1}- ${code}`)
      }
    }

    // Lastly, we want to send the new Code(s) into the Channel.
    message.channel.send(
      { content: 
        `\`\`\`Generated +${codes.length}\n\n--------\n${codes.join(
        '\n'
      )}\n--------\n\nType - ${plan}\nExpires - ${moment(time).format(
        'dddd, MMMM Do YYYY'
      )}\`\`\`\nTo redeem, use \`!redeem <code>\``}
    )
  }
}
```
Perfect. Now our Bot is generating the Codes.
We now want to redeem it and save it under our Profile Settings in the Database.

Go ahead and create a file within your `commands` folder called `redeem.js`
The path would look like this: `src/commands/subfolder/redeem.js`

```js
const Discord = require('discord.js')
const moment = require('moment')

// Now we are doing the same as before, pathing into the Schemas folder.
// We need the Codes Schema and the User Profile Schema.
// Check the Pathing Guide above and adjust this String to yours.
const schema = require('../../database/schemas/Code')
const User = require('../../database/schemas/User')

module.exports = {
  name: 'redeem',
  category: 'Premium',
  description: 'Redeem a generated premium code.',

  run: async (client, message, args, user, guild) => {
   
    // Check if the user with a unique ID is in our database.
     user = await User.findOne({
      Id: message.author.id, // if you are using slash commands, swap message with interaction.
    })

    // Check Users input for a valid code. Like `!redeem ABCD-EFGH-IJKL`
    let code = args[0]

    // Return an error if the User does not include any Premium Code
    if (!code)
      return message.channel.send({
        embeds: [
          new Discord.MessageEmbed()
            .setColor('0xff0000')
            .setDescription(`**Please specify the code you want to redeem!**`),
        ],
      })

    // If the user is already a premium user, we dont want to save that so we return it.
    if (user && user.isPremium) {
      return message.channel.send({
        embeds: [
          new Discord.MessageEmbed()
            .setColor('0xff0000')
            .setDescription(`**> You already are a premium user**`),
        ],
      })
    }

    // Check if the code is valid within the database
    const premium = await schema.findOne({
      code: code.toUpperCase(),
    })

    // Set the expire date for the premium code
    if (premium) {
      const expires = moment(premium.expiresAt).format(
        'dddd, MMMM Do YYYY HH:mm:ss',
      )

      // Once the code is expired, we delete it from the database and from the users profile
      user.isPremium = true
      user.premium.redeemedBy.push(message.author)
      user.premium.redeemedAt = Date.now()
      user.premium.expiresAt = premium.expiresAt
      user.premium.plan = premium.plan

      // Save the User within the Database
      user = await user.save({ new: true }).catch(() => {})
      client.userSettings.set(message.author.id, user)
      await premium.deleteOne().catch(() => {})

      // Send a success message once redeemed
      message.channel.send({
        embeds: [
          new Discord.MessageEmbed()
            .setTitle('Premium Redeemed')
            .setDescription(
              `**You have successfully redeemed premium!**\n\n\`Expires at: ${expires}\``,
            )
            .setColor('0x5eff00')
            .setTimestamp(),
        ],
      })

      // Error message if the code is not valid.
    } else {
      return message.channel.send({
        embeds: [
          new Discord.MessageEmbed()
            .setColor('0xff0000')
            .setDescription(
              `**The code is invalid. Please try again using valid one!**`,
            ),
        ],
      })
    }
  },
}
```
Perfect. But as you can see, we have a Collection called `userSettings` within our Code.
Lets add it real quick to our Project before we are trying out our new Commands.

Go into your main file `index.js` / `main.js` / `app.js` ..
In there, define `client` with the neccessary intents.
Once done, add the following line into your code.
**It should be below the client defination!!*

```js
client.userSettings = new Collection()
```

**OPTIONAL**
The next step requires some working brain, try understanding it first before trying it.
Go into your `message.js` file. Define our Schema `User` and add it into the `command`.
You can also use your own and just integrate the User into it.
It's necessary so the bot can separate premium users of normal users.

```js
// Check the guide at the beginning if you don't understand paths.
const User = require('../database/schemas/User')

  // Get the clients commands
  if (cmd.length == 0) return
  let command = client.commands.get(cmd)
  if (!command) command = client.commands.get(client.aliases.get(cmd))

  // If there are commands, set the userSettings to the message author.
  if (command) {
    let user = message.client.userSettings.get(message.author.id)

  // If there is no user, create it in the Database as "newUser"
    if (!user) {
      const findUser = await User.findOne({ Id: message.author.id })
      if (!findUser) {
        const newUser = await User.create({ Id: message.author.id })
        message.client.userSettings.set(message.author.id, newUser)
        user = newUser
      } else return
    }
  }
```
Awesome. We now want the Bot define the User once going online.
Go into your `ready.js` event. It's where the Bot is booting up.

```js
// Path into your main file where client is defined with the Intents.
const client = require("../../src/index");
// Once again, we need our Database User
const User = require("../database/schemas/User");

client.on("ready", async () => {
  console.log(`Our cool Bot is now online!`);
  
  // find the User in the Database
  const users = await User.find();
  for (let user of users) {
    client.userSettings.set(user.Id, user);
  }
  
  // require the premium handler
  require("../handlers/premium")(client);
})
```
Awesome. We are one step away!
You might have seen a handler called `premium` in the last code snippet, let's work that out.

Your bot has at least one handler called `command.js` right?
(`events` is also possible).
Go ahead and create a file called `premium.js` within the `handlers` folder.
The path may look like this: `src/handlers/premium.js`

```js
// Define the User from our Database Schema
const User = require('../database/schemas/User')
const cron = require('node-cron')

// set the schedule, find the user in the database.
module.exports = async client => {
  cron.schedule('*/60 * * * * *', async () => {
    await User.find({ isPremium: true }, async (err, users) => {
      if (users && users.length) {

        // Set the expire Date and Time for our User + Code
        for (let user of users) {
          if (Date.now() >= user.premium.expiresAt) {

            // Default: The user is not a premium User
            user.isPremium = false
            user.premium.redeemedBy = []
            user.premium.redeemedAt = null
            user.premium.expiresAt = null
            user.premium.plan = null

            // Save the updated user within the usersSettings.
            const newUser = await user.save({ new: true }).catch(() => {})
            client.usersSettings.set(newUser.Id, newUser)
          }
        }
      }
    })
  })
}
```
AAAAND BOOM. We are done. You have successfully setup your own Premium System for your Discord Bot.
Go ahead and start your Bot. Once online, run `<prefix> generate daily`. 

<p align="center">
  <a href="https://discord.gg/3eNaWPhWZE" target="blank"><img src="https://media.discordapp.net/attachments/877230407114973264/925504074181402624/unknown.png" width="700" height="300" alt="Generate Code" /></a>
</p>

This will create a premium code that expires in exactly 24hours.
Redeem the Code with `<prefix> redeem <code>`. :)

<p align="center">
  <a href="https://discord.gg/3eNaWPhWZE" target="blank"><img src="https://cdn.discordapp.com/attachments/877230407114973264/925505093049147442/unknown.png" width="700" height="300" alt="Redeem Code" /></a>
</p>

You might wonder, how you can strict a command down to only premium Users.
I will show you one example, it's very easy.

```js
// Import the User from our Database Schema.
const User = require("../../database/schemas/User");
const moment = require("moment");
const Discord = require("discord.js");

// Change this to your own handler.
module.exports = {
  name: "private",
  category: "💰 Premium",
  description: "Premium only Comamnd",

  run: async (client, message, args, user, guild) => {
   
    const embed = new MessageEmbed()
    .setTitle("Only Premium!")
    .setDescription("Only premium users can see this :D")
    .setColor("GREEN")
    .setTimestamp()
    
    // Now just include these lines here
    try {
    
    // Check if the User is premium and send him the "secret" command => only available for premium users.
    if (user && user.isPremium) {
       message.author.send({ embeds: [embed] })
     
    // if the user is not a premium user, return an error.
    } else {
      return message.channel.send({ content: "Stop. You are not a premium user, I won't show you this." });
    }
    } catch (err) {
        console.log(err)
        message.channel.send({ content: "Something weird happened, try again later." })
     }
  },
};
```
Congrats. You now have a fully working premium system integrated.
If you want a live example, check out [Cody](https://github.com/vKxni/Cody).
I have integrated it there and also used it for the examples here.

Hopefully it helped you to make your bot a little bit better :)
