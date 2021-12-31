const client = require("../index")
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
