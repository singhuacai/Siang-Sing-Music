require("dotenv").config();

// Express Initialization
const express = require("express");
const app = express();
const { PORT, API_VERSION } = process.env;
const port = PORT || 3000;

app.use(express.static("public"));
app.use(express.static("public/html"));
app.use(express.static("public/images/concerts"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// socket.io
const server = require("http").Server(app);
require("./server/socket/socket").socketConnect(server);

// API routes
app.use("/api/" + API_VERSION, [
  require("./server/routes/admin_route"),
  require("./server/routes/concert_route"),
  require("./server/routes/user_route"),
  require("./server/routes/order_route"),
]);

app.get("/", (req, res) => {
  res.send("This is TICKETING-SYSTEM!");
});

// Page not found
app.use(function (req, res, next) {
  res.status(404).sendFile(__dirname + "/public/html/404.html");
  return;
});

// Error handling
app.use(function (err, req, res, next) {
  console.log(err);
  res.status(500).send("Internal Server Error");
  return;
});

server.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});

module.exports = server;
