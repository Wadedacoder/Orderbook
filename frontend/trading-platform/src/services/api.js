import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

export const registerUser = async (formData) => {
  return axios.post(`${API_BASE}/api/register/`, { 
    'username': formData.username,
    'password': formData.password,
    'email': formData.email
  });
};

export const loginUser = async (username, password) => {
  return axios.post(`${API_BASE}/api/token/`, { username, password });
};

export const fetchListings = async (token) => {
  return axios.get(`${API_BASE}/listings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createListing = async (token, listingData) => {
  return axios.post(`${API_BASE}/listings/`, listingData, {
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

export const fetchTrades = async (token) => {
    return axios.get(`${API_BASE}/trades`, {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Access-Control-Request-Headers': token 
        }
    });
};

