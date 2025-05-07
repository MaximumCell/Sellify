import {create} from 'zustand';
import axios from '../libs/axios.js';
import {toast} from 'react-hot-toast';

export const useUserStore = create((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: false,

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
}));