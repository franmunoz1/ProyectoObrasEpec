import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_OBRAS_URL || 'http://127.0.0.1:8000';

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

function MultiSelectFilter({ label, options, selectedValues, onChange, allLabel }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function onClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const selectedCount = selectedValues.length;
  const summary = selectedCount === 0
    ? allLabel
    : selectedCount === 1
      ? selectedValues[0]
      : `${selectedCount} seleccionados`;

  const toggleValue = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((item) => item !== value));
      return;
    }
    onChange([...selectedValues, value]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full border border-[#d6d3c8] rounded-lg px-3 py-2 bg-white text-left text-sm hover:bg-[#F9F8F6] transition flex items-center justify-between"
      >
        <span className="truncate">
          <span className="text-gray-500">{label}: </span>
          <span className="text-[#0f0f0d]">{summary}</span>
        </span>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full bg-white border border-[#d6d3c8] rounded-lg shadow-md p-2 max-h-64 overflow-auto">
          <button
            type="button"
            onClick={() => onChange([])}
            className="w-full text-left px-2 py-1.5 rounded text-xs font-mono uppercase tracking-widest text-[#0F7367] hover:bg-[#EAF5F4]"
          >
            Limpiar seleccion
          </button>

          <div className="my-2 border-t border-[#eceae3]" />

          {options.map((option) => {
            const checked = selectedValues.includes(option);
            return (
              <label
                key={option}
                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-[#F9F8F6] text-sm"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleValue(option)}
                  className="h-4 w-4 accent-[#0F7367]"
                />
                <span className="truncate">{option}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

const OBRAS_DATA = [];

function toPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  if (n >= 0 && n <= 1) return Number((n * 100).toFixed(2));
  return Number(n.toFixed(2));
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toDateString(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function mapApiObra(raw, index) {
  return {
    id: toNumber(raw?.IdO) || index + 1,
    nroLp: String(raw?.['Nro Expte. / Lic. Pública'] ?? ''),
    nombre: String(raw?.Denominación ?? ''),
    avanceFisico: toPercent(raw?.['Avance Físico']),
    avanceFinanciero: toPercent(raw?.['Avance Financiero']),
    desvioCurva: toPercent(raw?.['desvio contra curva ideal']),
    estado: String(raw?.Estado ?? 'Sin estado'),
    departamento: String(raw?.['Tipo de obra'] ?? 'Sin departamento'),
    tipoObra: String(raw?.['Tipo de obra'] ?? ''),
    prorroga: toNumber(raw?.Prorroga),
    inspectorAsignado: 'Sin asignar',
    presupuesto: toNumber(raw?.Costo),
    contratista: String(raw?.Contratista ?? ''),
    fechaInicio: toDateString(raw?.['Fecha inicio']),
    fechaFin: toDateString(raw?.['Fecha fin']),
    lat: null,
    lng: null,
    descripcion: String(raw?.Situación ?? ''),
    registros: [],
  };
}

const ListaObras = () => {
  const [obrasData, setObrasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroDepartamentos, setFiltroDepartamentos] = useState([]);
  const [filtroEstados, setFiltroEstados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadObras() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/obras`);
        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}`);
        }

        const payload = await response.json();
        const mapped = (Array.isArray(payload?.data) ? payload.data : []).map(mapApiObra);

        if (!cancelled) {
          OBRAS_DATA.splice(0, OBRAS_DATA.length, ...mapped);
          setObrasData(mapped);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'No se pudo cargar el listado.');
          OBRAS_DATA.splice(0, OBRAS_DATA.length);
          setObrasData([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadObras();

    return () => {
      cancelled = true;
    };
  }, []);

  const departamentos = useMemo(() => [...new Set(obrasData.map((obra) => obra.departamento))], [obrasData]);
  const estados = useMemo(() => [...new Set(obrasData.map((obra) => obra.estado))], [obrasData]);

  const obrasFiltradas = useMemo(() => {
    return obrasData.filter((obra) => {
      const coincidenDepartamento = filtroDepartamentos.length === 0 || filtroDepartamentos.includes(obra.departamento);
      const coincidenEstado = filtroEstados.length === 0 || filtroEstados.includes(obra.estado);
      const coincideBusqueda = obra.nombre.toLowerCase().includes(busqueda.toLowerCase()) || obra.nroLp.includes(busqueda);

      const fechaInicio = new Date(obra.fechaInicio);
      const fechaFin = new Date(obra.fechaFin);
      const tieneFechaInicio = !Number.isNaN(fechaInicio.getTime());
      const tieneFechaFin = !Number.isNaN(fechaFin.getTime());

      const desdeOK = !fechaDesde || (tieneFechaInicio && fechaInicio >= new Date(fechaDesde));
      const hastaOK = !fechaHasta || (tieneFechaFin && fechaFin <= new Date(fechaHasta));

      return coincidenDepartamento && coincidenEstado && coincideBusqueda && desdeOK && hastaOK;
    });
  }, [obrasData, filtroDepartamentos, filtroEstados, busqueda, fechaDesde, fechaHasta]);

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

            <div className="mb-6 flex flex-wrap gap-3">
              <button onClick={logout} className="px-4 py-2 bg-[#0F7367] text-white rounded-lg hover:bg-[#0B5A50] transition font-mono text-sm uppercase tracking-widest">
                Cerrar sesión
              </button>

              <Link to="/cargar-archivos" className="px-4 py-2 bg-[#F9F8F6] border border-[#d6d3c8] text-[#0f0f0d] rounded-lg hover:bg-[#EAF5F4] transition font-mono text-sm uppercase tracking-widest">
                Cargar archivos
              </Link>
            </div>

        {loading && <div className="mb-4 rounded-lg border border-[#d6d3c8] bg-[#F9F8F6] p-3 text-sm text-gray-600">Cargando obras desde API...</div>}
        {!loading && error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">No se pudo obtener datos desde API: {error}</div>}

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

          <MultiSelectFilter
            label="Tipo de obra"
            options={departamentos}
            selectedValues={filtroDepartamentos}
            onChange={setFiltroDepartamentos}
            allLabel="Todos"
          />

          <MultiSelectFilter
            label="Estado"
            options={estados}
            selectedValues={filtroEstados}
            onChange={setFiltroEstados}
            allLabel="Todos"
          />

          <button
            onClick={() => {
              setFiltroDepartamentos([]);
              setFiltroEstados([]);
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