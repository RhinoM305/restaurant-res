const path = require("path");
require("dotenv").config();
const { DATABASE_URL, DATABASE_URL_DEVELOPMENT, DATABASE_URL_TEST } =
  process.env;

module.exports = {
  development: {
    client: "postgresql",
    connection: DATABASE_URL_DEVELOPMENT,
    migrations: {
      directory: path.join(__dirname, "src", "db", "migrations"),
    },
    seeds: {
      directory: "./src/db/seeds",
    },
  },
  test: {
    client: "postgresql",
    connection: DATABASE_URL_TEST,
  },
  production: {
    client: "postgresql",
    connection: DATABASE_URL,
  },
};
