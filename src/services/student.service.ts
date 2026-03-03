/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { getAuthHeaders, type ApiResponse } from './tutorProfile.service';
import type { StudentType } from '../types/student.type';
import { setupAuthInterceptor } from './apiClient';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
setupAuthInterceptor(api);

export interface ICreateParentStudent {
  fullname: string;
  birthdate: string;
  school: string;
  gradelevel?: string;
  learninggoals?: string;
}

export type IUpdateParentStudent = ICreateParentStudent;

export interface IGetBookingParams {
  page: number;
  pageSize: number;
  status?: string;
}

export const getStudents = async (): Promise<ApiResponse<StudentType[]>> => {
  try {
    const response = await api.get(`/parent/students`, {
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching verification progress:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const deleteStudent = async (id: string) => {
  try {
    const response = await api.delete(`/parent/students/${id}`, {
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching verification progress:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const createParentStudent = async (payload: ICreateParentStudent) => {
  try {
    const response = await api.post<ICreateParentStudent>(`/parent/students`, payload, { headers: getAuthHeaders() });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching verification progress:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const updateParentStudent = async (id: string, payload: IUpdateParentStudent) => {
  try {
    const response = await api.put<IUpdateParentStudent>(`/parent/students/${id}`, payload, {
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching verification progress:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const generateLinkCode = async (studentId: string): Promise<ApiResponse<StudentType>> => {
  try {
    const response = await api.post(`/parent/students/${studentId}/link-code`, {}, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
    console.error('❌ Error generating link code:', error.response?.data);
    throw error;
  }
};

export const linkWithCode = async (code: string): Promise<ApiResponse<StudentType>> => {
  try {
    const response = await api.post(`/parent/students/link-with-code`, { code }, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
    console.error('❌ Error linking with code:', error.response?.data);
    throw error;
  }
};

export const getParentBookings = async (params: IGetBookingParams = { page: 1, pageSize: 10 }) => {
  try {
    const response = await api.get(`/parent/bookings`, {
      headers: getAuthHeaders(),
      params,
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching verification progress:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};
