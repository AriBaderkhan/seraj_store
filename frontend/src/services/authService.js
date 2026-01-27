import api from './api';

export const login = async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password });
    return response.data;
};

// Add other auth methods here if needed (e.g. logout is usually client-side only by clearing token)
