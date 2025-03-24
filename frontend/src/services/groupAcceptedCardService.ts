import type { GroupAcceptedCard } from '../types/game';
import { API_ENDPOINTS, handleResponse } from './config';

export const groupAcceptedCardService = {
    getAllGroupAcceptedCards: async (): Promise<GroupAcceptedCard[]> => {
        const response = await fetch(API_ENDPOINTS.GROUP_ACCEPTED_CARDS);
        return handleResponse(response);
    },

    getGroupAcceptedCardsByGroupId: async (groupId: string): Promise<GroupAcceptedCard[]> => {
        const response = await fetch(`${API_ENDPOINTS.GROUP_ACCEPTED_CARDS}/group/${groupId}`);
        return handleResponse(response);
    },

    createGroupAcceptedCard: async (groupAcceptedCard: GroupAcceptedCard): Promise<GroupAcceptedCard> => {
        const response = await fetch(API_ENDPOINTS.GROUP_ACCEPTED_CARDS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(groupAcceptedCard),
        });
        return handleResponse(response);
    },

    deleteGroupAcceptedCard: async (groupId: string, cardId: string): Promise<void> => {
        const response = await fetch(`${API_ENDPOINTS.GROUP_ACCEPTED_CARDS}/${groupId}/${cardId}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    },
};