import api from './api';

export const getItemsByCategory = async (categoryId, filters = {}) => {
    // Construct query string from filters
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.color) params.append('color', filters.color);
    if (filters.storage) params.append('storage', filters.storage);
    if (filters.sim_type) params.append('sim_type', filters.sim_type);
    if (filters.brand_id) params.append('brand_id', filters.brand_id);

    const response = await api.get(`/api/item/${categoryId}?${params.toString()}`);
    return response.data;
};

export const getItemDetails = async (id) => {
    const response = await api.get(`/api/item/details/${id}`);
    return response.data;
};

export const createItem = async (formData) => {
    // FormData is required for image upload
    const response = await api.post('/api/item', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const updateItem = async (id, formData) => {
    const response = await api.put(`/api/item/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const deleteItem = async (itemId) => {
    const response = await api.delete(`/api/item/${itemId}`);
    return response.data;
};

export const updateDevice = async (deviceId, data) => {
    const response = await api.put(`/api/item/update_device/${deviceId}`, data);
    return response.data;
};

export const updateOtherItem = async (otherItemId, data) => {
    const response = await api.put(`/api/item/update_other_item/${otherItemId}`, data);
    return response.data;
};

export const deleteDevice = async (deviceId) => {
    const response = await api.delete(`/api/item/delete_device/${deviceId}`);
    return response.data;
};

export const deleteOtherItem = async (otherItemId) => {
    const response = await api.delete(`/api/item/delete_other_item/${otherItemId}`);
    return response.data;
};

export const addPurchase = async (itemId, data) => {
    const response = await api.post(`/api/item/${itemId}/add_purchase`, data);
    return response.data;
};
