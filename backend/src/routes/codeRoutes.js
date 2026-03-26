import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { PROBLEMS } from "../data/problems.js";

dotenv.config();

const router = express.Router();

router.post("/run", async (req, res) => {
  try {
    const { language, code, problemId } = req.body;

    const problem = PROBLEMS[problemId];

    if (!problem) {
      return res.status(400).json({ error: "Invalid problemId" });
    }

    const langMap = {
      javascript: "nodejs",
      python: "python3",
      java: "java",
    };

    const jdoodleLang = langMap[language] || "nodejs";

    // 🔥 Detect console.log
    const hasConsoleLog = /console\.log\s*\(/.test(code);

    let wrappedCode = code;

    // 🔥 Auto-run test cases ONLY if no console.log
    if (!hasConsoleLog) {
      wrappedCode += "\n";

      problem.examples.forEach((example) => {
        if (problem.id === "reverse-string") {
          const arr = example.input.match(/\[(.*)\]/)[0];
          wrappedCode += `
let temp = ${arr};
${problem.starterCode.javascript.includes("reverseString") ? "reverseString" : problem.functionName}(temp);
console.log(JSON.stringify(temp));
`;
        } else {
          // extract function call from example input
          const call = example.input
            .replace(/.*=/, "")
            .trim()
            .replace(/;/g, "");

          wrappedCode += `
console.log(JSON.stringify(${problem.id === "two-sum" ? "twoSum" : "solution"}(${call})));
`;
        }
      });
    }

    const response = await fetch("https://api.jdoodle.com/v1/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        script: wrappedCode,
        language: jdoodleLang,
        versionIndex: "0",
      }),
    });

    const data = await response.json();

    const output = data.output || "";

    // 🔥 Dynamic expected output
    const expectedOutput = problem.expectedOutput[language];

    const lines = output
      .trim()
      .split("\n")
      .map((line) => line.replace(/\s+/g, ""));

    const expectedLines = expectedOutput
      .trim()
      .split("\n")
      .map((line) => line.replace(/\s+/g, ""));

    const passed =
      lines.length === expectedLines.length &&
      lines.every((line, i) => line === expectedLines[i]);

    res.json({
      success: true,
      output,
      passed,
    });

  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;