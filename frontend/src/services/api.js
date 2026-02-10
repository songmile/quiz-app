// import axios from 'axios';

// // Create axios instance with default config
// const apiClient = axios.create({
//   baseURL: process.env.VUE_APP_API_URL || 'http://142.171.229.172:5000/api',
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   timeout: 10000
// });

// // Response interceptor for error handling
// apiClient.interceptors.response.use(
//   response => response,
//   error => {
//     const errorMessage = error.response?.data?.message || 'An unknown error occurred';
//     console.error('API Error:', errorMessage);
//     return Promise.reject(error);
//   }
// );

// export default apiClient;



import axios from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: '/api',  // 修改这一行，使用相对路径
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = error.response?.data?.message || 'An unknown error occurred';
    console.error('API Error:', errorMessage);
    return Promise.reject(error);
  }
);

export default apiClient;