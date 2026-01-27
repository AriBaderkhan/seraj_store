import api from './api';

export const createCart = async (cartData) => {
    const response = await api.post('/api/cart', cartData);
    return response.data;
};

export const findtheCurrentCart = async () => {
    const response = await api.get('/api/cart');
    // Ensure we return the array data consistently
    return response.data.data || [];
};

export const deleteCart = async (cartId) => {
    const response = await api.delete(`/api/cart/${cartId}`);
    return response.data;
};
