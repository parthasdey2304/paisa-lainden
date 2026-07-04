const AUTH_KEY = 'student_manager_auth_timestamp';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const login = () => {
  localStorage.setItem(AUTH_KEY, Date.now().toString());
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const isAuthenticated = () => {
  const timestamp = localStorage.getItem(AUTH_KEY);
  if (!timestamp) return false;

  const age = Date.now() - parseInt(timestamp, 10);
  if (age > SEVEN_DAYS_MS) {
    // Expired
    logout();
    return false;
  }
  
  return true;
};
