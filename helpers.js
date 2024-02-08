const generateRandomString = function() {
  return Math.random().toString(20).substr(2, 6);
}

const getUserByEmail = function(email, database) {
  for (let keys in database) {
    if (database[keys].email === email) {
      return database[keys];
    }
  }
  return null;
}

const urlsForUser = function(userId, urldatabase) {
  const userUrls = {};
  for (let shortUrl in urldatabase) {
    if (urldatabase[shortUrl].userID === userId) {
      userUrls[shortUrl] = urldatabase[shortUrl];
    }
  }
  return userUrls;
}


// const urlDatabase = {};
const urlDatabase = {
  b6UTxQ: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// const users = {};
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

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
  urlDatabase,
  users,
}