import { useState, useCallback } from 'react';
import expensesService from '../services/expensesService';
import toast from 'react-hot-toast';

export const useExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [availableMonths, setAvailableMonths] = useState([]);
    const [availableTypes, setAvailableTypes] = useState([]);

    const fetchMetadata = useCallback(async () => {
        try {
            const monthsRes = await expensesService.getAvailableMonths();
            const typesRes = await expensesService.getAvailableTypes();
            setAvailableMonths(monthsRes.data.data || []);
            setAvailableTypes(typesRes.data.data || []);
        } catch (error) {
            console.error("Error fetching metadata", error);
            // toast.error("Failed to load filter options");
        }
    }, []);

    const fetchExpenses = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            const res = await expensesService.findAllExpenses(filters);
            setExpenses(res.data.data || []);
        } catch (error) {
            console.error("Error fetching expenses", error);
            // toast.error("Failed to load expenses");
        } finally {
            setLoading(false);
        }
    }, []);

    const createExpense = async (data) => {
        try {
            await expensesService.createExpenses(data);
            return true;
        } catch (error) {
            console.error("Error creating expense", error);
            toast.error(error.response?.data?.message || "Failed to create expense");
            return false;
        }
    };

    const updateExpense = async (id, data) => {
        try {
            await expensesService.updateExpense(id, data);
            return true;
        } catch (error) {
            console.error("Error updating expense", error);
            toast.error(error.response?.data?.message || "Failed to update expense");
            return false;
        }
    };

    const deleteExpense = async (id) => {
        try {
            await expensesService.deleteExpense(id);
            return true;
        } catch (error) {
            console.error("Error deleting expense", error);
            toast.error(error.response?.data?.message || "Failed to delete expense");
            return false;
        }
    };

    const getExpense = async (id) => {
        try {
            const res = await expensesService.getAExpense(id);
            return res.data;
        } catch (error) {
            console.error("Error fetching single expense", error);
            // toast.error("Failed to fetch expense details");
            return null;
        }
    };

    return {
        expenses,
        loading,
        availableMonths,
        availableTypes,
        fetchMetadata,
        fetchExpenses,
        createExpense,
        updateExpense,
        deleteExpense,
        getExpense,
        setAvailableTypes // exposed for optimistic updates if needed
    };
};
