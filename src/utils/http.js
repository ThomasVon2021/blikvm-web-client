// http.js
import axios from 'axios';
import Config from '@/config.js';

const http = axios.create({
    baseURL: `http://${Config.host_ip}:10001/api`,
    withCredentials: true
});


http.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (error.response && error.response.status === 401) {
            console.error('Authentication failed, redirecting to login page...');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default http;
