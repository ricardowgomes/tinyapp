const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcrypt');

// Helper functions >>
const { findUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set('view engine', 'ejs');

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://drive.google.com/file/d/1zjH-Vd4hMN0PC1DjWo4iDirSsZ7n-j18/view?usp=sharing",
    userID: "user2RandomID"
  },
  i3BoGr: {
    longURL: "https://www.verylongurlthatyoucertainlyneedtoshorten.ca",
    userID: "user2RandomID"
  },

  x3BoGx: {
    longURL: "https://drive.google.com/file/d/1zjH-Vd4hMN0PC1DjWo4iDirSsZ7n-j18/view?usp=sharing",
    userID: "userRandomID"
  },
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2b$10$B86Uq9ZB2mjQaRKTLPWCjO9OdTE64mrk1IGJTosKrUN8R6QJtN68a" // "purple-monkey-dinosaur"

  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2b$10$8Tli7jTTBqaZekMVwHKJJui9VqLmM/JrOTbfTTAuPtKh6UmEggW/e" // "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    res.redirect("/login");
  }

  res.redirect("/urls");
});

// CREATES A GET ROUTE TO urls_index
app.get("/urls", (req, res) => {
  const userId = req.session.userId;

  console.log(userId);

  if (!userId) {
    const err = res.status(401).statusCode;
    const msg = 'You are not logged in';
    const templateVars = { msg, err };

    return res.render("error", templateVars);
  }

  const urls = urlsForUser(userId, urlDatabase);
  const user = users[req.session.userId];
  const templateVars = { urls, user };

  res.render("urls_index", templateVars);
});

// CREATES A GET ROUTE TO urls_new
app.get("/urls/new", (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.redirect("/login");
  }

  const user = users[userId];
  const templateVars = { urls: urlDatabase, user };

  res.render("urls_new", templateVars);
});

// CREATES A GET ROUTE TO urls_show
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.userId;
  const shortURL = req.params.shortURL;


  if (!userId) {
    const err = res.status(401).statusCode;
    const msg = 'You are not logged in';
    const templateVars = { msg, err };

    return res.render("error", templateVars);
  }

  const urlKeys = Object.keys(urlsForUser(userId, urlDatabase));

  if (!(urlKeys.includes(shortURL))) {
    const err = res.status(403).statusCode;
    const msg = 'This shortURL doesn\'t exist or doesn\'t belong to your account';
    const templateVars = { msg, err };

    return res.render("error", templateVars);
  }

  const user = users[userId];
  const templateVars = { shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user };

  res.render("urls_show", templateVars);
});

// CREATES A GET ROUTE TO longURL
app.get("/u/:shortURL", (req, res) => {

  if (!urlDatabase[req.params.shortURL]) {
    const err = res.status(404).statusCode;
    const msg = 'Sorry, this page doesn\'t exist';
    const templateVars = { msg, err };

    return res.render("error", templateVars);
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;

  res.redirect(longURL);
});

// CREATES A GET ROUTE TO REGISTER
app.get("/register", (req, res) => {
  const userId = req.session.userId;

  if (userId) {
    return res.redirect("/urls");
  }

  const user = users[userId];
  const templateVars = { user };

  res.render("register", templateVars);
});

// CREATES A GET ROUTE TO LOGIN
app.get("/login", (req, res) => {
  const userId = req.session.userId;

  if (userId) {
    return res.redirect("/urls");
  }

  const user = users[req.session.userId];
  console.log(user);
  const templateVars = { user };

  res.render("login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// CREATES A POST ROUTE FROM SUBMIT NEW
app.post("/urls", (req, res) => {
  const userId = req.session.userId;
  const randomString = generateRandomString();
  urlDatabase[randomString] = {};
  urlDatabase[randomString].longURL = req.body.longURL;
  urlDatabase[randomString].userID = userId;

  if (!userId) {
    const err = res.status(401).statusCode;
    const msg = 'You are not logged in';
    const templateVars = { msg, err };

    return res.render("error", templateVars);
  }

  res.redirect(`/urls/${randomString}`);
});

// CREATES A POST ROUTE TO LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// CREATES A POST ROUTE TO EDIT
app.post("/urls/:shortURL/edit", (req, res) => {
  const userId = req.session.userId;

  if (userId !== urlDatabase[req.params.shortURL].userID) {
    const err = res.status(403).statusCode;
    const msg = 'You are not authorized to do that!';
    const templateVars = { msg, err };

    return res.render("error", templateVars);
  }

  const newUrl = req.body.editURL;
  urlDatabase[req.params.shortURL].longURL = newUrl;
  res.redirect("/urls");
});

// CREATES A POST ROUTE TO DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    const err = res.status(401).statusCode;
    const msg = 'You are not logged in';
    const templateVars = { msg, err };

    return res.render("error", templateVars);
  }

  if (userId !== urlDatabase[req.params.shortURL].userID) {
    const err = res.status(401).statusCode;
    const msg = 'You are not authorized to do that!';
    const templateVars = { msg, err };

    return res.render("error", templateVars);
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// CREATES A POST ROUTE TO REGISTER
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    const err = res.status(400).statusCode;
    const msg = 'Email and password cannot be black';
    const templateVars = { msg, err };

    return res.render("error", templateVars);
  }

  const user = findUserByEmail(email, users);

  if (user) {
    const err = res.status(400).statusCode;
    const msg = 'This email already exist, please try to login instead';
    const templateVars = { msg, err };

    return res.render("error", templateVars);
  }
  const userId = generateRandomString();

  bcrypt.genSalt(10)
    .then((salt) => {
      return bcrypt.hash(password, salt);
    })
    .then((hash) => {
      const hashedPassword = hash;

      users[userId] = {
        id: userId, email, password: hashedPassword
      };

      req.session.userId = userId;

      res.redirect("/urls");
    });
});

// CREATES A POST ROUTE TO LOGIN
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    const err = res.status(400).statusCode;
    const msg = 'Email and password cannot be blank';
    const templateVars = { msg, err };
    return res.render("error", templateVars);
  }

  const user = findUserByEmail(email, users);

  if (!user) {
    const err = res.status(400).statusCode;
    const msg = 'This email doesn\'t exist, please try to register instead';
    const templateVars = { msg, err };

    return res.render("error", templateVars);
  }
  console.log("password", password);
  console.log("userpassword", user.password);
  console.log("compare", bcrypt.compare(password, user.password));

  bcrypt.compare(password, user.password)
    .then((result) => {
      if (result) {
        req.session.userId = user.id;
        res.redirect("/urls");
      }
      const err = res.status(400).statusCode;
      const msg = 'This password doesn\'t match, please try again';
      const templateVars = { msg, err };

      return res.render("error", templateVars);
    });
});

