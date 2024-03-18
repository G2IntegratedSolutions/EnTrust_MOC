import React, { createContext, useContext, ReactNode, useState } from 'react';

type User = {
  email: string;
  userName: string;
  isAdmin: boolean;
  isApprover: boolean;
  isCreator: boolean;
  isStakeholder: boolean;
  isReviewer: boolean;
  organization: string;
  uid: string;
  firstName: string; 
  lastName: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, userName: string, isAdmin: boolean, isApprover: boolean,
     isCreator: boolean, isStakeholder: boolean, isReviewer: boolean,
     organization: string, uid: string, firstName: string, lastName: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, userName: string, isAdmin: boolean, 
    isApprover: boolean, isCreator: boolean, isStakeholder: boolean, 
    isReviewer: boolean, organization: string, uid: string, 
    firstName: string, lastName: string) => {
    //When setUser is called, only one of isAdmin, isApprover, isCreator, or isStakeholder will be true
    //Even if the user has multiple roles, they must choose just one role for this session. 
    let roleCount = 0;
    if (isAdmin){ roleCount++;}
    if (isApprover) { roleCount++;}
    if (isCreator){ roleCount++;}
    if (isStakeholder){ roleCount++;}
    if (isReviewer){ roleCount++;}
    //ebugger;
    if (roleCount === 1) {
      setIsAuthenticated(true);
      setUser({ email, userName,  isAdmin, isApprover, isCreator, isStakeholder, isReviewer, organization, uid,firstName, lastName });
    } else {
      setIsAuthenticated(false);
      setUser(null);
      alert("You must choose one role for this session.");
    }
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