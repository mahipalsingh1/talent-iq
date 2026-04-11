import { StreamVideoClient } from "@stream-io/video-react-sdk";

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

let client = null;

export const initializeStreamClient = async (user, token) => {
  try {
    // ✅ VALIDATION FIX
    if (!user || !user.id) {
      throw new Error("Invalid user data");
    }

    if (!token) {
      throw new Error("Stream token missing");
    }

    if (!apiKey) {
      throw new Error("Stream API key is not provided.");
    }

    // ✅ REUSE EXISTING CLIENT
    if (client && client?.user?.id === user.id) {
      return client;
    }

    // ✅ CLEAN OLD CLIENT
    if (client) {
      await disconnectStreamClient();
    }

    // ✅ CREATE NEW CLIENT
    client = new StreamVideoClient({
      apiKey,
      user: {
        id: user.id,
        name: user.name || "User",
        image: user.image || "",
      },
      token,
    });

    return client;

  } catch (error) {
    console.error("Stream Init Error:", error);
    throw error;
  }
};

export const disconnectStreamClient = async () => {
  try {
    if (client) {
      await client.disconnectUser();
      client = null;
    }
  } catch (error) {
    console.error("Error disconnecting Stream client:", error);
  }
};
