import Cookies from 'js-cookie';

const TOKEN_KEY = 'authToken';
const listeners = [];

const notify = () => {
  const isAuthenticated = !!Cookies.get(TOKEN_KEY);
  listeners.forEach((listener) => {
    try {
      listener(isAuthenticated);
    } catch (e) {}
  });
};

export const subscribeAuth = (listener) => {
  listeners.push(listener);
  listener(!!Cookies.get(TOKEN_KEY));
  return () => {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
};

export const saveToken = (token) => {
  Cookies.set(TOKEN_KEY, token, { expires: 7 });
  notify();
};

export const getToken = () => {
  return Cookies.get(TOKEN_KEY);
};

export const removeToken = () => {
  Cookies.remove(TOKEN_KEY);
  notify();
};
