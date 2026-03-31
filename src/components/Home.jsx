import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'Inspector') {
    return <Navigate to="/inspector" replace />;
  }

  return <Navigate to="/obras" replace />;
};

export default Home;
