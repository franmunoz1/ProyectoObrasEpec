import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OBRAS_DATA } from './ListadoObras';

// ── Utilidades ───────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, '0');

const diffToEnd = (fechaFinDate) => {
  const now = new Date();
  const diff = fechaFinDate - now;
  if (diff <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0 };
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((diff % (1000 * 60)) / 1000);
  return { dias, horas, minutos, segundos };
};

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

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-[#0B5A50] text-white font-mono text-xl font-bold py-1 px-3 rounded-md min-w-[44px] text-center tracking-widest">
        {pad(value)}
      </div>
      <span className="text-[9px] text-gray-500 mt-1 uppercase tracking-wider font-mono">
        {label}
      </span>
    </div>
  );
}

function DonutChart({ pct, label, color, size = 100 }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(pct), 150);
    return () => clearTimeout(timer);
  }, [pct]);

  const animFilled = (animated / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#e8e6df" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${animFilled} ${circ - animFilled}`}
            strokeDashoffset={circ / 4}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold" style={{ color: pct === 0 ? '#aaa9a0' : color }}>
          {pct}%
        </div>
      </div>
      <span className="text-[10px] font-bold tracking-wider uppercase text-gray-500 font-mono text-center">
        {label}
      </span>
    </div>
  );
}

// ── Componente Principal ─────────────────────────────────────────────────────
const ObraDetalleTecnico = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [showHistory, setShowHistory] = useState(false);
  const [countdown, setCountdown] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });

  // Find obra unconditionally before hooks
  const obra = OBRAS_DATA.find((item) => item.id === Number(id));
  
  // Call all hooks unconditionally - before any conditional logic
  const fechaFinDate = useMemo(() => {
    if (!obra) return new Date();
    return new Date(obra.fechaFin || new Date());
  }, [obra]);

  useEffect(() => {
    const interval = setInterval(() => setCountdown(diffToEnd(fechaFinDate)), 1000);
    return () => clearInterval(interval);
  }, [fechaFinDate]);

  // Guard: redirect if not authenticated (after all hooks)
  if (!user) return <Navigate to="/login" replace />;

  // Guard: obra not found (after all hooks)
  if (!obra) {
    return (
      <div className="p-6 bg-[#eceae3] min-h-screen flex justify-center items-start pt-20">
        <div className="bg-white p-8 border border-[#d6d3c8] rounded-xl shadow-sm text-center">
          <h1 className="text-2xl font-serif text-gray-800 mb-2">Obra no encontrada</h1>
          <p className="text-gray-500 mb-6">No existe una obra con el ID {id}.</p>
          <Link to="/" className="px-4 py-2 bg-[#0F7367] text-white rounded-lg hover:bg-[#0B5A50] transition font-mono text-sm uppercase">Volver al listado</Link>
        </div>
      </div>
    );
  }

  // Cálculos de fechas (safe to use obra here)
  const today = new Date();
  const fechaInicioDate = new Date(obra.fechaInicio);
  const totalDays = Math.max(1, Math.round((fechaFinDate - fechaInicioDate) / (1000 * 60 * 60 * 24)));
  const diasTranscurridos = Math.max(0, Math.round((today - fechaInicioDate) / (1000 * 60 * 60 * 24)));
  const porcentajeTiempoRestante = Math.max(0, Math.min(100, ((diasTranscurridos) / totalDays) * 100));

  // Registros e IA
  const ultimoRegistro = obra.registros?.length ? obra.registros[obra.registros.length - 1] : null;
  const diasDesdeUltimoRegistro = ultimoRegistro ? Math.max(0, Math.round((today - new Date(ultimoRegistro.fecha)) / (1000 * 60 * 60 * 24))) : null;
  const indicadorActualizacion = ultimoRegistro ? (diasDesdeUltimoRegistro > 7 ? 'Desactualizado' : 'OK') : 'Sin registros';

  // String corregido con backticks
  const iaAnalisis = `Basado en la última inspección de ${ultimoRegistro ? ultimoRegistro.descripcion : 'sin datos'}, se detecta que el proyecto está en la fase ${obra.avanceFisico >= 50 ? 'avanzada' : 'inicial'} y puede presentar retraso en el item 5.2 si no se corrige la falta de armaduras en 10 días.`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500;600&family=Instrument+Sans:wght@400;500;600&display=swap');
        .font-serif { font-family: 'DM Serif Display', serif; }
        .font-mono { font-family: 'DM Mono', monospace; }
        .font-sans { font-family: 'Instrument Sans', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-[#eceae3] p-6 font-sans text-[#0f0f0d]">
        <div className="max-w-6xl mx-auto">
          
          {/* Encabezado SIGO/CIDI Style */}
          <div className="bg-[#0B5A50] text-white px-6 py-3 rounded-t-xl font-mono text-xs font-semibold tracking-widest uppercase flex justify-between items-center">
            <span>Panel de Control Técnico</span>
            <span className="text-white/60">ID Obra: {obra.id}</span>
          </div>

          <div className="bg-white border border-t-0 border-[#d6d3c8] rounded-b-xl p-6 md:p-8 shadow-sm">
            
            {/* Título y Metadatos */}
            <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 leading-tight">
              {obra.nombre}
            </h1>
            
            <div className="flex flex-wrap gap-x-6 gap-y-3 mb-8 text-sm text-gray-600 border-b border-gray-100 pb-6">
              <span className="flex items-center gap-1">📄 <strong>N° LP:</strong> {obra.nroLp}</span>
              <span className="flex items-center gap-1">🔧 <strong>Contratista:</strong> {obra.contratista}</span>
              <span className="flex items-center gap-1">👷 <strong>Inspector:</strong> {obra.inspectorAsignado}</span>
              <Badge variant={obra.estado === 'EJECUCION' ? 'dark' : 'default'}>{obra.estado}</Badge>
              <Badge variant="default">{obra.tipoObra}</Badge>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Columna Izquierda: Tiempos y Avances */}
              <div className="xl:col-span-2 space-y-6">
                
                {/* Bloque: Cronograma y Countdown */}
                <div className="bg-[#0F7367] rounded-xl p-5 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
                  <div className="grid grid-cols-3 gap-6 text-center md:text-left">
                    <div>
                      <div className="text-[10px] text-white/60 uppercase tracking-widest font-mono mb-1">Inicio</div>
                      <div className="font-mono font-semibold">{obra.fechaInicio}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/60 uppercase tracking-widest font-mono mb-1">Fin Estimado</div>
                      <div className="font-mono font-semibold">{obra.fechaFin}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/60 uppercase tracking-widest font-mono mb-1">Total Días</div>
                      <div className="font-mono font-semibold">{totalDays}</div>
                    </div>
                  </div>

                  <div className="pl-0 md:pl-6 md:border-l border-white/20">
                    <div className="text-[10px] text-white/60 uppercase tracking-widest font-mono mb-2 text-center">Tiempo Restante</div>
                    <div className="flex gap-2 items-start">
                      <CountdownUnit value={countdown.dias} label="días" />
                      <span className="text-white/40 text-xl pt-1">:</span>
                      <CountdownUnit value={countdown.horas} label="hs" />
                      <span className="text-white/40 text-xl pt-1">:</span>
                      <CountdownUnit value={countdown.minutos} label="min" />
                    </div>
                  </div>
                </div>

                {/* Bloque: Gráficos de Avance */}
                <div className="bg-[#F9F8F6] border border-[#d6d3c8] rounded-xl p-6">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Métricas de Avance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
                    <DonutChart pct={Math.round(porcentajeTiempoRestante)} label="Plazo Transcurrido" color="#0F7367" />
                    <DonutChart pct={obra.avanceFisico || 0} label="Avance Físico" color="#166534" />
                    <DonutChart pct={obra.avanceFinanciero || 0} label="Avance Financiero" color="#0B5A50" />
                  </div>
                </div>

                {/* Bloque: Análisis de Inteligencia Artificial (El valor real) */}
                <div className="bg-[#EAF5F4] border border-[#B2DFDB] rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#0F7367]"></div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🤖</span>
                    <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-[#0F7367]">Análisis IA de Inspección</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {iaAnalisis}
                  </p>
                </div>

              </div>

              {/* Columna Derecha: Registros y Fotos */}
              <div className="space-y-6">
                
                <div className="bg-white border border-[#d6d3c8] rounded-xl p-6 shadow-sm h-full">
                  <h3 className="font-serif text-xl mb-4 border-b border-gray-100 pb-2">Última Inspección</h3>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">Estado:</span>
                    <Badge variant={indicadorActualizacion === 'OK' ? 'default' : 'warning'}>
                      {indicadorActualizacion}
                    </Badge>
                  </div>

                  <div className="space-y-3 text-sm text-gray-700 mb-6">
                    <p className="flex justify-between">
                      <span className="text-gray-500">Fecha:</span> 
                      <span className="font-mono font-medium">{ultimoRegistro?.fecha || 'N/A'}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Días desde visita:</span> 
                      <span className="font-mono font-medium">{diasDesdeUltimoRegistro !== null ? `${diasDesdeUltimoRegistro} días` : 'N/A'}</span>
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
                      <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Observaciones</p>
                      <p className="italic">{ultimoRegistro?.descripcion || 'Sin descripción registrada.'}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Evidencia Fotográfica</h4>
                    <div className="flex flex-wrap gap-2">
                      {ultimoRegistro?.fotos?.length ? (
                        ultimoRegistro.fotos.map((foto, i) => (
                          <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:opacity-80 transition">
                            <img src={foto} alt={`Evidencia ${i}`} className="w-full h-full object-cover" />
                          </div>
                        ))
                      ) : (
                        <div className="w-full py-6 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center text-xs text-gray-400">
                          No hay fotos adjuntas
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowHistory((s) => !s)} 
                    className="w-full py-2 bg-gray-100 text-[#0F7367] hover:bg-gray-200 font-mono text-xs uppercase tracking-widest rounded-lg transition font-bold"
                  >
                    {showHistory ? 'Ocultar Historial' : 'Ver Historial Completo'}
                  </button>

                  {/* Historial Desplegable */}
                  {showHistory && (
                    <div className="mt-4 space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {obra.registros?.length ? obra.registros.slice().reverse().map((registro, index) => (
                        <div key={index} className="p-3 border-l-2 border-[#0F7367] bg-gray-50 text-sm">
                          <p className="font-mono text-xs text-gray-500 mb-1">{registro.fecha}</p>
                          <p className="text-gray-700">{registro.descripcion}</p>
                        </div>
                      )) : <p className="text-xs text-gray-500 text-center">No hay registros previos.</p>}
                    </div>
                  )}

                </div>
              </div>

            </div>

            {/* Botonera de acciones finales */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
              <Link to="/obras" className="px-5 py-2.5 bg-gray-100 text-gray-700 font-mono text-xs uppercase tracking-widest rounded-lg hover:bg-gray-200 transition font-bold">
                ← Volver
              </Link>
              <Link to={`/obra/${obra.id}/financiero`} className="px-5 py-2.5 bg-[#0F7367] text-white font-mono text-xs uppercase tracking-widest rounded-lg hover:bg-[#0B5A50] transition shadow-sm font-bold">
                Detalle Financiero
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ObraDetalleTecnico;