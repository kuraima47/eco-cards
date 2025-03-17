import type { User } from '../types/game';
import { API_ENDPOINTS, handleResponse } from './config';

export const userService = {
    getAllUsers: async (): Promise<User[]> => {
        const response = await fetch(API_ENDPOINTS.USERS);
        return handleResponse(response);
    },

    getUserById: async (id: string): Promise<User> => {
        const response = await fetch(`${API_ENDPOINTS.USERS}/${id}`);
        return handleResponse(response);
    },

    createUser: async (user: Partial<User>): Promise<User> => {
        const response = await fetch(API_ENDPOINTS.USERS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });
        return handleResponse(response);
    },

    updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
        const response = await fetch(`${API_ENDPOINTS.USERS}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });
        return handleResponse(response);
    },

    deleteUser: async (id: string): Promise<boolean> => {
        const response = await fetch(`${API_ENDPOINTS.USERS}/${id}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    },
};