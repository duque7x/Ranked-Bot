const mongoose = require("mongoose");

const uri = "mongodb+srv://josueapelao00:oBUKnzYHeVGZda7i@duque.tn8ci.mongodb.net/?retryWrites=true&w=majority&appName=duque";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));

module.exports = mongoose;