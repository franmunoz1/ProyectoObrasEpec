import React, { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Componentes Visuales ─────────────────────────────────────────────────────
function Badge({ children, variant = 'default' }) {
  const styles = {
    default: { bg: '#EAF5F4', color: '#0F7367', border: '#B2DFDB' }, // EPEC Colors
    dark:    { bg: '#0B5A50', color: '#ffffff', border: '#0B5A50' },
    warning: { bg: '#FEFBF0', color: '#B45309', border: '#FDE8A8' },
  };
  const s = styles[variant] || styles.default;
  return (
    <span style={{
      display: 'inline-block', padding: '4px 12px', borderRadius: 99,
      fontSize: 11, fontWeight: 600, fontFamily: "'DM Mono', monospace",
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      letterSpacing: '.04em', textTransform: 'uppercase',
    }}>
      {children}
    </span>
  );
}

const OBRAS_DATA = [
  {
    id: 1,
    nroLp: '5123',
    nombre: 'Ampliación ET Córdoba Norte - Transformador 3',
    avanceFisico: 75,
    avanceFinanciero: 60,
    desvioCurva: 5.4,
    estado: 'En Ejecución',
    departamento: 'Transmisión',
    tipoObra: 'Transmisión',
    prorroga: 8,
    inspectorAsignado: 'Matias Chavez',
    presupuesto: 'ARS 250.000.000',
    contratista: 'Empresas Unidas SA',
    fechaInicio: '2025-02-10',
    fechaFin: '2026-12-30',
    lat: -31.3466,
    lng: -64.2280,
    descripcion: 'Ampliación de subestación transformadora con instalación de nuevos equipos y obras civiles.',
    registros: [
      {
        fecha: '2026-02-28',
        descripcion: 'Instalación de apoyo estructural completa, sin observaciones mayores.',
        fotos: ['https://via.placeholder.com/150?text=Foto+1', 'https://via.placeholder.com/150?text=Foto+2']
      },
      {
        fecha: '2026-03-31',
        descripcion: 'Falta de armaduras detectada en el sector norte; posible impacto en item 5.2 por 10 días.',
        fotos: ['https://via.placeholder.com/150?text=Foto+3']
      }
    ]
  },
  {
    id: 2,
    nroLp: '5555',
    nombre: 'Nueva Red MT - Barrio Villa Belgrano',
    avanceFisico: 30,
    avanceFinanciero: 15,
    desvioCurva: 12.8,
    estado: 'Inicio de Obra',
    departamento: 'Distribución',
    tipoObra: 'Distribución',
    prorroga: 0,
    inspectorAsignado: 'Lucía Fernández',
    presupuesto: 'ARS 120.000.000',
    contratista: 'RedDistribuciones SA',
    fechaInicio: '2025-06-01',
    fechaFin: '2026-05-20',
    lat: -31.4267,
    lng: -64.1898,
    descripcion: 'Tendido de nueva red de media tensión para mejorar la calidad del suministro en zona residencial.',
    registros: [
      {
        fecha: '2026-03-20',
        descripcion: 'Avance de movimiento de suelo 30 %, sin bloqueos.',
        fotos: ['https://via.placeholder.com/150?text=Foto+A', 'https://via.placeholder.com/150?text=Foto+B']
      }
    ]
  },
  {
    id: 3,
    nroLp: '5678',
    nombre: 'Mantenimiento Civil Edificio Central',
    avanceFisico: 100,
    avanceFinanciero: 95,
    desvioCurva: 2.1,
    estado: 'Finalizada',
    departamento: 'Civil',
    tipoObra: 'Civil',
    prorroga: 0,
    inspectorAsignado: 'Facundo Ruiz',
    presupuesto: 'ARS 48.000.000',
    contratista: 'Construcciones y Servicios SRL',
    fechaInicio: '2024-08-15',
    fechaFin: '2025-11-30',
    lat: -31.4201,
    lng: -64.1888,
    descripcion: 'Reparación estructural y puesta a norma del edificio de oficinas principales.',
    registros: [
      {
        fecha: '2025-11-28',
        descripcion: 'Obra finalizada y aprobada, sin observaciones.',
        fotos: ['https://via.placeholder.com/150?text=Foto+C']
      }
    ]
  },
  {
    id: 4,
    nroLp: '5789',
    nombre: 'Recambio de Postación - Zona Rural',
    avanceFisico: 10,
    avanceFinanciero: 5,
    desvioCurva: 20.3,
    estado: 'Adjudicada',
    departamento: 'Distribución',
    tipoObra: 'Distribución',
    prorroga: 5,
    inspectorAsignado: 'Gabriela López',
    presupuesto: 'ARS 77.000.000',
    contratista: 'Campo y Energía SA',
    fechaInicio: '2025-09-10',
    lat: -31.3400,
    lng: -64.2200,
    fechaFin: '2026-10-20',
    descripcion: 'Sustitución de postes y conductores en áreas rurales con alto índice de fallas.',
    registros: [
      {
        fecha: '2026-01-12',
        descripcion: 'Inicio de obra con corte de vegetación y movimiento de suelo.',
        fotos: ['https://via.placeholder.com/150?text=Foto+D']
      }
    ]
  }
];

const ListaObras = () => {
  const [filtroDepartamento, setFiltroDepartamento] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const departamentos = useMemo(() => ['Todos', ...new Set(OBRAS_DATA.map((obra) => obra.departamento))], []);
  const estados = useMemo(() => ['Todos', ...new Set(OBRAS_DATA.map((obra) => obra.estado))], []);

  const obrasFiltradas = useMemo(() => {
    return OBRAS_DATA.filter((obra) => {
      const coincidenDepartamento = filtroDepartamento === 'Todos' || obra.departamento === filtroDepartamento;
      const coincidenEstado = filtroEstado === 'Todos' || obra.estado === filtroEstado;
      const coincideBusqueda = obra.nombre.toLowerCase().includes(busqueda.toLowerCase()) || obra.nroLp.includes(busqueda);

      const fechaInicio = new Date(obra.fechaInicio);
      const fechaFin = new Date(obra.fechaFin);
      const desdeOK = !fechaDesde || fechaInicio >= new Date(fechaDesde);
      const hastaOK = !fechaHasta || fechaFin <= new Date(fechaHasta);

      return coincidenDepartamento && coincidenEstado && coincideBusqueda && desdeOK && hastaOK;
    });
  }, [filtroDepartamento, filtroEstado, busqueda, fechaDesde, fechaHasta]);

  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500;600&family=Instrument+Sans:wght@400;500;600&display=swap');
        .font-serif { font-family: 'DM Serif Display', serif; }
        .font-mono { font-family: 'DM Mono', monospace; }
        .font-sans { font-family: 'Instrument Sans', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-[#eceae3] p-6 font-sans text-[#0f0f0d]">
        <div className="max-w-7xl mx-auto">
          
          {/* Encabezado SIGO/CIDI Style */}
          <div className="bg-[#0B5A50] text-white px-6 py-3 rounded-t-xl font-mono text-xs font-semibold tracking-widest uppercase flex justify-between items-center">
            <span>Panel de Control de Obras</span>
            <span className="text-white/60">Sistema EPEC</span>
          </div>

          <div className="bg-white border border-t-0 border-[#d6d3c8] rounded-b-xl p-6 md:p-8 shadow-sm">
            
            {/* Título y Metadatos */}
            <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 leading-tight">
              Licitaciones Públicas
            </h1>
            
            <div className="flex flex-wrap gap-x-6 gap-y-3 mb-8 text-sm text-gray-600 border-b border-gray-100 pb-6">
              <span className="flex items-center gap-1">📋 <strong>Listado de obras activas</strong></span>
              <span className="flex items-center gap-1">👤 <strong>Usuario:</strong> {user?.nombre || 'Desconocido'}</span>
              <Badge variant="default">{user?.rol || 'Sin rol'}</Badge>
            </div>

            <button onClick={logout} className="mb-6 px-4 py-2 bg-[#0F7367] text-white rounded-lg hover:bg-[#0B5A50] transition font-mono text-sm uppercase tracking-widest">
              Cerrar sesión
            </button>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-6">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            type="text"
            placeholder="Buscar por nombre o N° LP"
            className="border border-[#d6d3c8] rounded-lg p-2 bg-white"
          />

          <input
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            type="date"
            className="border border-[#d6d3c8] rounded-lg p-2 bg-white"
            aria-label="Fecha desde"
          />

          <input
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            type="date"
            className="border border-[#d6d3c8] rounded-lg p-2 bg-white"
            aria-label="Fecha hasta"
          />

          <select value={filtroDepartamento} onChange={(e) => setFiltroDepartamento(e.target.value)} className="border border-[#d6d3c8] rounded-lg p-2 bg-white">
            {departamentos.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>

          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="border border-[#d6d3c8] rounded-lg p-2 bg-white">
            {estados.map((est) => (
              <option key={est} value={est}>
                {est}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setFiltroDepartamento('Todos');
              setFiltroEstado('Todos');
              setBusqueda('');
              setFechaDesde('');
              setFechaHasta('');
            }}
            className="bg-[#F9F8F6] border border-[#d6d3c8] rounded-lg p-2 hover:bg-[#EAF5F4] transition font-mono text-xs uppercase tracking-widest"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-[#d6d3c8]">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-[#F9F8F6] text-left text-xs font-semibold text-gray-900 uppercase tracking-wider border-b border-[#d6d3c8]">
                <th className="px-5 py-3 border-b-2 border-[#d6d3c8]">N° LP</th>
                <th className="px-5 py-3 border-b-2 border-[#d6d3c8]">Nombre de la Obra</th>
                <th className="px-5 py-3 border-b-2 border-[#d6d3c8]">Departamento</th>
                <th className="px-5 py-3 border-b-2 border-[#d6d3c8]">Avance Físico</th>
                <th className="px-5 py-3 border-b-2 border-[#d6d3c8]">Avance Finan.</th>
                <th className="px-5 py-3 border-b-2 border-[#d6d3c8]">Desvío Curva</th>
                <th className="px-5 py-3 border-b-2 border-[#d6d3c8]">Situación actual</th>
                <th className="px-5 py-3 border-b-2 border-[#d6d3c8]">Estado</th>
                <th className="px-5 py-3 border-b-2 border-[#d6d3c8]">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {obrasFiltradas.map((obra) => (
                <tr key={obra.id} className="hover:bg-[#F9F8F6] transition-colors border-b border-[#d6d3c8]">
                  <td className="px-5 py-4 border-b border-[#d6d3c8] text-sm font-medium">{obra.nroLp}</td>
                  <td className="px-5 py-4 border-b border-[#d6d3c8] text-sm">{obra.nombre}</td>
                  <td className="px-5 py-4 border-b border-[#d6d3c8] text-sm">
                    <Badge variant="default">{obra.departamento}</Badge>
                  </td>
                  <td className="px-5 py-4 border-b border-[#d6d3c8] text-sm">
                    <div className="w-full bg-[#eceae3] rounded-full h-2.5">
                      <div className="bg-[#52aae2] h-2.5 rounded-full" style={{ width: `${obra.avanceFisico}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{obra.avanceFisico}%</span>
                  </td>
                  <td className="px-5 py-4 border-b border-[#d6d3c8] text-sm">
                    <div className="w-full bg-[#eceae3] rounded-full h-2.5">
                      <div className="bg-[#F28A28] h-2.5 rounded-full" style={{ width: `${obra.avanceFinanciero}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{obra.avanceFinanciero}%</span>
                  </td>
                  <td className="px-5 py-4 border-b border-[#d6d3c8] text-sm">{obra.desvioCurva?.toFixed(1)}%</td>
                  <td className="px-5 py-4 border-b border-[#d6d3c8] text-sm">
                    {obra.estado === 'Finalizada'
                      ? 'Finalizada'
                      : new Date(obra.fechaFin) >= new Date()
                        ? 'En plazo'
                        : 'Atrasada'}
                  </td>
                  <td className="px-5 py-4 border-b border-[#d6d3c8] text-sm">
                    <Badge variant={obra.estado === 'Finalizada' ? 'dark' : 'default'}>{obra.estado}</Badge>
                  </td>
                  <td className="px-5 py-4 border-b border-[#d6d3c8] text-sm flex flex-col gap-2">
                    <Link to={`/obra/${obra.id}/tecnico`} className="inline-block px-3 py-1 bg-[#52aae2] text-white rounded-lg hover:bg-[#0B5A50] transition font-mono text-xs uppercase tracking-widest">
                      Detalle técnico
                    </Link>
                    <Link to={`/obra/${obra.id}/financiero`} className="inline-block px-3 py-1 bg-[#F28A28] text-white rounded-lg hover:bg-[#0B5A50] transition font-mono text-xs uppercase tracking-widest">
                      Detalle financiero
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {obrasFiltradas.length === 0 && (
            <div className="p-4 text-center text-gray-600">No se encontraron obras con los filtros aplicados.</div>
          )}
        </div>

          </div>
        </div>
      </div>
    </>
  );
};

export { OBRAS_DATA };
export default ListaObras;