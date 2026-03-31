import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OBRAS_DATA } from './ListadoObras';
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';

// ── Paleta y tokens ───────────────────────────────────────────────────────────
const C = {
  navy:     '#0f2d4a',
  navyLight:'#1a4a6e',
  blue:     '#1e4d8c',
  blueBg:   '#f0f5fd',
  blueBd:   '#bfdbfe',
  green:    '#166534',
  greenBg:  '#f0faf4',
  greenBd:  '#bbf7d0',
  red:      '#c0392b',
  redBg:    '#fdf0ef',
  redBd:    '#fad0cc',
  amber:    '#b45309',
  amberBg:  '#fefbf0',
  amberBd:  '#fde8a8',
  paper:    '#f5f3ee',
  paper2:   '#eceae3',
  rule:     '#d6d3c8',
  ink:      '#0f0f0d',
  ink2:     '#3a3a35',
  ink3:     '#72726a',
  white:    '#ffffff',
};

const FONT_MONO  = "'DM Mono', monospace";
const FONT_SERIF = "'DM Serif Display', Georgia, serif";
const FONT_SANS  = "'Instrument Sans', sans-serif";

// ── Formatters ────────────────────────────────────────────────────────────────
const fmtARS = (n) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n);

const fmtARSShort = (n) => {
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return fmtARS(n);
};

const fmtPct = (n) => `${n.toFixed(2)}%`;

// ── Tooltip personalizado para gráficos ──────────────────────────────────────
function CurvaTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: C.white, border: `1px solid ${C.rule}`,
      borderRadius: 8, padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,.1)',
      fontFamily: FONT_MONO, fontSize: 12,
    }}>
      <p style={{ fontWeight: 600, color: C.ink, marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        p.value != null && (
          <p key={p.name} style={{ color: p.color, margin: '2px 0' }}>
            {p.name}: {fmtARSShort(p.value)}
          </p>
        )
      ))}
    </div>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
