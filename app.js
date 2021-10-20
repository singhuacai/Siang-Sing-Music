require("dotenv").config();
// const path = require("path");

// Express Initialization
const express = require("express");
const cors = require("cors");
const app = express();
const { PORT, API_VERSION } = process.env;
const port = PORT;

app.use(express.static("public"));
app.use(express.static("public/html"));
app.use(express.static("public/images/concerts"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS allow all
app.use(cors());

// API routes
app.use("/api/" + API_VERSION, [
  require("./server/routes/admin_route"),
  require("./server/routes/concert_route"),
  require("./server/routes/user_route"),
  // require("./server/routes/order_route"),
]);

app.get("/", (req, res) => {
  res.send("This is TICKETING-SYSTEM!");
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
