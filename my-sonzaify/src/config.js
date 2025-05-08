const getApiUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return "https://sonzaify.onrender.com/api";
  }
  return "http://localhost:3001/api";
};

export const API_URL = getApiUrl();
