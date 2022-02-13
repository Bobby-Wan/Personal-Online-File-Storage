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
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());

app.use(morgan("dev"));

InitiateMongoServer();

app.use(cookierParser());
//FIX session secret, save in env variable
app.use(
  session({
    secret: "Shh, its a secret!",
    store: new MemoryStore({
      //remove old sessions every 2 hours
      checkPeriod: 7200000,
    }),
    name: "user_sid",
    cookie: {
      //1 hour
      maxAge: 3600000,
    },
    resave: false,
    saveUninitialized: false,
  })
);

app.engine(
  "hbs",
  exphbs({
    extname: ".hbs",
  })
);

app.set("view engine", "hbs");

process.env.PORT = 8080;

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
