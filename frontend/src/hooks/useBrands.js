import { useState, useEffect, useCallback } from 'react';
import * as brandService from '../services/brandService';
import toast from 'react-hot-toast';

export const useBrands = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBrands = useCallback(async () => {
        setLoading(true);
        try {
            const data = await brandService.getBrands();
            setBrands(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            // toast.error('Failed to load brands');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    const addBrand = async (brandData) => {
        try {
            await brandService.createBrand(brandData);
            toast.success('Brand added successfully');
            fetchBrands();
            return true;
        } catch (err) {
            throw err;
        }
    };

    const editBrand = async (id, brandData) => {
        try {
            await brandService.updateBrand(id, brandData);
            toast.success('Brand updated successfully');
            fetchBrands();
            return true;
        } catch (err) {
            throw err;
        }
    };

    const removeBrand = async (id) => {
        if (!window.confirm('Are you sure you want to delete this brand?')) return;
        try {
            await brandService.deleteBrand(id);
            toast.success('Brand deleted successfully');
            fetchBrands();
        } catch (err) {
            throw err;
        }
    };

    return {
        brands,
        loading,
        error,
        addBrand,
        editBrand,
        removeBrand,
        fetchBrandsByCategory: brandService.getBrandsByCategory
    };
};
