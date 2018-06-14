const envs = {};

// Default env
envs.staging = {
  port: 3000,
  name: "staging"
};

envs.production = {
  port: 5000,
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
