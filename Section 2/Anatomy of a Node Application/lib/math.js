/*
 * Title: Math Library
 * Description: Utility library for math-related functions
 */

// App object
const math = {};

// Get a random integer between two integers
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
math.getRandomIntInclusive = function getRandomIntInclusive(min, max) {
  const minInt = Math.ceil(min);
  const maxInt = Math.floor(max);
  return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt; // The maximum is inclusive and the minimum is inclusive
};

// Export the library
module.exports = math;
