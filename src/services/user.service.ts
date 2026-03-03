/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { getCurrentUser } from './auth.service';
import { setupAuthInterceptor } from './apiClient';

const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5166') + '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
setupAuthInterceptor(api);

/**
 * Fetch user profile data including eKYC information
 * @param userId - User ID to fetch profile for
 * @returns User profile with eKYC data
 */
export const getUserProfile = async (userId: string) => {
    try {
        const user = getCurrentUser();
        const response = await api.get(`/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${user?.accessToken}`
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

export interface IUpdateUserProfile {
    fullname: string;
    birthdate: string;
    address: string;
    gender: string;
    avatarurl?: string;
}

export const updateUserProfile = async (userId: string, payload: IUpdateUserProfile) => {
    try {
        const user = getCurrentUser();
        const response = await api.put(`/users/${userId}`, payload, {
            headers: {
                Authorization: `Bearer ${user?.accessToken}`
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

/**
 * Parse ekycRawData JSON string into EKYCContent object
 * @param ekycRawData - JSON string from backend
 * @returns Parsed EKYCContent or null if invalid
 */
export const parseEKYCData = (ekycRawData: string | null): any => {
    if (!ekycRawData) return null;

    try {
        return JSON.parse(ekycRawData);
    } catch (error) {
        console.error('Error parsing eKYC data:', error);
        return null;
    }
};
