import api from './api';

const dashboardService = {
    getDashboardData: async () => {
        const response = await api.get('/api/dashboard');
        // The backend returns { status: '...', data: { ... } }
        // We return the full response body or just data property depending on convention.
        // Based on api.js interceptors, it returns the axios response config/error, but typically api.get returns the axios response object.
        // So response.data is the actual JSON body.
        return response.data;
    },
};

export default dashboardService;
