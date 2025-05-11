import {create} from 'zustand';
import axios from '../libs/axios.js';
import {toast} from 'react-hot-toast';

export const useUserStore = create((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: true,

    signup: async ({name,email,password,confirmPassword}) => {
        set({loading: true});
        if (password !== confirmPassword) {
            set({loading: false});
            toast.error('Passwords do not match!');
            return;
        }
        try {
            const response = await axios.post('/auth/signup', {name,email,password});
            set({user: response.data.user, loading: false});
            toast.success(response.data?.message || 'Signup successful!');
        } catch (error) {
            set({loading: false});
            toast.error(error.response?.data?.message || 'Signup failed!');
        } finally {
            set({loading: false});
        }
    },
    login: async (email, password) => {
        set({loading: true});
        try {
            const response = await axios.post('/auth/login', {email, password});
            set({user: response.data.user, loading: false});
            toast.success(response.data?.message || 'Login successful!');
        } catch (error) {
            set({loading: false});
            toast.error(error.response?.data?.message || 'Login failed!');
        } finally {
            set({loading: false});
        }
    },
    authCheck: async () => {
        set({checkingAuth: true});
        try {
            const response = await axios.get('/auth/profile');
            set({user: response.data.user, checkingAuth: false});
        } catch (error) {
            set({checkingAuth: false});
            console.error(error.response?.data?.message || 'Authentication check failed!');
        } finally {
            set({checkingAuth: false});
        }


    },
    logout: async () => {
        set({loading: true});
        try {
            const response = await axios.post('/auth/logout');
            set({user: null, loading: false});
            toast.success(response.data?.message || 'Logout successful!');
        } catch (error) {
            set({loading: false});
            toast.error(error.response?.data?.message || 'Logout failed!');
        } finally {
            set({loading: false});
        }
    },
    refreshToken: async () => {
        if (get().checkingAuth) return;
        set({checkingAuth: true});
        try {
            const response = await axios.post("/auth/refresh-token");
            set({ checkingAuth: false});
            return response.data;
        } catch (error) {
            set({ user: null, checkingAuth: false})
            throw error;
        }
    },
}));

let refreshPromise = null;

axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// If a refresh is already in progress, wait for it to complete
				if (refreshPromise) {
					await refreshPromise;
					return axios(originalRequest);
				}

				// Start a new refresh process
				refreshPromise = useUserStore.getState().refreshToken();
				await refreshPromise;
				refreshPromise = null;

				return axios(originalRequest);
			} catch (refreshError) {
				// If refresh fails, redirect to login or handle as needed
				useUserStore.getState().logout();
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	}
);
