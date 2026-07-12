import axios, { AxiosError } from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Shape of FastAPI's error body: { "detail": "..." }
interface ApiErrorBody {
  detail?: string;
}

axiosInstance.interceptors.response.use(
  // Success: hand back the parsed body directly so services return clean data
  (response) => response,
  // Failure: convert any axios error into a readable Error
  (error: AxiosError<ApiErrorBody>) => {
    let message = "Request failed";

    if (error.response) {
      // Server responded with a non-2xx status
      const detail = error.response.data?.detail;
      if (typeof detail === "string") {
        message = detail;
      } else if (Array.isArray(detail)) {
        // Pydantic validation errors come back as an array of objects
        message = "Invalid input. Please check the form and try again.";
      } else {
        message = `Request failed (${error.response.status})`;
      }
    } else if (error.request) {
      // Request sent but no response — network/CORS/server down
      message = "Cannot reach the server. Check your connection.";
    }

    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;