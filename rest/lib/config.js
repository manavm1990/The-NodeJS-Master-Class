const envs = {};

// Default env
envs.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  name: "staging"
};

envs.production = {
  httpPort: 5000,
  httpsPort: 5001,
  name: "production"
};

// Check the cl argument to get the correct environment passed.
const clEnv =
  typeof process.env.NODE_ENV === "string"
    ? process.env.NODE_ENV.toLowerCase()
    : "staging";

// Verify that the clEnv is actually a valid env object that we have defined in envs.
const exportedEnv =
  typeof envs[clEnv] === "object" ? envs[clEnv] : envs.staging;

module.exports = exportedEnv;
