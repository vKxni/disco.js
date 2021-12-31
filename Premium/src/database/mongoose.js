const config = require('../config.json')
const mongoose = require('mongoose')

module.exports = {
  init: () => {
    if (!config.mongo_database_link)
      throw new Error(`❌ | No MongoDB Client Key found in the configuration.`)

    // Init the connection and the Parser. Database connection link is protected in the Config
    mongoose.connect(config.mongo_database_link, {
      keepAlive: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    mongoose.Promise = global.Promise

    // If Database errors, log it-
    mongoose.connection.on('err', err => {
      console.log('❌ | MONGO DB ERROR\n\n' + err)
    })

    // If Database disconnects, log it.
    mongoose.connection.on('disconnected', () => {
      console.log('❌ | DISCONNECTED FROM THE DATABASE')
    })

    // If Database successfully connects, log it.
    mongoose.connection.on('connected', () => {
      console.log('✅ | Successfully CONNECTED TO THE DATABASE')
    })
  }
}
