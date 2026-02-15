// frontend/src/services/api.ts
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if exists
        const token = localStorage.getItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if (import.meta.env.DEV) {
          console.log("API Request:", {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data,
          });
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log response in development
        if (import.meta.env.DEV) {
          console.log("API Response:", {
            status: response.status,
            url: response.config.url,
            data: response.data,
          });
        }

        return response;
      },
      (error: AxiosError) => {
        const apiError = this.handleError(error);

        // Show error notification (could integrate with a toast library)
        if (import.meta.env.DEV) {
          console.error("API Error:", apiError);
        }

        return Promise.reject(apiError);
      },
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error
      return {
        message: (error.response.data as any)?.message || "Error del servidor",
        code: (error.response.data as any)?.code,
        status: error.response.status,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: "No se pudo conectar con el servidor",
        code: "NETWORK_ERROR",
      };
    } else {
      // Error in request setup
      return {
        message: error.message || "Error desconocido",
        code: "UNKNOWN_ERROR",
      };
    }
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.put<T>(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config);
  }
}

// Export singleton instance
export const api = new ApiService();

// Export specific API endpoints
export const postsApi = {
  getAll: (params?: any) => api.get("/posts", { params }),
  getById: (id: string) => api.get(`/posts/${id}`),
  create: (data: any) => api.post("/posts", data),
  update: (id: string, data: any) => api.put(`/posts/${id}`, data),
  delete: (id: string) => api.delete(`/posts/${id}`),
  getByPlatform: (platform: string) => api.get(`/posts/platform/${platform}`),
};

export const anomaliesApi = {
  getAll: (params?: any) => api.get("/anomalies", { params }),
  getById: (id: string) => api.get(`/anomalies/${id}`),
  validate: (id: string, isFake: boolean) =>
    api.put(`/anomalies/${id}/validate`, { isFake }),
  getBySeverity: (severity: string) =>
    api.get(`/anomalies/severity/${severity}`),
};

export const healthApi = {
  check: () => api.get("/health"),
  status: () => api.get("/health/status"),
};

// Export types
export type { ApiError };
