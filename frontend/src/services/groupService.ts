import type { Group } from "../types/game";
import { API_ENDPOINTS, handleResponse } from "./config";

export const groupService = {
  getAllGroups: async (): Promise<Group[]> => {
    const response = await fetch(API_ENDPOINTS.GROUPS);
    return handleResponse(response);
  },

  getGroupById: async (id: number): Promise<Group> => {
    const response = await fetch(`${API_ENDPOINTS.GROUPS}/${id}`);
    return handleResponse(response);
  },

  getGroupsBySessionId: async (sessionId: number): Promise<Group[]> => {
    const response = await fetch(`${API_ENDPOINTS.GROUPS}/session/${sessionId}`);
    return handleResponse(response);
  },

  createGroup: async (group: Partial<Group>): Promise<Group> => {
    const response = await fetch(API_ENDPOINTS.GROUPS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(group),
    });
    return handleResponse(response);
  },

  updateGroup: async (id: number, updates: Partial<Group>): Promise<Group> => {
    const response = await fetch(`${API_ENDPOINTS.GROUPS}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  deleteGroup: async (id: number): Promise<void> => {
    const response = await fetch(`${API_ENDPOINTS.GROUPS}/${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },
};
