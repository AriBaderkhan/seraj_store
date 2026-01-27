import api from './api';

export const findItem = async (query) => {
    const response = await api.get(`/api/sale/find_item?query=${query}`);
    return response.data.data;
};


export const createSale = async (saleData) => {
    const response = await api.post('/api/sale/create_sale', saleData);
    return response.data; // Now returns { success: true, data: { ...saleObject } }
};

export const findAllSales = async (search = '') => {
    const response = await api.get(`/api/sale?search=${search}`);
    return response.data.data;
};

export const findSale = async (id) => {
    const response = await api.get(`/api/sale/${id}`);
    return response.data.data;
};

export const updateSale = async (saleId, saleData) => {
    const response = await api.put(`/api/sale/${saleId}`, saleData);
    return response.data;
};

export const deleteSale = async (saleId) => {
    const response = await api.delete(`/api/sale/${saleId}`);
    return response.data;
};

export const downloadPdf = async (saleId) => {
    const response = await api.get(`/api/sale/pdf/${saleId}`, {
        responseType: 'blob' // Important: Expect binary data
    });
    return response.data;
};
