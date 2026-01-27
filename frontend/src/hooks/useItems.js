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
            toast.error('Failed to load items');
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
            toast.error(err.response?.data?.message || 'Failed to add item');
            return false;
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
            toast.error(err.response?.data?.message || 'Failed to update item');
            return false;
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
            toast.error(err.response?.data?.message || 'Failed to delete item');
            return false;
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
