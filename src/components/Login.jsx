import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = (e) => {
    e.preventDefault();
    const result = login(username.trim(), password.trim());
    if (!result.success) {
      setError(result.message);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold">Usuario</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded p-2 mt-1"
              type="text"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Contraseña</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded p-2 mt-1"
              type="password"
              required
            />
          </div>
          <button className="w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Entrar</button>
        </form>

        <div className="text-xs text-gray-500 mt-3">
          Usuarios de prueba: admin/admin, gerencia/gerencia, inspector/inspector.
        </div>
      </div>
    </div>
  );
};

export default Login;
