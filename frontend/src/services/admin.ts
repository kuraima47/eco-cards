// adminApi.tsx
import type { Category, GameDeck, GameCard } from '../types/game';
import { cardService } from "./cardService";
import { categoryService } from './categoryService';
import { deckContentService } from "./deckContentService";
import { deckService } from "./deckService";

export const adminApi = {
    // Catégories
    loadCategories: async () => {
        try {
            return await categoryService.getAllCategories();
        } catch (error) {
            console.error('Error loading categories:', error);
            throw error;
        }
    },

    loadCategoryByDeckId: async (deckId: string) => {
        try {
            return await categoryService.getCategoryByDeckId(deckId);
        } catch (error) {
            console.error('Error loading category by deck id:', error);
            throw error;
        }
    },

    addCategory: async (category: Partial<Category>) => {
        return await categoryService.createCategory(category);
    },

    updateCategory: async (id: number, updates: Partial<Category>) => {
        return await categoryService.updateCategory(String(id), updates);
    },

    deleteCategory: async (categoryId: string) => {
        return await categoryService.deleteCategory(categoryId);
    },

    // Decks
    loadDecks: async () => {
        return await deckService.getAllDecks();
    },

    addDeck: async (deck: GameDeck) => {
        return await deckService.createDeck(deck);
    },

    updateDeck: async (deckId: string, updates: Partial<GameDeck>) => {
        return await deckService.updateDeck(deckId, updates);
    },

    deleteDeck: async (deckId: string) => {
        return await deckService.deleteDeck(deckId);
    },

    // Cartes
    loadCards: async (deckId: string) => {
        const data: GameCard[] = [];
        const contents = await deckContentService.getDeckContentsByDeckId(deckId);
        for (const content of contents) {
            data.push(await cardService.getCardById(content.cardId));
        }
        return data;
    },

    addCard: async (card: Partial<GameCard>) => {
        await cardService.createCard(card);
    },

    updateCard: async (cardId: string, updates: Partial<GameCard>) => {
        return await cardService.updateCard(cardId, updates);
    },

    deleteCard: async (cardId: string) => {
        return await cardService.deleteCard(cardId);
    },

    importCards: async (deckId: number, cards: GameCard[]) => {
        for (const card of cards) {
            await deckContentService.createDeckContent({ deckId, cardId: card.cardId });
        }
    },

    loadAllData: async () => {
        try {
            const [decks, categories, cards] = await Promise.all([
                deckService.getAllDecks(),
                categoryService.getAllCategories(),
                cardService.getAllCards(),
            ]);
            return { decks, categories, cards };
        } catch (error) {
            console.error('Error loading all data:', error);
            throw error;
        }
    }
};
