// ─────────────────────────────────────────────────────────────────────────────
// DashboardInspector.jsx
// Pantalla de bienvenida del inspector — elige entre registrar o ver listado
//
// USO:
//   Copiar a src/components/DashboardInspector.jsx
//   En App.jsx o en tu router:
//     import DashboardInspector from './components/DashboardInspector'
//     <DashboardInspector
//       usuario={{ nombre: 'Matias Chavez', rol: 'Inspector' }}
//       onRegistrar={() => navigate('/registrar')}
//       onListado={() => navigate('/obras')}
//       onCerrarSesion={() => logout()}
//     />
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { Link } from 'react-router-dom'

// ── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  navy:     '#0f2d4a',
  navyHov:  '#1a4a6e',
  blue:     '#1e4d8c',
  blueBg:   '#f0f5fd',
  blueBd:   '#bfdbfe',
  green:    '#166534',
  greenMid: '#16a34a',
  greenBg:  '#f0faf4',
  greenBd:  '#bbf7d0',
  red:      '#c0392b',
  redBg:    '#fdf0ef',
  redBd:    '#fad0cc',
  paper:    '#f5f3ee',
  paper2:   '#eceae3',
  rule:     '#d6d3c8',
  ink:      '#0f0f0d',
  ink2:     '#3a3a35',
  ink3:     '#72726a',
  white:    '#ffffff',
}

const FONT_MONO  = "'DM Mono', monospace"
const FONT_SERIF = "'DM Serif Display', Georgia, serif"
const FONT_SANS  = "'Instrument Sans', sans-serif"

// ── Avatar con iniciales ──────────────────────────────────────────────────────
function Avatar({ nombre, size = 48 }) {
  const iniciales = nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('')

  // Color determinístico basado en el nombre
  const colors = [
    ['#0f2d4a', '#e0f0ff'],
    ['#166534', '#f0faf4'],
    ['#1e4d8c', '#dbeafe'],
    ['#7c3aed', '#ede9fe'],
    ['#b45309', '#fefbf0'],
    ['#0f766e', '#f0fdfa'],
  ]
  const idx = nombre.charCodeAt(0) % colors.length
  const [bg, fg] = colors[idx]

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT_MONO, fontWeight: 600,
      fontSize: size * 0.35,
      flexShrink: 0,
      border: `2px solid ${C.rule}`,
    }}>
      {iniciales}
    </div>
  )
}

