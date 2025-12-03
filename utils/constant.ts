import axios from "axios";

export const backendInstance = axios.create({
  baseURL: "https://kportal-api.vercel.app",
  // baseURL: "http://localhost:3001",
});
