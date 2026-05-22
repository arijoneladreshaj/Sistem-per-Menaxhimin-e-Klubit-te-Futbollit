// Çdo kërkesë dërgon access token në header
// Nëse token skadon (401) → rifreskон vetë pa e vënë re useri
// Nëse edhe refresh token ka skaduar → ridrejton te /login


import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001",
});

// Para çdo kërkese — shto access token automatikisht
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Pas çdo përgjigje — nëse 401, rifreskotoken-in dhe riprovo
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Vetëm 401 (token skadoi), jo 403, dhe jo nga endpoint-et publike
    const publicEndpoints = ["/login", "/register", "/refresh"];
    const isPublic = publicEndpoints.some((url) => original.url?.includes(url));
    if (error.response?.status === 401 && !original._retry && !isPublic) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        isRefreshing = false;
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // axios direkt (jo api) — kalon interceptorin, shmang deadlock
        const res = await axios.post("http://localhost:5001/refresh", { refreshToken });
        const newToken = res.data.accessToken;

        localStorage.setItem("accessToken", newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
