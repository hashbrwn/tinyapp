const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session')

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['ABDI'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const {getUserByEmail, generateRandomString, urlsForUser} = require("./helpers")


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.session["user_id"];
  if (!userId) {
    return res.status(403).send("<h1>must be logged in!</h1>");
  }

  const urls = urlsForUser(userId, urlDatabase);
  const user = users[userId];
  const templateVars = { urls, user: user };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session["user_id"]) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[req.session["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session["user_id"];
  if (!userId) {
    return res.status(403).send("<h1>must be logged in!</h1>");
  }
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.send("<h1>Url is not exist</h1>");
  }
  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID !== userId) {
    return res.send("Your are not allowed to see this url");
  }
  const longURL = urlDatabase[shortURL].longURL;

  const templateVars = {
    shortURL,
    longURL,
    user: users[req.session["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const userId = req.session["user_id"];
  if (!userId) {
    res.redirect("/login");
  }
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID !== userId) {
    return res.send("Your are not allowed to delete this url");
  }

  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL] === undefined) {
    return res.status(400).send("this short url does not exist!");
  } else {
    return res.redirect(urlDatabase[shortURL].longURL);
  }
});

app.get("/register", (req, res) => {
  const templateVars = { user: null };

  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: null };
  res.render("urls_login", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID: req.session["user_id"] };
  res.redirect("/urls/" + shortURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.redirect("/login");
  }
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID !== userId) {
    return res.send("Your are not allowed to delete this url");
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.id;

  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: users[req.session["user_id"]],
  };

  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(400).send("incorrect credentials!");
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).send("incorrect credentials!");
  }

  
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  
  req.session.user_id = null;
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("fill out email and password");
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send("email already exists");
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = { id, email, password: hashedPassword };
  users[id] = user;

  req.session.user_id = id;
  res.redirect("/urls");
});



