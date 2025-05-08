const getApiUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return "https://sonzaify.onrender.com/api";
  }
  return "http://localhost:3001/api";
};

export const API_URL = getApiUrl();
export const SPOTIFY_API_ENDPOINT = "https://api.spotify.com/v1";
