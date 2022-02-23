"use strict";

const { Client } = require("discord.js");
const { red, green, blue, yellow, cyan } = require('chalk');

module.exports.data =
{
    name: "ready",
    once: true,
};

/**
 * Handle the clients ready event.
 * @param {Client} client The client that triggered the event.
 */
module.exports.run = async (client) =>
{

    // Set the Bot status
    client.user.setPresence({ activities: [{ name: `cody-bot.xyz` }], status: "dnd" });

    const loading = String.raw`
                  __         ______   __    __  __    __   ______   __    __  ______  __    __   ______  
                 /  |       /      \ /  |  /  |/  \  /  | /      \ /  |  /  |/      |/  \  /  | /      \ 
                 $$ |      /$$$$$$  |$$ |  $$ |$$  \ $$ |/$$$$$$  |$$ |  $$ |$$$$$$/ $$  \ $$ |/$$$$$$  |
                 $$ |      $$ |__$$ |$$ |  $$ |$$$  \$$ |$$ |  $$/ $$ |__$$ |  $$ |  $$$  \$$ |$$ | _$$/ 
                 $$ |      $$    $$ |$$ |  $$ |$$$$  $$ |$$ |      $$    $$ |  $$ |  $$$$  $$ |$$ |/    |
                 $$ |      $$$$$$$$ |$$ |  $$ |$$ $$ $$ |$$ |   __ $$$$$$$$ |  $$ |  $$ $$ $$ |$$ |$$$$ |
                 $$ |_____ $$ |  $$ |$$ \__$$ |$$ |$$$$ |$$ \__/  |$$ |  $$ | _$$ |_ $$ |$$$$ |$$ \__$$ |
                 $$       |$$ |  $$ |$$    $$/ $$ | $$$ |$$    $$/ $$ |  $$ |/ $$   |$$ | $$$ |$$    $$/ 
                 $$$$$$$$/ $$/   $$/  $$$$$$/  $$/   $$/  $$$$$$/  $$/   $$/ $$$$$$/ $$/   $$/  $$$$$$/  
                                                                                                                                                                                                      
`;
    // backslash
const backslash = String.raw` \ `;
const prefix = "/"

console.log(red(loading))

console.log(``);
console.log(green(`                                                     Konicord`));
console.log(``);
console.log(``);
console.log(yellow('               + ================================================================================== +'));
console.log(cyan(`                                [i] :: ${prefix}help                :: Displays commands.                   `));
console.log(cyan(`                                [i] :: ${prefix}ping                :: Displays bots ping.                  `));
console.log(yellow('               + ================================Commands========================================== +'));
console.log(cyan(`                       Author   [i] :: Programmed by [Koni#9521]    :: © 2021 Development                   `));
console.log(cyan(`                       Bot info [i] :: Status                       :: ✅ Online                           `));
console.log(cyan(`                       Users    [i] ::                              :: ${client.users.cache.size}  Users   `));
console.log(cyan(`                       Guilds   [i] ::                              :: ${client.guilds.cache.size} Guilds  `));
console.log(yellow('               + ================================Website=========================================== +'));
console.log(cyan(`                       Link     [i] ::        [konicord.dev]        :: Our Website                          `));


    
console.log("Press [CTRL + C] to stop the Terminal ...")
};
