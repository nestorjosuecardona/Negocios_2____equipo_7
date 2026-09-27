import axios from 'axios';

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ||
        'http://localhost:3000/api'
});


api.interceptors.request.use(
    config => {
        const token =
            localStorage.getItem('n2_token');

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    }
);


api.interceptors.response.use(
    response => response,

    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('n2_token');
            localStorage.removeItem('n2_user');

            window.dispatchEvent(
                new Event('n2:unauthorized')
            );
        }

        return Promise.reject(error);
    }
);


export default api;