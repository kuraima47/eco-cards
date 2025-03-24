const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
//const API_BASE_URL = "http://localhost:3000/api"
export const API_ENDPOINTS = {
    AUTH: `${API_BASE_URL}/auth`,
    USERS: `${API_BASE_URL}/users`,
    CARDS: `${API_BASE_URL}/cards`,
    CATEGORIES: `${API_BASE_URL}/categories`,
    DECKS: `${API_BASE_URL}/decks`,
    DECK_CONTENTS: `${API_BASE_URL}/deck-contents`,
    SESSIONS: `${API_BASE_URL}/sessions`,
    GROUPS: `${API_BASE_URL}/groups`,
    GROUP_PLAYERS: `${API_BASE_URL}/group-players`,
    GROUP_ACCEPTED_CARDS: `${API_BASE_URL}/group-accepted-cards`,
};

// config.ts
export const handleResponse = async (response: Response) => {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || response.statusText);
    }
    
    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : true;
  };

export const authTokenExpirationTime = 60 * 60 * 3000 // 1 hour in milliseconds