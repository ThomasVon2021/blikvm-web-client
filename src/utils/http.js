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
    config.auth = {
        username: 'admin',
        password: 'admin'
    };
    return config;
}, error => {
    return Promise.reject(error);
});

export default http;
