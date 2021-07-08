const findUserByEmail = (email, database) => {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const generateRandomString = () => {
  const randomNum = 6;
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomString = "";

  for (let i = 0; i < randomNum; i++) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }

  return randomString;
};

const urlsForUser = (id, database) => {
  const longShortUrl = {};

  for (const ids in database) {
    if (database[ids].userID === id) {
      longShortUrl[ids] = database[ids].longURL;
    }
  }
  return longShortUrl;
};

module.exports = { findUserByEmail, generateRandomString, urlsForUser };