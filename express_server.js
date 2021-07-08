const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');

// cookieParser was substituted by cookieSession
// const cookieParser = require('cookie-parser');
// app.use(cookieParser());
const morgan = require('morgan');

const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set('view engine', 'ejs');

const generateRandomString = () => {
  const randomNum = 6;
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomString = "";

  for (let i = 0; i < randomNum; i++) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }

  return randomString;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },

  x3BoGx: {
    longURL: "https://www.fisher.ca",
    userID: "userRandomID"
  },

  x48oGx: {
    longURL: "https://www.eitapega.ca",
    userID: "userRandomID"
  }
};

const urlsForUser = (id) => {
  const longShortUrl = {};

  for (const ids in urlDatabase) {
    if (urlDatabase[ids].userID === id) {
      longShortUrl[ids] = urlDatabase[ids].longURL;
    }
  }
  return longShortUrl;
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const findUserByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// CREATES A GET ROUTE TO urls_index
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;

  if (!userId) {
    const err = res.status(401).statusCode;
    const msg = 'You are not logged in';
    const templateVars = { msg, err };

    return res.render("error", templateVars);
  }

  const urls = urlsForUser(userId);
  const user = users[req.session.user_id];
  const templateVars = { urls, user };

  res.render("urls_index", templateVars);
});

// CREATES A GET ROUTE TO urls_new
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;

  if (!userId) {
    return res.redirect("/login");
  }

  const user = users[userId];
  const templateVars = { urls: urlDatabase, user };

  res.render("urls_new", templateVars);
});

// CREATES A GET ROUTE TO urls_show
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;


  if (!userId) {
    const err = res.status(401).statusCode;
    const msg = 'You are not logged in';
    const templateVars = { msg, err };

    return res.render("error", templateVars);
  }

  const urlKeys = Object.keys(urlsForUser(userId));

  if (!(urlKeys.includes(shortURL))) {
    const err = res.status(401).statusCode;
    const msg = 'This shortURL don\'t belong to your account';
    const templateVars = { msg, err };

    return res.render("error", templateVars);
  }

  const user = users[userId];
  const templateVars = { shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user };

  res.render("urls_show", templateVars);
});

// CREATES A GET ROUTE TO longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;

  res.redirect(longURL);
});

// CREATES A GET ROUTE TO REGISTER
app.get("/register", (req, res) => {
  const userId = req.session.user_id;

  if (userId) {
    return res.redirect("/urls");
  }

  const user = users[userId];
  const templateVars = { user };

  res.render("register", templateVars);
});

// CREATES A GET ROUTE TO LOGIN
app.get("/login", (req, res) => {
  const userId = req.session.user_id;

  if (userId) {
    return res.redirect("/urls");
  }

  const user = users[req.session.user_id];
  console.log(user);
  const templateVars = { user };

  res.render("login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// CREATES A POST ROUTE FROM SUBMIT NEW
app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] = {};
  urlDatabase[randomString].longURL = req.body.longURL;
  urlDatabase[randomString].userID = req.session.user_id;
  console.log("new_post>>", urlDatabase[randomString]);

  res.redirect(`/urls/${randomString}`);
});

// CREATES A POST ROUTE TO LOGOUT
app.post("/logout", (req, res) => {
  const userId = req.session.user_id;
  res.clearCookie("user_id", userId);
  res.clearCookie("session", "");
  res.redirect("/login");
});

// CREATES A POST ROUTE TO EDIT
app.post("/urls/:shortURL/edit", (req, res) => {
  const userId = req.session.user_id;
  //req.cookies.user_id

  if (userId !== urlDatabase[req.params.shortURL].userID) {
    const err = res.status(401).statusCode;
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
  const userId = req.session.user_id;

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
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send('email and password cannot be black');
  }

  const user = findUserByEmail(email);

  if (user) {
    return res.status(400).send('This email already exist, please try to login instead');
  }

  const userId = generateRandomString();
  // eslint-disable-next-line camelcase
  req.session.user_id = userId;

  users[userId] = {
    id: userId, email, password: hashedPassword
  };


  res.cookie("user_id", userId);

  res.redirect("/urls");
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

  const user = findUserByEmail(email);

  if (!user) {
    const err = res.status(400).statusCode;
    const msg = 'This email doesn\'t exist, please try to register instead';
    const templateVars = { msg, err };

    return res.render("error", templateVars);
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).send('This password doesn\'t match, please try again');
  }
  res.cookie("user_id", user.id);

  res.redirect("/urls");
});

