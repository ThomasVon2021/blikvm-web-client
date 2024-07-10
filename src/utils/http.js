// http.js
import axios from 'axios';
import Config from '@/config.js';

const http = axios.create({
    baseURL: `http://${Config.host_ip}:10001/api`,
    // headers: {
    //     'Content-Type': 'application/json'
    // }
});

// 设置基础认证（Basic Auth）
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
    return Promise.reject(error);
});

export default http;
