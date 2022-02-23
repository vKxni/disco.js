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