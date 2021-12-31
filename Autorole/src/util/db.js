"use strict";

const { connect, Mongoose } = require("mongoose");
const { cyan, red, green } = require("colors/safe");

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log(cyan("Connecting to Database . . ."));
connect(process.env.MONGO_TOKEN).then(() =>

{
    console.log(green("Successfully connected to database."));
}).catch((err) => console.error(red(err)));
