import { useState, useCallback } from 'react';
import * as itemService from '../services/itemService';
import toast from 'react-hot-toast';

export const useItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchItems = useCallback(async (categoryId, filters = {}) => {
        setLoading(true);
        try {
            const data = await itemService.getItemsByCategory(categoryId, filters);
            setItems(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const addItem = async (formData) => {
        setLoading(true);
        try {
            await itemService.createItem(formData);
            toast.success('Item added successfully');
            return true;
        } catch (err) {
            // Propagate error for component to handle inline
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const editItem = async (id, formData) => {
        setLoading(true);
        try {
            await itemService.updateItem(id, formData);
            toast.success('Item updated successfully');
            return true;
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (id) => {
        setLoading(true);
        try {
            await itemService.deleteItem(id);
            toast.success('Item deleted successfully');
            return true;
        } catch (err) {
            // Propagate error
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        items,
        loading,
        error,
        fetchItems,
        addItem,
        editItem,
        deleteItem
    };
};
