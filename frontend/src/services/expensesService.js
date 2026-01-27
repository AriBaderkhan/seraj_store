import api from './api';

const getAllExpenses = async (params) => {
    return await api.get('/api/expense', { params });
};

const createExpense = async (data) => {
    return await api.post('/api/expense', data);
};

const getAExpense = async (expenseId) => {
    return await api.get(`/api/expense/${expenseId}`);
};
const getAvailableMonths = async () => {
    return await api.get('/api/expense/available_months');
};

const getAvailableTypes = async () => {
    return await api.get('/api/expense/available_types');
};

const updateExpense = async (expenseId, data) => {
    return await api.put(`/api/expense/${expenseId}`, data);
};

const deleteExpense = async (expenseId) => {
    return await api.delete(`/api/expense/${expenseId}`);
};



const expensesService = {
    findAllExpenses: getAllExpenses,
    createExpenses: createExpense,
    getAExpense,
    getAvailableMonths,
    getAvailableTypes,
    updateExpense,
    deleteExpense
};

export default expensesService;
