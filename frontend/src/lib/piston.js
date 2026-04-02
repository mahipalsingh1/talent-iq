// 🚀 Backend proxy execution (FINAL FIXED)

const BACKEND_API = "https://mahis-talent-iq.onrender.com/api/code";

const LANGUAGE_VERSIONS = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
};

// ✅ ADD problemId parameter
export async function executeCode(language, code, problemId) {
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
      },
      body: JSON.stringify({
        language: languageConfig.language,
        code: code,
        problemId: problemId, // 🔥 IMPORTANT FIX
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
      success: data.passed,
      output: data.output || "No output",
      error: data.passed ? null : "Tests failed",
    };

  } catch (error) {
    console.error("EXECUTION ERROR:", error);

    return {
      success: false,
      error: `Failed to execute code: ${error.message}`,
    };
  }
}
