import { User } from './store';

const SESSION_KEY = 'salmoskie_session';

export const setSession = (user: User): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

export const getSession = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const isAuthenticated = (): boolean => {
  return getSession() !== null;
};

export const isAdmin = (): boolean => {
  const user = getSession();
  return user?.role === 'admin';
};
