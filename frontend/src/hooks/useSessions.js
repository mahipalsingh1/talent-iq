import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { sessionApi } from "../api/sessions";
import { useAuth } from "@clerk/clerk-react"; // ✅ ADD THIS

export const useCreateSession = () => {
  const { getToken } = useAuth(); // ✅ ADD

  return useMutation({
    mutationKey: ["createSession"],
    mutationFn: async (data) => {
      const token = await getToken();
      return sessionApi.createSession(data, token);
    },
    onSuccess: () => toast.success("Session created successfully!"),
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to create room"),
  });
};

export const useActiveSessions = () => {
  const { getToken } = useAuth(); // ✅ ADD

  return useQuery({
    queryKey: ["activeSessions"],
    queryFn: async () => {
      const token = await getToken();
      return sessionApi.getActiveSessions(token);
    },
  });
};

export const useMyRecentSessions = () => {
  const { getToken } = useAuth(); // ✅ ADD

  return useQuery({
    queryKey: ["myRecentSessions"],
    queryFn: async () => {
      const token = await getToken();
      return sessionApi.getMyRecentSessions(token);
    },
  });
};

export const useSessionById = (id) => {
  const { getToken } = useAuth(); // ✅ ADD

  return useQuery({
    queryKey: ["session", id],
    queryFn: async () => {
      const token = await getToken();
      return sessionApi.getSessionById(id, token);
    },
    enabled: !!id,
    refetchInterval: 5000,
  });
};

export const useJoinSession = () => {
  const { getToken } = useAuth(); // ✅ ADD

  return useMutation({
    mutationKey: ["joinSession"],
    mutationFn: async (id) => {
      const token = await getToken();
      return sessionApi.joinSession(id, token);
    },
    onSuccess: () => toast.success("Joined session successfully!"),
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to join session"),
  });
};

export const useEndSession = () => {
  const { getToken } = useAuth(); // ✅ ADD

  return useMutation({
    mutationKey: ["endSession"],
    mutationFn: async (id) => {
      const token = await getToken();
      return sessionApi.endSession(id, token);
    },
    onSuccess: () => toast.success("Session ended successfully!"),
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to end session"),
  });
};