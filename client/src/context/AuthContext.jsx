import { createContext, useContext, useState, useEffect } from 'react';
import { get, post, put } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const userData = await get('/auth/me');
      if (userData?.user) setUser(userData.user);
      else setUser(null);
    } catch {
      setUser(null);
    }

    try {
      const adminData = await get('/admin/me');
      if (adminData?.email) setAdmin(adminData);
      else setAdmin(null);
    } catch {
      setAdmin(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const loginCustomer = async (email, password) => {
    const res = await post('/auth/login', { email, password });
    if (res?.admin) {
      setAdmin(res.admin);
      setUser(null);
      return { admin: res.admin };
    }
    if (res?.user) {
      setUser(res.user);
      return { user: res.user };
    }
    throw new Error('Login failed');
  };

  const registerCustomer = async (formData) => {
    const res = await post('/auth/register', formData);
    if (res?.user) {
      setUser(res.user);
      return res.user;
    }
    throw new Error('Registration failed');
  };

  const logoutCustomer = async () => {
    try {
      await post('/auth/logout', {});
    } catch {}
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await put('/auth/profile', data);
    if (res?.user) {
      setUser(res.user);
      return res.user;
    }
  };

  const logoutAdmin = async () => {
    try {
      await post('/admin/logout', {});
    } catch {}
    setAdmin(null);
  };

  const value = {
    user,
    admin,
    loading,
    checkAuth,
    loginCustomer,
    registerCustomer,
    logoutCustomer,
    updateProfile,
    logoutAdmin,
    setAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
