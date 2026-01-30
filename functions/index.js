const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Import and re-export the functions from their individual files
const generate = require("./generate");
const analyzeDecision = require("./analyze-decision");
const calculate = require("./calculate");

exports.generate = generate.generate;
exports.analyzeDecision = analyzeDecision.analyzeDecision;
exports.calculate = calculate.calculate;
