/*
 * Title: Basic Node Example
 * Description: Simple file that declares a few functions and invokes them.
 */

// Dependencies
const mathLib = require("./lib/math");
const jokesLib = require("./lib/jokes");

// App object
const app = {};

// Configuration
app.config = {
  timeBetweenJokes: 1000
};

// Function that prints a random joke
app.printAJoke = function printAJoke() {
  // Get all the jokes
  const allJokes = jokesLib.allJokes();

  // Get the length of the jokes
  const numberOfJokes = allJokes.length;

  // Pick a random number between 1 and the number of jokes
  const randomNumber = mathLib.getRandomIntInclusive(1, numberOfJokes);

  // Get the joke at that position in the array (minus one)
  const selectedJoke = allJokes[randomNumber - 1];

  // Send the joke to the console
  console.log(selectedJoke);
};

// Function that loops indefinitely, calling the printAJoke function as it goes
app.indefiniteLoop = function indefiniteLoop() {
  // Create the interval, using the config variable defined above
  setInterval(app.printAJoke, app.config.timeBetweenJokes);
};

// Invoke the loop
app.indefiniteLoop();
