export const setToken = (token, user = null) => {
  localStorage.setItem('access_token', token);
  
  if (user) {
    localStorage.setItem('auth_user', JSON.stringify(user));
  }
};

export const getToken = () => localStorage.getItem('access_token');

export const getUser = () => {
  const userStr = localStorage.getItem('auth_user');
  return userStr ? JSON.parse(userStr) : null;
};

export const removeToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('auth_user');
};

export const isAuthenticated = () => !!getToken();
