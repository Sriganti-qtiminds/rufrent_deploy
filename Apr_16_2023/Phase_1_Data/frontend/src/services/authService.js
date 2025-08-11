import axios from "axios";

const apiUrl = `${import.meta.env.VITE_API_URL}`;

export const checkMobile = async (mobileNumber) => {
  return axios.post(`${apiUrl}/checkMobile`, { mobile_no: mobileNumber });
};

export const signup = async ({ uid, email, token, displayName, mobile_no, role_id, referredBy }) => {
  return axios.post(`${apiUrl}/signup`, {
    uid,
    email,
    token,
    displayName,
    mobile_no,
    role_id,
    referredBy,
  });
};

export const login = async ({ token, uid }) => {
  return axios.post(`${apiUrl}/login`, { token, uid });
};

export const googleLogin = async ({ uid, email, displayName, mobile_no, role_id, token, referredBy }) => {
  return axios.post(`${apiUrl}/g_login`, {
    uid,
    email,
    displayName,
    mobile_no,
    role_id,
    token,
    referredBy,
  });
};

export const addMobileNumber = async ({ id, mobile_no }) => {
  return axios.put(`${apiUrl}/addMobileNumber`, { id, mobile_no });
};