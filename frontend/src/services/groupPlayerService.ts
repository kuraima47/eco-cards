import type { GroupPlayer } from '../types/game';
import { API_ENDPOINTS, handleResponse } from './config';

export const groupPlayerService = {
  getAllGroupPlayers: async (): Promise<GroupPlayer[]> => {
    const response = await fetch(API_ENDPOINTS.GROUP_PLAYERS);
    return handleResponse(response);
  },

  getGroupPlayersByGroupId: async (groupId: number): Promise<GroupPlayer[]> => {
    const response = await fetch(`${API_ENDPOINTS.GROUP_PLAYERS}/group/${groupId}`);
    return handleResponse(response);
  },

  createGroupPlayer: async (groupPlayer: GroupPlayer): Promise<GroupPlayer> => {
    const response = await fetch(API_ENDPOINTS.GROUP_PLAYERS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groupPlayer),
    });
    return handleResponse(response);
  },

  deleteGroupPlayer: async (groupId: number, username: string): Promise<void> => {
    const response = await fetch(
      `${API_ENDPOINTS.GROUP_PLAYERS}/${groupId}/${encodeURIComponent(username)}`, 
      {
        method: 'DELETE',
      }
    );
    return handleResponse(response);
  },
};
