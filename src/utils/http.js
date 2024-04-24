// http.js
import axios from 'axios';

const http = axios.create({
    baseURL: 'http://110.40.128.155:10001/api',
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
