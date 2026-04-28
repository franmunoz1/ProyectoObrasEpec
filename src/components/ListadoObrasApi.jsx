import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_OBRAS_URL || 'http://127.0.0.1:8000';

function normalizeValue(value) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export default function ListadoObrasApi() {
  const { user, logout } = useAuth();
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadObras() {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(`${API_BASE_URL}/obras`);
        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`);
        }

        const payload = await res.json();
        const rows = Array.isArray(payload?.data) ? payload.data : [];

        if (!cancelled) {
          setObras(rows);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar el listado de obras.');
          setObras([]);
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

  const columns = useMemo(() => {
    const allKeys = new Set();
    obras.forEach((obra) => {
      Object.keys(obra || {}).forEach((k) => allKeys.add(k));
    });
    return Array.from(allKeys);
  }, [obras]);

  const filteredObras = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return obras;

    return obras.filter((obra) =>
      columns.some((col) => normalizeValue(obra?.[col]).toLowerCase().includes(term)),
    );
  }, [obras, columns, search]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#eceae3] p-6 font-sans text-[#0f0f0d]">
      <div className="max-w-[95vw] mx-auto">
        <div className="bg-[#0B5A50] text-white px-6 py-3 rounded-t-xl font-mono text-xs font-semibold tracking-widest uppercase flex justify-between items-center">
          <span>Listado General de Obras (API)</span>
          <span className="text-white/60">{filteredObras.length} registros</span>
        </div>

        <div className="bg-white border border-t-0 border-[#d6d3c8] rounded-b-xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <button
              onClick={logout}
              className="px-4 py-2 bg-[#0F7367] text-white rounded-lg hover:bg-[#0B5A50] transition font-mono text-sm uppercase tracking-widest"
            >
              Cerrar sesion
            </button>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en cualquier columna"
              className="min-w-[280px] flex-1 border border-[#d6d3c8] rounded-lg p-2 bg-white"
            />

            <button
              onClick={() => setSearch('')}
              className="px-4 py-2 bg-[#F9F8F6] border border-[#d6d3c8] text-[#0f0f0d] rounded-lg hover:bg-[#EAF5F4] transition font-mono text-xs uppercase tracking-widest"
            >
              Limpiar
            </button>
          </div>

          {loading && <div className="text-sm text-gray-600">Cargando obras desde la API...</div>}

          {!loading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
              Error al consultar {API_BASE_URL}/obras: {error}
            </div>
          )}

          {!loading && !error && filteredObras.length === 0 && (
            <div className="rounded-lg border border-[#d6d3c8] bg-[#F9F8F6] text-[#444] p-3 text-sm">
              No hay datos para mostrar.
            </div>
          )}

          {!loading && !error && filteredObras.length > 0 && (
            <div className="overflow-auto border border-[#d6d3c8] rounded-lg">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#F9F8F6]">
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="px-3 py-2 border-b border-[#d6d3c8] text-left font-mono text-[11px] uppercase tracking-widest"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredObras.map((obra, idx) => (
                    <tr key={idx} className="odd:bg-white even:bg-[#fcfcfa] hover:bg-[#EAF5F4]">
                      {columns.map((col) => (
                        <td key={`${idx}-${col}`} className="px-3 py-2 border-b border-[#eceae3] align-top whitespace-nowrap">
                          {normalizeValue(obra?.[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
