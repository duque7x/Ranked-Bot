const mongoose = require("mongoose");
require("dotenv").config();


const uri = process.env.MONGO_URI;

mongoose.connect(uri)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));

module.exports = mongoose;