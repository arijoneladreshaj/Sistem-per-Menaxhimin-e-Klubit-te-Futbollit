import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

// Çdo kërkesë shton access token automatikisht
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Nëse access token ka skaduar (401/403) → kërko token të ri me refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if ((error.response?.status === 401 || error.response?.status === 403) && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post("http://localhost:5000/refresh", { refreshToken });

        localStorage.setItem("accessToken", data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(original); // ripërsërit kërkesën origjinale
      } catch {
        // Refresh token ka skaduar — ç'kyç userin
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
