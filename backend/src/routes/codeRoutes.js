import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { PROBLEMS } from "../data/problems.js";

dotenv.config();

const router = express.Router();

router.post("/run", async (req, res) => {
  try {
    const { language, code, problemId } = req.body;

    console.log("🔥 BACKEND RECEIVED:", {
      language,
      problemId,
      code: code?.slice(0, 50),
    });

    // ✅ VALIDATION
    if (!language || !code || !problemId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const problem = PROBLEMS[problemId];

    if (!problem) {
      return res.status(400).json({
        success: false,
        error: "Invalid problemId",
      });
    }

    // ✅ LANGUAGE MAP
    const langMap = {
      javascript: "nodejs",
      python: "python3",
      java: "java",
    };

    const jdoodleLang = langMap[language] || "nodejs";

    // ✅ Detect console.log / print
    const hasConsoleLog =
      /console\.log\s*\(/.test(code) || /print\s*\(/.test(code);

    let wrappedCode = code;

    // ✅ FUNCTION NAME DETECTION
    let functionName = "solution";

    if (problemId === "two-sum") functionName = "twoSum";
    else if (problemId === "reverse-string") functionName = "reverseString";
    else if (problemId === "valid-palindrome") functionName = "isPalindrome";
    else if (problemId === "maximum-subarray") functionName = "maxSubArray";
    else if (problemId === "container-with-most-water") functionName = "maxArea";

    // ✅ GET TEST INPUTS (dynamic per problem)
    const testInputs = problem.testInputs?.[language] || [];

    // ✅ AUTO TEST RUN (LANGUAGE SAFE)
    if (!hasConsoleLog && testInputs.length > 0) {
      wrappedCode += "\n";

      testInputs.forEach((input) => {
        // ✅ JAVASCRIPT
        if (language === "javascript") {
          wrappedCode += `
try {
  const result = ${functionName}(${input});
  console.log(result);
} catch (e) {
  console.log("ERROR:", e.message);
}
`;
        }

        // ✅ PYTHON (FIXED)
        else if (language === "python") {
          wrappedCode += `
try:
    result = ${functionName}(${input})
    print(result)
except Exception as e:
    print("ERROR:", e)
`;
        }

        // ✅ JAVA (basic fallback)
        else if (language === "java") {
          wrappedCode += `
// Java execution requires full class structure
`;
        }
      });
    }

    console.log("🧠 FINAL CODE:\n", wrappedCode);

    // ✅ JDoodle API CALL
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

    if (!data) {
      return res.status(500).json({
        success: false,
        error: "JDoodle failed",
      });
    }

    const output = data.output || "";

    console.log("📤 OUTPUT:", output);

    // ✅ EXPECTED OUTPUT MATCHING
    const expectedOutput = problem.expectedOutput?.[language] || "";

    const normalize = (text) =>
      text
        .trim()
        .split("\n")
        .map((line) => line.replace(/\s+/g, ""));

    const lines = normalize(output);
    const expectedLines = normalize(expectedOutput);

    const passed =
      lines.length === expectedLines.length &&
      lines.every((line, i) => line === expectedLines[i]);

    res.json({
      success: true,
      output,
      passed,
    });

  } catch (error) {
    console.error("🔥 ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;