const express = require('express');

var app = express();

var server = require("http").createServer(app);
var io = require("socket.io").listen(server);

users = [];
connections =[];

var items = ["Bananas",
              "Apples",
              "Melons",
              "Flowers",
              "Tomatoes",
              "Bread"];

var port = (process.env.PORT || 3000);

server.listen(port);
console.log("server is running on port: "+port)

app.get("/", (req,res) => {
  res.sendFile(__dirname + "/index.html")
});

io.sockets.on("connection", (socket) => {
  connections.push(socket);
  console.log("Connected: %s sockets connected", connections.length);

  // Disconnect
  socket.on("disconnect", (data) => {
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
    console.log("Disconnected: %s sockets connected", connections.length);
  })

  // Send Message
  socket.on("send message", (data) => {
    console.log("send message "+data);
    io.sockets.emit("new message", {msg: data, user: socket.username});
  })

  // New users
  socket.on("new user", (data, callback) => {
    callback(true);
    socket.username = data;
    users.push(socket.username);
    updateUsernames();
  })

  function updateUsernames(){
    io.sockets.emit("get users", users);
  }

  //Countdown

  //Config countdown
  var startBid= 100;
  var bid= startBid;
  var decrementor= 1;
  var getInterval = function() {
    //Set speed for countdown
    return 1000
  };

  var countdownFunction = function(){
    io.sockets.emit("bid", bid);
    bid -= decrementor;
    if(bid < 0) //Config when to stop timer
        clearInterval(downloadTimer);
    }

  var downloadTimer = setInterval(countdownFunction, getInterval());

  socket.on("reset", () => {
    bid= startBid;
    clearInterval(downloadTimer);
    downloadTimer = setInterval(countdownFunction, getInterval());
  })

  //receive ID and remove button in frontend
  socket.on("remove", (data) => {
    console.log(data +" received at backend");
    io.sockets.emit("drop", {item: data, user: socket.username});
  })

  //init

  socket.on("init", () => {
    io.sockets.emit("get items", items);
    console.log(items);
  });


})
