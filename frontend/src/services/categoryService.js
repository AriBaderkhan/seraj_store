import api from './api';

export const getCategories = async () => {
    const response = await api.get('/api/category');
    return response.data.data;
};

export const createCategory = async (formData) => {
    // Note: formData should be used directly for multipart/form-data
    const response = await api.post('/api/category', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
};

export const updateCategory = async (categoryId, formData) => {
    const response = await api.put(`/api/category/${categoryId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
};

export const deleteCategory = async (categoryId) => {
    const response = await api.delete(`/api/category/${categoryId}`);
    return response.data.data;
};
