import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './components/Home';
import Login from './components/Login';
import ListadoObras from './components/ListadoObras';
import InspectorDashboard from './components/InspectorDashboard';
import RegistroInspeccion from './components/RegistroInspeccion';
import ObraDetalleTecnico from './components/ObraDetalleTecnico';
import ObraDetalleFinanciero from './components/ObraDetalleFinanciero';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <main>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Home />} />
              <Route path="/obras" element={<ListadoObras />} />
              <Route path="/inspector" element={<InspectorDashboard />} />
              <Route path="/registro-inspeccion" element={<RegistroInspeccion />} />
              <Route path="/obra/:id/tecnico" element={<ObraDetalleTecnico />} />
              <Route path="/obra/:id/financiero" element={<ObraDetalleFinanciero />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;