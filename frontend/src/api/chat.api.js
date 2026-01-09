// src/features/chat/api/chat.api.js
import apiClient from "~/services/apiClient";
import { endpoints } from "~/services/endpoints";

export const chatApi = (payload) => {
  // ✅ endpoints của bạn có /api/v1 sẵn
  return apiClient.post(endpoints.chat.send, payload);
};
