import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    // Backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log('vfgggt', import.meta.env.VITE_API_BASE_URL)

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to normalize errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Normalizing the error structure
        const errorData = {
            message: error.response?.data?.message || "An unexpected error occurred",
            code: error.response?.data?.code || "UNKNOWN_ERROR",
            support_code: error.response?.data?.support_code || null,   // Capture Support Code
            status: error.response?.status
        };
        return Promise.reject(errorData);
    }
);



export default api;
