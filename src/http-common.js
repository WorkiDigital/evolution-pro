import axios from "axios";
import { useAppStore } from "@/store/app";

const http = axios.create({
  headers: {
    "Content-type": "application/json"
  }
});

http.interceptors.request.use(
  config => {
    const appStore = useAppStore();

    // Priority: Store > Env > Default
    const envUrl = import.meta.env.VITE_EVOLUTION_API_URL;
    const envKey = import.meta.env.VITE_EVOLUTION_API_KEY;

    let baseUrl = appStore.connection.host || envUrl;

    // Use proxy in development to avoid CORS
    if (import.meta.env.DEV) {
      baseUrl = '/api_proxy';
    }

    // Ensure baseUrl is clean
    if (baseUrl && baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }

    config.baseURL = baseUrl;

    // Default Global API Key
    let activeApiKey = appStore.connection.globalApiKey || envKey;

    // Handle dynamic URL parameters like /path/:instance
    if (config.params) {
      const paramsCopy = { ...config.params };

      // If instance is present in params, try to get specific API Key
      if (paramsCopy.instance) {
        const instanceApiKey = appStore.getInstanceApiKey(paramsCopy.instance);
        if (instanceApiKey) {
          activeApiKey = instanceApiKey;
        }
      }

      // Perform the replacement of :key with value from params
      config.url = config.url.replace(/:(\w+)/g, (match, key) => {
        if (paramsCopy[key] !== undefined) {
          const value = paramsCopy[key];
          delete config.params[key]; // Remove from query string
          return value;
        }
        return match;
      });
    }

    config.headers["apikey"] = activeApiKey;

    return config;
  },
  error => Promise.reject(error)
);

export default http;
