import React, { createContext, useContext, ReactNode, useState } from 'react';

type User = {
  email: string;
  userName: string;
  isAdmin: boolean;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, userName: string, isAdmin:boolean) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, userName: string, isAdmin: boolean) => {
    setIsAuthenticated(true);
    setUser({ email, userName, isAdmin });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};