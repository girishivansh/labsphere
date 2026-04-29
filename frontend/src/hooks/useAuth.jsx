import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('labsphere-dark');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('labsphere-dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const token = localStorage.getItem('labsphere-token');
    if (!token) { setLoading(false); return; }
    authAPI.getMe()
      .then(res => setUser(res.data.data))
      .catch(() => { localStorage.removeItem('labsphere-token'); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: u } = res.data.data;
    localStorage.setItem('labsphere-token', token);
    setUser(u);
    return u;
  };

  const signup = async (data) => {
    const res = await authAPI.signup(data);
    const { token, user: u } = res.data.data;
    localStorage.setItem('labsphere-token', token);
    setUser(u);
    return u;
  };

  const verifyOtp = async (email, otp) => {
    const res = await authAPI.verifyOtp({ email, otp, type: 'signup' });
    const { token, user: u } = res.data.data;
    localStorage.setItem('labsphere-token', token);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('labsphere-token');
    setUser(null);
  };

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const isSuperAdmin     = user?.role === 'SUPER_ADMIN';
  const isInstituteAdmin = user?.role === 'INSTITUTE_ADMIN';
  const isLabIncharge    = user?.role === 'LAB_INCHARGE';
  const isStudent        = user?.role === 'STUDENT';
  const canManageItems   = isInstituteAdmin || isLabIncharge;
  const canManageIssues  = isInstituteAdmin || isLabIncharge;

  return (
    <AuthContext.Provider value={{
      user, loading, login, signup, verifyOtp, logout,
      darkMode, toggleDarkMode,
      isSuperAdmin, isInstituteAdmin, isLabIncharge, isStudent,
      canManageItems, canManageIssues,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
