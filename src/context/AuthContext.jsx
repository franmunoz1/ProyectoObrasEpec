import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

const USERS = [
  { username: 'admin', password: 'admin', role: 'Administrador' },
  { username: 'gerencia', password: 'gerencia', role: 'Gerencia' },
  { username: 'inspector', password: 'inspector', role: 'Inspector' }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = (username, password) => {
    const found = USERS.find((u) => u.username === username && u.password === password);
    if (!found) {
      return { success: false, message: 'Credenciales incorrectas' };
    }
    setUser({ username: found.username, role: found.role });
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
