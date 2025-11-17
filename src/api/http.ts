import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";

export const http = axios.create({
  baseURL: API_BASE_URL,
});

http.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
