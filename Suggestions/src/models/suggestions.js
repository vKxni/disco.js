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