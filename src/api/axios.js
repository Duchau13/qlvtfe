import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://stunning-wrongly-skink.ngrok-free.app', // Đảm bảo đây là URL API chính xác
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json', // Yêu cầu phản hồi JSON
    'ngrok-skip-browser-warning': 'true', // Bỏ qua trang cảnh báo ngrok
  },
});

// Interceptor để thêm Bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;