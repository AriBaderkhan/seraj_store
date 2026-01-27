import { useState, useEffect, useCallback } from 'react';
import * as categoryService from '../services/categoryService';
import toast from 'react-hot-toast';

export const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const data = await categoryService.getCategories();
            setCategories(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const addCategory = async (categoryData) => {
        try {
            await categoryService.createCategory(categoryData);
            toast.success('Category added successfully');
            fetchCategories(); // Refresh list
            return true;
        } catch (err) {
            // Propagate error for component to handle inline
            throw err;
        }
    };

    const editCategory = async (id, categoryData) => {
        try {
            await categoryService.updateCategory(id, categoryData);
            toast.success('Category updated successfully');
            fetchCategories();
            return true;
        } catch (err) {
            throw err;
        }
    };

    const removeCategory = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await categoryService.deleteCategory(id);
            toast.success('Category deleted successfully');
            fetchCategories();
        } catch (err) {
            // For delete, we might still want a toast if there's no UI for delete error
            toast.error(err.response?.data?.message || 'Failed to delete category');
        }
    };

    return {
        categories,
        loading,
        error,
        addCategory,
        editCategory,
        removeCategory
    };
};
