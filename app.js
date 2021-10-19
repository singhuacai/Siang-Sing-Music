require("dotenv").config();
// const path = require("path");

// Express Initialization
const express = require("express");
const cors = require("cors");
const app = express();
const { PORT, API_VERSION } = process.env;

app.use(express.static("public"));

// CORS allow all
app.use(cors());

app.get("/", (req, res) => {
  res.send("This is TICKETING-SYSTEM!");
});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
