import axiosInstance from "../lib/axios";
import { getToken } from "@clerk/clerk-react";

export const sessionApi = {
  createSession: async (data) => {
    const token = await getToken();

    const response = await axiosInstance.post("/sessions", data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  },

  getActiveSessions: async () => {
    const token = await getToken();

    const response = await axiosInstance.get("/sessions/active", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  },

  getMyRecentSessions: async () => {
    const token = await getToken();

    const response = await axiosInstance.get("/sessions/my-recent", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  },

  getSessionById: async (id) => {
    const token = await getToken();

    const response = await axiosInstance.get(`/sessions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  },

  joinSession: async (id) => {
    const token = await getToken();

    const response = await axiosInstance.post(
      `/sessions/${id}/join`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  },

  endSession: async (id) => {
    const token = await getToken();

    const response = await axiosInstance.post(
      `/sessions/${id}/end`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  },

  getStreamToken: async () => {
    const token = await getToken();

    const response = await axiosInstance.get(`/chat/token`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  },
};