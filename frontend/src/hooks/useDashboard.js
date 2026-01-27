import { useState, useEffect } from 'react';
import dashboardService from '../services/dashboardService';
import toast from 'react-hot-toast';

const useDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await dashboardService.getDashboardData();
            // response is { status: '...', data: { ... } }
            if (response.data) {
                setDashboardData(response.data);
            }
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError(err);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return { dashboardData, loading, error, refetch: fetchDashboardData };
};

export default useDashboard;
