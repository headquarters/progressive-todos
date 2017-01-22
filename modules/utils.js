/**
 * Modified from http://stackoverflow.com/a/105074
 * Generates a unique-enough-for-this-app ID with 16 alphanumeric characters
 */
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + s4() + s4();
}

/**
 * Returns a random letter from the alphabet.
 */
function randomLetter() {
    var letters = "abcdefghijklmnopqrstuvwxyz";
    return letters[Math.floor((Math.random() * 100) % letters.length)];
}

/**
 * Make sure to start the DB name with a letter,
 * per Cloudant"s requirements: https://docs.cloudant.com/database.html#create
 */
function randomListName() {
    return randomLetter() + guid();
}

/**
 * Generates an ID for a todo based on timestamp plus random 3 digit number.
 * The recommendation is to use put() over post() and provide an ID
 * to support sorting: http://pouchdb.com/api.html#using-dbpost
 */
function generateID() {
    return (Math.floor((1 + Math.random()) * 0x100) +
            (new Date()).getTime()).toString();
}

module.exports = {
    randomListName: randomListName,
    generateID: generateID
};
