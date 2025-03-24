const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const config = {
    apiBaseUrl: API_BASE_URL,
    authTokenExpirationTime: 60 * 60 * 1000 // 1 hour in milliseconds
};

export default config;