import type { AxiosInstance } from 'axios';

const USER_LOCAL_STORAGE_KEY = 'TUTORA_user_data';

// Flag to prevent multiple redirects
let isRedirecting = false;

/**
 * Add 401 interceptor to any axios instance.
 * When backend returns 401 (token expired/invalid):
 * 1. Clear user data from localStorage
 * 2. Redirect to /login
 * 
 * Call this after axios.create() in each service file.
 */
export const setupAuthInterceptor = (axiosInstance: AxiosInstance): AxiosInstance => {
    axiosInstance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401 && !isRedirecting) {
                isRedirecting = true;
                console.warn('🔒 Token expired or invalid - redirecting to login');

                // Clear user data
                localStorage.removeItem(USER_LOCAL_STORAGE_KEY);

                // Redirect to login page
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
    return axiosInstance;
};
