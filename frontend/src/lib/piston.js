// 🚀 Backend proxy execution (FINAL FIXED)

// ✅ use ENV instead of hardcoded
const BACKEND_API = import.meta.env.VITE_API_URL + "/api/code";

const LANGUAGE_VERSIONS = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
};

// ✅ ADD token parameter
export async function executeCode(language, code, problemId, token) {
  try {
    const languageConfig = LANGUAGE_VERSIONS[language];

    if (!languageConfig) {
      return {
        success: false,
        error: `Unsupported language: ${language}`,
      };
    }

    const response = await fetch(`${BACKEND_API}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ FIX
      },
      body: JSON.stringify({
        language: languageConfig.language,
        code: code,
        problemId: problemId,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("API ERROR:", text);

      return {
        success: false,
        error: `HTTP error! status: ${response.status}`,
      };
    }

    const data = await response.json();

    console.log("BACKEND RESPONSE:", data);

    return {
      success: data.success, // ✅ FIX (not passed)
      output: data.output || "No output",
      error: data.success ? null : "Execution failed",
      passed: data.passed, // optional
    };

  } catch (error) {
    console.error("EXECUTION ERROR:", error);

    return {
      success: false,
      error: `Failed to execute code: ${error.message}`,
    };
  }
}