function SectionHeader({ title, children }) {
  return (
    <div style={{
      background: C.navy, color: C.white,
      padding: '10px 20px',
      borderRadius: '10px 10px 0 0',
      fontSize: 12, fontWeight: 600,
      letterSpacing: '.08em', textTransform: 'uppercase',
      fontFamily: FONT_MONO,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span>{title}</span>
      {children}
    </div>
  );
}

// ── Block ─────────────────────────────────────────────────────────────────────
function Block({ title, children, action }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        background: C.navyLight, color: C.white,
        padding: '7px 16px',
        borderRadius: '8px 8px 0 0',
        fontSize: 11, fontWeight: 600,
        letterSpacing: '.07em', textTransform: 'uppercase',
        fontFamily: FONT_MONO,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span>{title}</span>
        {action}
      </div>
      <div style={{
        background: C.white,
        border: `1px solid ${C.rule}`,
        borderTop: 'none',
        borderRadius: '0 0 8px 8px',
        padding: '20px',
      }}>
        {children}
      </div>
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color, bg, bd }) {
  return (
    <div style={{
      background: bg || C.paper,
      border: `1px solid ${bd || C.rule}`,
      borderRadius: 10, padding: '14px 18px',
      flex: '1 1 160px', minWidth: 0,
    }}>
      <p style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '.08em',
        textTransform: 'uppercase', color: color || C.ink3,
        fontFamily: FONT_MONO, marginBottom: 6,
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: FONT_SERIF,
        fontSize: 'clamp(16px, 1.8vw, 22px)',
        color: color || C.ink, lineHeight: 1.2, marginBottom: 2,
      }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 11, color: C.ink3, fontFamily: FONT_MONO }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Tabla de datos financieros ────────────────────────────────────────────────
function TablaFinanciera({ datos }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: FONT_MONO }}>
      <thead>
        <tr>
          {datos.headers.map((h) => (
            <th key={h} style={{
              background: C.navy, color: C.white,
              padding: '8px 12px', textAlign: 'right',
              fontSize: 11, letterSpacing: '.04em', fontWeight: 600,
            }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {datos.rows.map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? C.white : C.paper }}>
            {Object.values(row).map((val, j) => (
              <td key={j} style={{
                padding: '8px 12px', textAlign: 'right', color: C.ink2,
                borderBottom: `1px solid ${C.rule}`,
              }}>
                {val}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Componente Principal ─────────────────────────────────────────────────────
const ObraDetalleFinanciero = () => {
  const { user } = useAuth();
  const { id } = useParams();

  // Guard: redirect if not authenticated
  if (!user) return <Navigate to="/login" replace />;

  // Find obra
  const obra = OBRAS_DATA.find((item) => item.id === Number(id));

  // Guard: obra not found
  if (!obra) {
    return (
      <div style={{ minHeight: '100vh', background: C.paper2, padding: '24px 20px' }}>
        <div style={{
          maxWidth: 600, margin: '0 auto',
          background: C.white, border: `1px solid ${C.rule}`,
          borderRadius: 12, padding: '24px', textAlign: 'center',
        }}>
          <h1 style={{ fontFamily: FONT_SERIF, fontSize: 28, color: C.ink, marginBottom: 12 }}>
            Obra no encontrada
          </h1>
          <p style={{ fontFamily: FONT_SANS, color: C.ink3, marginBottom: 20 }}>
            No existe una obra con el ID {id}.
          </p>
          <Link to="/" style={{
            display: 'inline-block', padding: '10px 20px',
            background: C.navy, color: C.white, borderRadius: 8,
            fontFamily: FONT_MONO, fontSize: 12, textDecoration: 'none',
            transition: 'background .2s', cursor: 'pointer',
          }}>
            ← Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  // Calcular datos financieros
  const presupuesto = obra.presupuesto || 4802003478.26;
  const certificado = Math.round(presupuesto * (obra.avanceFinanciero || 10) / 100);
  const aCertificar = presupuesto - certificado;
  const pctCertificado = (certificado / presupuesto) * 100;

  // Curva de avance simulada
  const curvaAvance = [
    { fecha: '06/mar./26', ideal: 0, real: presupuesto * 0.01 },
    { fecha: '31/mar./26', ideal: presupuesto * 0.08, real: presupuesto * 0.015 },
    { fecha: '30/abr./26', ideal: presupuesto * 0.15, real: null },
    { fecha: '31/may./26', ideal: presupuesto * 0.25, real: null },
    { fecha: '30/jun./26', ideal: presupuesto * 0.40, real: null },
    { fecha: '31/jul./26', ideal: presupuesto * 0.55, real: null },
    { fecha: '31/ago./26', ideal: presupuesto * 0.70, real: null },
    { fecha: '30/sep./26', ideal: presupuesto * 0.82, real: null },
    { fecha: '31/oct./26', ideal: presupuesto * 0.90, real: null },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500;600&family=Instrument+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #eceae3; font-family: 'Instrument Sans', sans-serif; color: #0f0f0d; }
        a { color: inherit; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      <div style={{ minHeight: '100vh', background: C.paper2, padding: '24px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0px auto' }}>

          {/* Encabezado */}
          <SectionHeader title="Detalle Financiero" />

          <div style={{
            background: C.white,
            border: `1px solid ${C.rule}`,
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
            padding: '24px',
          }}>

            {/* Metadata obra */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 12,
              marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${C.rule}`,
            }}>
              <div>
                <p style={{ fontSize: 11, fontFamily: FONT_MONO, color: C.ink3, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>
                  Obra
                </p>
                <p style={{ fontSize: 14, fontFamily: FONT_SERIF, color: C.ink, fontWeight: 600 }}>
                  {obra.nombre}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontFamily: FONT_MONO, color: C.ink3, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>
                  N° LP
                </p>
                <p style={{ fontSize: 14, fontFamily: FONT_SERIF, color: C.ink, fontWeight: 600 }}>
                  {obra.nroLp}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontFamily: FONT_MONO, color: C.ink3, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>
                  Contratista
                </p>
                <p style={{ fontSize: 14, fontFamily: FONT_SERIF, color: C.ink }}>
                  {obra.contratista}
                </p>
              </div>
            </div>

            {/* BLOQUE 1 — KPIs financieros */}
            <Block title="Resumen financiero">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <KpiCard
                  label="Presupuesto total"
                  value={fmtARS(presupuesto)}
                  sub="Monto contractual"
                  color={C.ink}
                />
                <KpiCard
                  label="Certificado acumulado"
                  value={fmtARS(certificado)}
                  sub={`${fmtPct(pctCertificado)} del total`}
                  color={C.green}
                  bg={C.greenBg}
                  bd={C.greenBd}
                />
                <KpiCard
                  label="Pendiente a certificar"
                  value={fmtARS(aCertificar)}
                  sub="Saldo restante"
                  color={C.red}
                  bg={C.redBg}
                  bd={C.redBd}
                />
                <KpiCard
                  label="Avance físico"
                  value={`${obra.avanceFisico}%`}
                  sub="Para comparación"
                  color={C.amber}
                  bg={C.amberBg}
                  bd={C.amberBd}
                />
              </div>

              {/* Barra de progreso */}
              <div style={{ marginTop: 18 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 10, fontFamily: FONT_MONO, color: C.ink3,
                  marginBottom: 6, letterSpacing: '.04em',
                }}>
                  <span>AVANCE FINANCIERO</span>
                  <span>{fmtPct(pctCertificado)}</span>
                </div>
                <div style={{
                  height: 10, background: C.paper,
                  border: `1px solid ${C.rule}`, borderRadius: 99, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${pctCertificado}%`,
                    background: `linear-gradient(90deg, ${C.green} 0%, #22c55e 100%)`,
                    borderRadius: 99,
                    transition: 'width 1s cubic-bezier(.4,0,.2,1)',
                  }} />
                </div>
              </div>
            </Block>

            {/* BLOQUE 2 — Curva de avance */}
            <Block title="Curva de avance financiero" action={
              <span style={{
                fontSize: 10, color: 'rgba(255,255,255,.5)',
                fontFamily: FONT_MONO, letterSpacing: '.04em',
              }}>
                Ideal vs. Real
              </span>
            }>
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 12, color: C.ink3, fontFamily: FONT_MONO }}>
                  La curva <strong style={{ color: '#5aaee0' }}>Principal</strong> representa el
                  avance financiero planificado. La curva{' '}
                  <strong style={{ color: C.navy }}>Real</strong> muestra el avance certificado.
                </p>
              </div>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={curvaAvance} margin={{ top: 10, right: 20, left: 60, bottom: 50 }}>
                    <defs>
                      <linearGradient id="gradPrincipal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#90c8f0" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#90c8f0" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="gradReal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={C.navy} stopOpacity={0.5} />
                        <stop offset="95%" stopColor={C.navy} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke={C.rule} vertical={false} />

                    <XAxis
                      dataKey="fecha"
                      tick={{ fontSize: 9.5, fontFamily: FONT_MONO, fill: C.ink3 }}
                      angle={-40}
                      textAnchor="end"
                      height={60}
                      tickLine={false}
                      axisLine={{ stroke: C.rule }}
                      interval={0}
                    />

                    <YAxis
                      tickFormatter={fmtARSShort}
                      tick={{ fontSize: 9.5, fontFamily: FONT_MONO, fill: C.ink3 }}
                      tickLine={false}
                      axisLine={false}
                      label={{
                        value: 'Monto en $',
                        angle: -90,
                        position: 'insideLeft',
                        offset: -45,
                        style: { fontSize: 10, fill: C.ink3, fontFamily: FONT_MONO },
                      }}
                    />

                    <Tooltip content={<CurvaTooltip />} />

                    <Legend
                      wrapperStyle={{ fontSize: 12, fontFamily: FONT_MONO, paddingTop: 12 }}
                      formatter={(value) => (
                        <span style={{ color: C.ink2 }}>{value}</span>
                      )}
                    />

                    <Area
                      type="monotone"
                      dataKey="ideal"
                      name="Ideal (Planificado)"
                      stroke="#5aaee0"
                      strokeWidth={2}
                      fill="url(#gradPrincipal)"
                      dot={{ r: 3, fill: '#5aaee0', strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                      connectNulls
                    />

                    <Area
                      type="monotone"
                      dataKey="real"
                      name="Real (Certificado)"
                      stroke={C.navy}
                      strokeWidth={2.5}
                      fill="url(#gradReal)"
                      dot={{ r: 4, fill: C.navy, strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                      connectNulls={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Block>

            {/* BLOQUE 3 — Datos complementarios */}
            <Block title="Información complementaria">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 10, fontFamily: FONT_MONO, color: C.ink3, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>
                    Fechas
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: FONT_MONO, fontSize: 12 }}>
                    <div>
                      <p style={{ color: C.ink3, fontSize: 10 }}>INICIO</p>
                      <p style={{ color: C.ink, fontWeight: 600 }}>{obra.fechaInicio}</p>
                    </div>
                    <div>
                      <p style={{ color: C.ink3, fontSize: 10 }}>FIN ESTIMADO</p>
                      <p style={{ color: C.ink, fontWeight: 600 }}>{obra.fechaFin}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 10, fontFamily: FONT_MONO, color: C.ink3, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>
                    Estados
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: FONT_MONO, fontSize: 12 }}>
                    <div>
                      <p style={{ color: C.ink3, fontSize: 10 }}>ESTADO OBRA</p>
                      <p style={{ color: C.ink, fontWeight: 600 }}>{obra.estado}</p>
                    </div>
                    <div>
                      <p style={{ color: C.ink3, fontSize: 10 }}>DESVÍO VS IDEAL</p>
                      <p style={{
                        color: obra.desvioCurva > 0 ? C.red : C.green,
                        fontWeight: 600,
                      }}>
                        {obra.desvioCurva?.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Block>

            {/* Navegación */}
            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <Link to="/" style={{
                display: 'inline-block', padding: '10px 20px',
                background: C.paper, color: C.ink, border: `1px solid ${C.rule}`,
                borderRadius: 8, fontFamily: FONT_MONO, fontSize: 11,
                textDecoration: 'none', transition: 'all .2s',
                cursor: 'pointer', letterSpacing: '.04em', textTransform: 'uppercase',
              }}>
                ← Volver
              </Link>
              <Link to={`/obra/${obra.id}/tecnico`} style={{
                display: 'inline-block', padding: '10px 20px',
                background: C.navy, color: C.white,
                borderRadius: 8, fontFamily: FONT_MONO, fontSize: 11,
                textDecoration: 'none', transition: 'all .2s',
                cursor: 'pointer', letterSpacing: '.04em', textTransform: 'uppercase',
              }}>
                Ver detalle técnico →
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ObraDetalleFinanciero;
