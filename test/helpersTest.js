const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
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

describe('findUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.deepEqual(user.id, expectedOutput);
  });

  it('should return a user object with valid email', function () {
    const user = findUserByEmail("user2@example.com", testUsers);

    const expectedOutput = {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk"
    };
    assert.deepEqual(user, expectedOutput);

  });

  it('should return null for a non-existent email', function () {
    const user = findUserByEmail("user24@example.com", testUsers);
    const expectedOutput = null;

    assert.deepEqual(user, expectedOutput);
  });
});