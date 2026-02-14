const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", require("./routes/auth")); 
app.use("/profile", require("./routes/profile.routes"));
app.use("/chat", require("./routes/chat.routes"));
    
module.exports = app;
