import type { GameDeck, Category, GameCard } from '../types/game';
import { API_ENDPOINTS, handleResponse } from './config';

export const deckService = {
    getAllDecks: async (): Promise<GameDeck[]> => {
        const response = await fetch(API_ENDPOINTS.DECKS);
        return handleResponse(response);
    },

    getDeckById: async (id: string): Promise<GameDeck> => {
        const response = await fetch(`${API_ENDPOINTS.DECKS}/${id}`);
        return handleResponse(response);
    },

    createDeck: async (deck: Partial<GameDeck>): Promise<GameDeck> => {
        const response = await fetch(API_ENDPOINTS.DECKS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(deck),
        });
        return handleResponse(response);
    },

    updateDeck: async (id: string, updates: Partial<GameDeck>): Promise<GameDeck> => {
        const response = await fetch(`${API_ENDPOINTS.DECKS}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });
        return handleResponse(response);
    },

    deleteDeck: async (id: string): Promise<void> => {
        const response = await fetch(`${API_ENDPOINTS.DECKS}/${id}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    },

    getDeckCategories: async (deckId: number): Promise<Category[]> => {
        const response = await fetch(`${API_ENDPOINTS.DECKS}/${deckId}/categories`);
        return handleResponse(response);
    },
    getDeckCards: async (deckId: string): Promise<GameCard[]> => {
        const contentsResponse = await fetch(`${API_ENDPOINTS.DECKS}/${deckId}/cards`);
        const deckContents = await handleResponse(contentsResponse);
        
        const cards = await Promise.all(
            deckContents.map(async (content: { cardId: number }) => {
                const response = await fetch(`${API_ENDPOINTS.CARDS}/${content.cardId}`);
                return handleResponse(response);
            })
        );
        
        return cards;
    },
};