// ── ActionCard ────────────────────────────────────────────────────────────────
function ActionCard({ icon, title, description, color, bgColor, bdColor, onClick }) {
  const [hov, setHov] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: '1 1 260px',
        background: hov ? bgColor : C.white,
        border: `1.5px solid ${hov ? color : bdColor}`,
        borderRadius: 14,
        padding: '28px 24px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all .18s ease',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? `0 8px 24px ${color}22` : '0 1px 4px rgba(0,0,0,.06)',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: bgColor, border: `1px solid ${bdColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
        transition: 'transform .18s',
        transform: hov ? 'scale(1.08)' : 'none',
      }}>
        {icon}
      </div>
      <div>
        <p style={{
          fontFamily: FONT_SERIF, fontSize: 20,
          color: hov ? color : C.ink,
          marginBottom: 6, lineHeight: 1.2,
          transition: 'color .18s',
        }}>
          {title}
        </p>
        <p style={{
          fontSize: 13, color: C.ink3,
          fontFamily: FONT_SANS, lineHeight: 1.5,
        }}>
          {description}
        </p>
      </div>
      <div style={{
        marginTop: 'auto',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 600,
        fontFamily: FONT_MONO, color,
        letterSpacing: '.04em',
      }}>
        Ir ahora
        <span style={{
          transition: 'transform .18s',
          transform: hov ? 'translateX(4px)' : 'none',
          display: 'inline-block',
        }}>→</span>
      </div>
    </button>
  )
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function StatChip({ label, value, color }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '10px 18px',
      background: C.paper,
      border: `1px solid ${C.rule}`,
      borderRadius: 10, gap: 2,
    }}>
      <span style={{
        fontFamily: FONT_SERIF, fontSize: 22,
        color: color || C.navy, lineHeight: 1,
      }}>
        {value}
      </span>
      <span style={{
        fontSize: 10, color: C.ink3,
        fontFamily: FONT_MONO, letterSpacing: '.06em',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
    </div>
  )
}

// ── DashboardInspector ────────────────────────────────────────────────────────
export default function DashboardInspector({
  usuario = { nombre: 'Matias Chavez Buschiazzo', rol: 'Inspector' },
  stats = { obrasAsignadas: 4, inspeccionesEstemes: 7, diasSinRegistro: 2 },
  onRegistrar   = () => alert('Ir a registrar inspección'),
  onListado     = () => alert('Ir al listado de obras'),
  onCerrarSesion = () => alert('Cerrar sesión'),
}) {
  const [hovLogout, setHovLogout] = useState(false)
  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500;600&family=Instrument+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #eceae3; font-family: 'Instrument Sans', sans-serif; color: #0f0f0d; }
      `}</style>

      <div style={{
        minHeight: '100vh', background: C.paper2,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 20px',
      }}>

        {/* ── Encabezado EPEC ── */}
        <div style={{
          width: '100%', maxWidth: 760,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: C.navy, color: C.white,
              fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600,
              letterSpacing: '.1em', padding: '5px 12px',
              borderRadius: 6,
            }}>
              EPEC SAU
            </div>
            <span style={{ fontSize: 12, color: C.ink3, fontFamily: FONT_MONO }}>
              Sistema de Obras Públicas
            </span>
          </div>

          {/* Fecha actual */}
          <span style={{ fontSize: 11, color: C.ink3, fontFamily: FONT_MONO }}>
            {new Date().toLocaleDateString('es-AR', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </span>
        </div>

        {/* ── Card principal ── */}
        <div style={{
          width: '100%', maxWidth: 760,
          background: C.white,
          border: `1px solid ${C.rule}`,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,.06)',
        }}>

          {/* Header azul marino */}
          <div style={{
            background: C.navy,
            padding: '20px 28px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Avatar nombre={usuario.nombre} size={44} />
              <div>
                <p style={{
                  fontFamily: FONT_SERIF, fontSize: 20,
                  color: C.white, lineHeight: 1.2,
                }}>
                  {saludo}, {usuario.nombre.split(' ')[0]}
                </p>
                <p style={{
                  fontSize: 11, color: 'rgba(255,255,255,.5)',
                  fontFamily: FONT_MONO, letterSpacing: '.06em',
                  textTransform: 'uppercase', marginTop: 2,
                }}>
                  Rol: {usuario.rol}
                </p>
              </div>
            </div>

            {/* Cerrar sesión */}
            <button
              onClick={onCerrarSesion}
              onMouseEnter={() => setHovLogout(true)}
              onMouseLeave={() => setHovLogout(false)}
              style={{
                background: hovLogout ? '#e53e3e' : C.red,
                color: C.white, border: 'none',
                borderRadius: 8, padding: '8px 16px',
                fontSize: 12, fontWeight: 600,
                fontFamily: FONT_MONO, cursor: 'pointer',
                letterSpacing: '.04em',
                transition: 'background .15s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              ⏻ Cerrar sesión
            </button>
          </div>

          {/* Stats rápidas */}
          <div style={{
            padding: '16px 28px',
            background: C.paper,
            borderBottom: `1px solid ${C.rule}`,
            display: 'flex', gap: 12, flexWrap: 'wrap',
          }}>
            <StatChip
              label="Obras asignadas"
              value={stats.obrasAsignadas}
              color={C.navy}
            />
            <StatChip
              label="Inspecciones este mes"
              value={stats.inspeccionesEstemes}
              color={C.green}
            />
            <StatChip
              label="Días sin registro"
              value={stats.diasSinRegistro}
              color={stats.diasSinRegistro > 7 ? C.red : C.amber || '#b45309'}
            />
          </div>

          {/* Acciones principales */}
          <div style={{ padding: '28px', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/registro-inspeccion" style={{ flex: '1 1 260px', textDecoration: 'none' }}>
              <ActionCard
                icon="📋"
                title="Registrar inspección"
                description="Cargá el avance físico, evidencia fotográfica, requerimientos y estado operativo de la obra."
                color={C.blue}
                bgColor={C.blueBg}
                bdColor={C.blueBd}
                onClick={() => {}}
              />
            </Link>
            <Link to="/obras" style={{ flex: '1 1 260px', textDecoration: 'none' }}>
              <ActionCard
                icon="🏗️"
                title="Ver listado de obras"
                description="Consultá el estado, avance financiero y detalle completo de todas las obras asignadas."
                color={C.green}
                bgColor={C.greenBg}
                bdColor={C.greenBd}
                onClick={() => {}}
              />
            </Link>
          </div>

        </div>

        {/* Footer */}
        <p style={{
          marginTop: 20, fontSize: 11,
          color: C.ink3, fontFamily: FONT_MONO,
          letterSpacing: '.04em',
        }}>
          EPEC SAU · Sector Obras · SG-R455
        </p>

      </div>
    </>
  )
}
