import axios from "axios";
import { useAppStore } from "@/store/app";
const appStore = useAppStore();

appStore

const http = axios.create({
  headers: {
    "Content-type": "application/json"
  }
});

http.interceptors.request.use(
  config => {
    // Priority: Store > Env > Default
    const envUrl = import.meta.env.VITE_EVOLUTION_API_URL;
    const envKey = import.meta.env.VITE_EVOLUTION_API_KEY;

    let baseUrl = appStore.connection.host || envUrl;

    // Use proxy in development to avoid CORS
    if (import.meta.env.DEV && !appStore.connection.host) {
      baseUrl = '/api_proxy';
    }

    // Remove trailing slash if present to avoid double slashes
    if (baseUrl && baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }

    config.baseURL = baseUrl;
    config.headers["apikey"] = appStore.connection.globalApiKey || envKey;

    // find all uri variables and replace them with the value from the params object
    // e.g. /instance/connect/:instance -> /instance/connect/instance1
    const params = Object.entries(config.params || {});
    if (params.length > 0) {
      config.url = config.url.replace(/:(\w+)/g, (_, key) => {
        const value = params.find(([k]) => k === key)?.[1];
        if (value) {
          delete config.params[key];
          return value;
        }
        return _;
      });

      if (params.instance) {
        const apikey = appStore.getInstanceApiKey(params.instance);
        if (apikey) config.headers["apikey"] = apikey;
      }

    }


    return config;
  },
  error => Promise.reject(error)
);

export default http;
