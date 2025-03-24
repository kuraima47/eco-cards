import type { Session } from '../types/game';
import { API_ENDPOINTS, handleResponse } from './config';

export const sessionService = {
    getAllSessions: async (): Promise<Session[]> => {
        const response = await fetch(API_ENDPOINTS.SESSIONS);
        return handleResponse(response);
    },

    getSessionById: async (id: string): Promise<Session> => {
        const response = await fetch(`${API_ENDPOINTS.SESSIONS}/${id}`);
        return handleResponse(response);
    },

    createSession: async (session: Partial<Session>): Promise<Session> => {
        const response = await fetch(API_ENDPOINTS.SESSIONS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(session),
        });
        return handleResponse(response);
    },

    updateSession: async (id: string, updates: Partial<Session>): Promise<Session> => {
        const response = await fetch(`${API_ENDPOINTS.SESSIONS}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });
        return handleResponse(response);
    },

    deleteSession: async (id: string): Promise<void> => {
        const response = await fetch(`${API_ENDPOINTS.SESSIONS}/${id}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    },

    updateSessionStatus: async (id: string, status: string): Promise<Session> => {
        const response = await fetch(`${API_ENDPOINTS.SESSIONS}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });
        return handleResponse(response);
    },

    getSessionByStatus: async (status: string): Promise<Session[]> => {
        const response = await fetch(`${API_ENDPOINTS.SESSIONS}/status/${status}`);
        return handleResponse(response);
    },

    //sendLink to join session
    sendLink: async (id: string, email: string): Promise<void> => {
        const response = await fetch(`${API_ENDPOINTS.SESSIONS}/${id}/sendLink`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });
        return handleResponse(response);
    },

    //join session
    joinSession: async (id: string, email: string): Promise<void> => {
        const response = await fetch(`${API_ENDPOINTS.SESSIONS}/${id}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });
        return handleResponse(response);
    },
};