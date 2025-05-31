let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

let userId = null;
export const setUserId = (id) => {
  userId = id;
};

export const getUserId = () => {
  return userId;
};

let jsonData = null;
export const setJsonData = (data) => {
  jsonData = data;
};

export const getJsonData = () => {
  return jsonData;
};
