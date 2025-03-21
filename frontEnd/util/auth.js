import axios from 'axios';
import { Platform } from 'react-native';

const axiosInstance = axios.create({
  baseURL: 'http://192.168.100.132:3000/api/auth',
  timeout: 10000, // 10 seconds timeout
  timeoutErrorMessage: 'Request timed out. Please try again.',
  headers: {
    'Content-Type': 'application/json',
  },
});

async function authenticate(mode, data) {
  const url = `/${mode}`;

  try {
    const response = await axiosInstance.post(url, data);
    return response.data; // Return the entire response data
  } catch (error) {
    if (error.response) {
      console.error('Backend error:', error.response.data);
      throw new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      console.error('Network error:', error.request);
      throw new Error('Network error. Please check your connection.');
    } else {
      console.error('Error:', error.message);
      throw new Error(error.message || 'An unknown error occurred');
    }
  }
}

export function createUser(firstName, lastName, email, password, idCardNumber) {
  return authenticate('register', { firstName, lastName, email, password, idCardNumber });
}

export function login(email, password) {
  return authenticate('login', { email, password });
}

export function requestOTP(email) {
  return authenticate('request-otp', { email });
}

export function OTPChangePassword(email, otp, newPassword) {
  return authenticate('change-password-otp', { email, otp, newPassword });
}