// constants/api.ts
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  console.warn("EXPO_PUBLIC_API_URL is not defined. Using fallback API URL.");
}

export const API_URL = apiUrl ?? "http://192.168.0.158:3000";
