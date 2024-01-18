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

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser
}