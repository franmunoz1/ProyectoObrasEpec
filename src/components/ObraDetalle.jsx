import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { OBRAS_DATA } from './ListadoObras';

const ObraDetalle = () => {
  const { id } = useParams();
  const obraId = Number(id);
  const obra = OBRAS_DATA.find((item) => item.id === obraId);

  if (!obra) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto bg-white p-6 shadow rounded-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Obra no encontrada</h1>
          <p className="text-gray-600 mb-4">No existe una obra con el ID {id}.</p>
          <Link to="/" className="text-blue-600 hover:underline">Volver al listado</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-6 shadow rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Detalle de la obra</h1>
        <p className="text-gray-600 mb-6">Ficha de la obra N° LP {obra.nroLp}</p>

        <div className="grid grid-cols-1 gap-4">
          <p><strong>Nombre:</strong> {obra.nombre}</p>
          <p><strong>Departamento:</strong> {obra.departamento}</p>
          <p><strong>Estado:</strong> {obra.estado}</p>
          <p><strong>Avance físico:</strong> {obra.avanceFisico}%</p>
          <p><strong>Avance financiero:</strong> {obra.avanceFinanciero}%</p>
          <p><strong>Desvío con curva ideal:</strong> {obra.desvioCurva?.toFixed(1)}%</p>
          <p><strong>Período:</strong> {obra.fechaInicio} a {obra.fechaFin}</p>
          <p><strong>Presupuesto:</strong> {obra.presupuesto}</p>
          <p><strong>Contratista:</strong> {obra.contratista}</p>
          <p><strong>Descripción:</strong> {obra.descripcion}</p>
        </div>

        <div className="mt-6">
          <Link to="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Volver al listado</Link>
        </div>
      </div>
    </div>
  );
};

export default ObraDetalle;
