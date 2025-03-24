import type { GameCard } from '../types/game';
import { API_ENDPOINTS, handleResponse } from './config';

export const cardService = {
    getAllCards: async (): Promise<GameCard[]> => {
        const response = await fetch(API_ENDPOINTS.CARDS);
        return handleResponse(response);
    },

    getCardById: async (id: number): Promise<GameCard> => {
        const response = await fetch(`${API_ENDPOINTS.CARDS}/${id}`);
        return handleResponse(response);
    },

    createCard: async (card: Partial<GameCard>): Promise<GameCard> => {
        const response = await fetch(API_ENDPOINTS.CARDS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(card),
        });
        return handleResponse(response);
    },

    updateCard: async (id: string, updates: Partial<GameCard>): Promise<GameCard> => {
        const response = await fetch(`${API_ENDPOINTS.CARDS}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });
        return handleResponse(response);
    },

    deleteCard: async (id: string): Promise<void> => {
        const response = await fetch(`${API_ENDPOINTS.CARDS}/${id}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    },

    isCardComplete: async (id: string): Promise<boolean> => {
        const response = await fetch(`${API_ENDPOINTS.CARDS}/${id}/complete`);
        return handleResponse(response);
    }
};