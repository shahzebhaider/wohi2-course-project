const { defineConfig } = require("vitest/config");
require("dotenv").config();

module.exports = defineConfig({
  test: {
    environment: "node",
    globals: true,
    fileParallelism: false,
    maxConcurrency: 1,
  },
});