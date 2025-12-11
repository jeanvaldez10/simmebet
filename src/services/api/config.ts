import axios from "axios";
import http from "http";
import https from "https";

const api = axios.create({
  baseURL: process.env.WALLET_API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.API_KEY,
  },
  timeout: 12000, // 12 second timeout for external API calls
  // Add keep-alive and connection pooling for better performance
  httpAgent: new http.Agent({ keepAlive: true, maxSockets: 10 }),
  httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 10 }),
});

api.interceptors.request.use(
  async (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.error(error);
    }

    return Promise.reject(error);
  }
);

export default api;
