import type { DeckContent } from '../types/game';
import { API_ENDPOINTS, handleResponse } from './config';

export const deckContentService = {
    getAllDeckContents: async (): Promise<DeckContent[]> => {
        const response = await fetch(API_ENDPOINTS.DECK_CONTENTS);
        return handleResponse(response);
    },

    getDeckContentsByDeckId: async (deckId: string): Promise<DeckContent[]> => {
        const response = await fetch(`${API_ENDPOINTS.DECK_CONTENTS}/deck/${deckId}`);
        return handleResponse(response);
    },

    createDeckContent: async (deckContent: DeckContent): Promise<DeckContent> => {
        const response = await fetch(API_ENDPOINTS.DECK_CONTENTS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(deckContent),
        });
        return handleResponse(response);
    },

    deleteDeckContent: async (deckId: string, cardId: string): Promise<void> => {
        const response = await fetch(`${API_ENDPOINTS.DECK_CONTENTS}/${deckId}/${cardId}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    },
};