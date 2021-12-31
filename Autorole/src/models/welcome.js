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


module.exports = Welcome;