// http.js
import axios from 'axios';
import Config from '@/config.js';

const http = axios.create({
    baseURL: `http://${Config.host_ip}:10001/api`,
    withCredentials: true
});

http.interceptors.request.use(config => {
    const token = localStorage.getItem('token'); 
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    const username = localStorage.getItem('username');
    if (username) {
        config.headers.Username = username;
    }
    return config;
}, error => {
    if (error.response && error.response.status === 401) {
        console.error('Authentication failed, redirecting to login page...');
        window.location.href = '/';
    }
    return Promise.reject(error);
});

export default http;
