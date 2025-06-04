import { fetchListings } from './api';

export const checkAuth = async (token) => {
  try {
    await fetchListings(token); // Any authenticated endpoint
    return true;
  } catch (error) {
    throw new Error("Invalid/expired token");
  }
};