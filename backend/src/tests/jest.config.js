/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", {
      isolatedModules: true,
      useESM: true,
    }],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(uuid)/)"
  ],
};