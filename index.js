const http = require("http");
const express = require("express");
const app = express();
const authenticateToken = require("./middleware/authmiddleware");
const path = require("path");
const bodyparser = require("body-parser");
const db = require("./config/database");
const port = 8080;

const server = http.createServer(app);

var jsonparser = bodyparser.json();

app.use(express.static(path.join(__dirname, "/static")));
app.use(jsonparser);

app.get("/", (req, res) => {
  res.status(200).send("Page open");
});

app.post("/api/admin/signup", jsonparser, async (req, res) => {
  var user = req.body.username;
  var password = req.body.password;
  var email = req.body.email;

  var newpwd = await encrypt.hash(password, 10);

  var stmt, userID;
  var query_params = [user, newpwd, email];

  stmt = "SELECT * FROM users WHERE email = ?";
  db.query(sql, email, function (err, data) {
    if (err) {
      console.error("Error checking user existence:", err);
      return res.status(500).send("Internal Server Error");
    }

    var msg;

    if (data.length > 0) {
      msg = email + " already exists";
      console.log(msg);
    }
    stmt = "INSERT INTO users(username, password, email) VALUES ?";
    db.query(stmt, [query_params], function (err, result) {
      if (err) {
        console.error("Error inserting user:", err);
        return res.status(500).send("Internal Server Error");
      }
      console.log("Number of records inserted: " + result.affectedRows);
      userID = result.insertId;
      msg = "Registration successful. Please go to the login page.";
      return res.render("signup", { alertMsg: msg });
    });
  });

  res.json({
    status: "Admin account successfully created",
    status_code: "200",
    user_id: userID,
  });
});

app.post("/api/admin/login", jsonparser, async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  const isAuthenticated = await authenticateUser(username, password);

  if (isAuthenticated) {
    const accessToken = generateAccessToken(username);

    res.json({
      status: "Login successful",
      status_code: 200,
      user_id: "",
      access_token: accessToken,
    });
  } else {
    res.status(401).json({
      status: "Incorrect username/password provided. Please retry",
      status_code: 401,
    });
  }
});

async function authenticateUser(username, password) {
  stmt = "SELECT username, password FROM users WHERE username = ?";
  var usnm, pwd;
  db.query(stmt, username, function (err, data) {
    usnm = data.username;
    pwd = data.password;
  });
  bcrypt.compare(password, pwd, function (err, result) {
    bres = result;
    if (username === usnm && password === bres) {
      return true;
    } else {
      return false;
    }
  });
}

function generateAccessToken(username) {
  const tokenPayload = {
    username: username,
  };

  const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";

  return accessToken;
}

server.listen(port, () => {
  console.log("Server listening on port " + port);
});

db.connect((err, connection) => {
  if (err) throw err;
  console.log("Database connected");
});
