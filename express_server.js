const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const bcrypt = require("bcryptjs");
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['ABDI'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(function(req, res, next) {
  res.locals.user_id = req.session.user_id || false;
  next();
});



// Importing urlDatabase and users from the helpers.js file
const { urlDatabase, users } = require("./helpers");
app.get("/users", (req, res) => {
  res.json(users);
});



// --- functions


const { getUserByEmail } = require('./helpers');

function generateRandomString() {
  let random = Math.random().toString(36).substr(2, 6);
  return random;
}

function generateRandomUserID() {
  let userID = Math.random().toString(36).substr(2, 6);
  return userID;
}

function urlsForUser(id, database) {
  let filteredUrls = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      filteredUrls[shortURL] = database[shortURL];
    }
  }
  return filteredUrls;
}



// ----  DB check


app.get('/users.json', (req, res) => {
  res.json(users);
});

app.get('/', (req, res) => {
  if (req.session.user_id ) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});


// -----GET endpoints ----

app.get("/", (req, res) => {
  res.send("Hello!");
});

// My URLs page
app.get("/urls", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login");
    return;
  }
  let filteredUrls = urlsForUser(req.session.user_id, urlDatabase);

  const templateVars = {
    urls: filteredUrls,
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});


// Create New URL
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let templateVars = {user: users[req.session.user_id]};
    res.render("urls_new", templateVars);
  }
  res.redirect("/login");
  return;
});


//Short URL
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = {
    id: req.params.id,
    shortURL: req.params.id,
    longURL: urlDatabase[id].longURL,
    user: req.session.user_id
  };
  res.render("urls_show", templateVars);
});





app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (id === undefined) {
    res.status(403);
    return res.send('403 - URL does not exist');
  }
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  const templateVars = { user: null};
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  if (req.session.user_id ) {
    res.redirect("/urls");
    return;
  }
  const templateVars = { user: null};
  res.render("urls_login", templateVars);
});


// ------- POST endpoints ---------

// Create New URL
app.post(`/urls`, (req, res) => {
  let random = generateRandomString();
  urlDatabase[random] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${random}`);
});


// Delete in My URL page
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Update in My URL page
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id].longURL = longURL;
  res.redirect('/urls');
});



// Login
app.post("/login", (req, res) => {
  let user = getUserByEmail(req.body.email, users);
  if (user !== undefined) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;
      return res.redirect('/urls');
    } else {
      res.status(403);
      return res.send('403 - Wrong password');
    }
  } else {
    res.status(403);
    return res.send('403 - Email address is not registered');
  }
});


// Logout
app.post("/logout", (req, res) => {
  // res.clearCookie('session');
  // res.clearCookie('session.sig');
  req.session = null; 
  res.redirect('/login');
});


// Registration page
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  let user_id = generateRandomUserID();
  for (let user in users) {
    if (email === users[user].email) {
      res.status(403);
      return res.send('403 - User already exists');
    }
    if (email === '' || password === '') {
      res.status(403);
      return res.send('403 - Email address or password is not entered');
    }
  }
  users[user_id] = {
    id: user_id,
    email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.user_id = user_id;
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



