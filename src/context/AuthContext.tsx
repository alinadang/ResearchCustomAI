import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import * as api from '../api';

interface AuthContextType {
  user: api.UserOut | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<api.UserOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: try to restore session from stored token
  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    api.fetchMe()
      .then(setUser)
      .catch(() => api.clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogin = useCallback(async (usernameOrEmail: string, password: string) => {
    await api.login(usernameOrEmail, password);
    const me = await api.fetchMe();
    setUser(me);
  }, []);

  const handleRegister = useCallback(async (username: string, email: string, password: string) => {
    await api.register(username, email, password);
    // Auto-login after registration
    await api.login(username, password);
    const me = await api.fetchMe();
    setUser(me);
  }, []);

  const handleLogout = useCallback(() => {
    api.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
