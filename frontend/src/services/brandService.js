import api from './api';

export const getBrands = async () => {
    const response = await api.get('/api/brand');
    return response.data.data;
};

export const createBrand = async (data) => {
    const response = await api.post('/api/brand', data);
    return response.data.data;
};

export const updateBrand = async (id, data) => {
    const response = await api.put(`/api/brand/${id}`, data);
    return response.data.data;
};

export const deleteBrand = async (id) => {
    const response = await api.delete(`/api/brand/${id}`);
    return response.data;
};

export const getBrandsByCategory = async (categoryId) => {
    const response = await api.get(`/api/brand/category/${categoryId}`);
    return response.data.data;
};
