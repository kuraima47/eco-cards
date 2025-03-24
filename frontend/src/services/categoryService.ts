import type { Category, DeckContent } from '../types/game';
import { API_ENDPOINTS, handleResponse } from './config';

export const categoryService = {
    getAllCategories: async (): Promise<Category[]> => {
        const response = await fetch(API_ENDPOINTS.CATEGORIES);
        return handleResponse(response);
    },

    getCategoryById: async (id: string): Promise<Category> => {
        const response = await fetch(`${API_ENDPOINTS.CATEGORIES}/${id}`);
        return handleResponse(response);
    },

    getCategoryDeckContents: async (id: number): Promise<DeckContent[]> => {
        const response = await fetch(`${API_ENDPOINTS.CATEGORIES}/${id}/cards`);
        return handleResponse(response);
    },
    getCategoryByDeckId: async (deckId: string): Promise<Category[]> => {
        const response = await fetch(`${API_ENDPOINTS.CATEGORIES}/deck/${deckId}`);
        return handleResponse(response);
    },


    createCategory: async (category: Partial<Category>): Promise<Category> => {
        // Validation before sending
        if (!category.categoryName) {
            console.error('Missing required field: categoryName');
            throw new Error('categoryName is required');
        }
        
        const response = await fetch(API_ENDPOINTS.CATEGORIES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(category),
        });
        
        return handleResponse(response);
    },

    updateCategory: async (id: string, updates: Partial<Category>): Promise<Category> => {
        const response = await fetch(`${API_ENDPOINTS.CATEGORIES}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });
        return handleResponse(response);
    },

    deleteCategory: async (id: string): Promise<void> => {
        const response = await fetch(`${API_ENDPOINTS.CATEGORIES}/${id}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    }
};