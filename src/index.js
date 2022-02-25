const https = require("https");
const http = require("http");
const fs = require("fs");
const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const router = require("./router");
const InitiateMongoServer = require("../config/db");
const cookierParser = require("cookie-parser");
const exphbs = require("express-handlebars");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const path = require("path");
var cors = require("cors");

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(morgan("dev"));

InitiateMongoServer();

app.use(cookierParser());

process.env.PORT = 8090;

app.use("/test", bodyParser.text({ type: "text/plain" }));
app.use(bodyParser.json());
app.use(router);

//HTTPS version
// const options = {
// key: fs.readFileSync(__dirname+'/config/keys/server.key'),
// cert: fs.readFileSync(__dirname+'/config/keys/server.cert')
// };
// const  server = https.createServer(options, app);

//HTTP version
const server = http.createServer(app);

server.listen(process.env.PORT, "localhost", () => {
  console.log("Server running..");
});
