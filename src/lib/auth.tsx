import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from './api'

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  logout: () => {},
  changePassword: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi.verify()
      .then(() => setIsAuthenticated(true))
      .catch(() => localStorage.removeItem('admin_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const res = await authApi.login(username, password);
    localStorage.setItem('admin_token', res.token);
    setIsAuthenticated(true);
    navigate('/admin');
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    navigate('/admin/login');
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    await authApi.changePassword(oldPassword, newPassword);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
