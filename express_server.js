const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// CREATES A GET ROUTE TO urls_index
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// CREATES A GET ROUTE TO urls_new
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// CREATES A POST ROUTE TO urls_new
app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL;
  console.log(urlDatabase);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

// CREATES A GET ROUTE TO urls_show
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

const generateRandomString = () => {
  const randomNum = 6;
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomString = "";

  for (let i = 0; i < randomNum; i++) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }

  return randomString;
};