import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const InspectorDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Inspector</h1>
            <p className="text-gray-600">Bienvenido/a {user?.username}. Rol: {user?.role}</p>
          </div>
          <button onClick={logout} className="px-3 py-1 bg-red-500 text-white rounded">Cerrar sesión</button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link to="/registro-inspeccion" className="bg-blue-600 text-white p-4 rounded hover:bg-blue-700 text-center">Registrar inspección</Link>
          <Link to="/obras" className="bg-green-600 text-white p-4 rounded hover:bg-green-700 text-center">Ver listado de obras y detalles</Link>
        </div>
      </div>
    </div>
  );
};

export default InspectorDashboard;
