module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    coveragePathIgnorePatterns: ["/node_modules/", "/coverage/", "/logs/"],
    testTimeout: 70000,
};
