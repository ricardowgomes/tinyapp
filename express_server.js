const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// CREATES A GET ROUTE TO urls_index
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };

  res.render("urls_index", templateVars);
});

// CREATES A GET ROUTE TO urls_new
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };

  res.render("urls_new", templateVars);
});

// CREATES A POST ROUTE FROM SUBMIT NEW
app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  res.redirect(`/urls/${randomString}`);
});

// CREATES A GET ROUTE TO urls_show
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

// CREATES A GET ROUTE TO longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// CREATES A POST ROUTE TO LOGIN
app.post("/urls/login", (req, res) => {
  res.cookie("username", req.body.username);
  const username = req.body.username;
  const templateVars = { urls: urlDatabase, username };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

// CREATES A POST ROUTE TO LOGOUT
app.post("/urls/logout", (req, res) => {
  console.log(req.body); // It returns a empty object
  res.clearCookie("username", req.body.username);
  res.redirect("/urls");
});

// CREATES A POST ROUTE TO DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(urlDatabase[req.params.shortURL]);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// CREATES A POST ROUTE TO EDIT
app.post("/urls/:shortURL/edit", (req, res) => {
  const newUrl = req.body.editURL;
  urlDatabase[req.params.shortURL] = newUrl;
  res.redirect("/urls");
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