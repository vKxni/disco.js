const { readdirSync } = require("fs");
const ascii = require("ascii-table");
const path = require('path')
let table = new ascii("Commands");
table.setHeading("Command", " Load status");
module.exports = (client) => {
  readdirSync("./src/commands/").forEach((dir) => {
    const commands = readdirSync(`./src/commands/${dir}/`).filter((file) =>
      file.endsWith(".js")
    );
    for (let file of commands) {
      let pull = require(path.resolve(`src/commands/${dir}/${file}`));
      if (pull.name) {
        client.commands.set(pull.name, pull);
        table.addRow(file, "✅");
      } else {
        table.addRow(
          file,
          "❌ -> Missing a help.name, or help.name is not a string."
        );
        continue;
      }
      if (pull.aliases && Array.isArray(pull.aliases))
        pull.aliases.forEach((alias) => client.aliases.set(alias, pull.name));
    }
  });
  console.log(table.toString());

  readdirSync("./src/events/").forEach((file) => {
    const events = readdirSync("./src/events/").filter((file) =>
      file.endsWith(".js")
    );

    for (let file of events) {
      let pull = require(path.resolve(`src/events/${file}`));

      if (pull.name) {
        client.events.set(pull.name, pull);
      } else {
        continue;
      }
    }
  });
};
