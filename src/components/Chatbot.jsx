// ─────────────────────────────────────────────────────────────────────────────
// Chatbot.jsx — Hub de asistentes IA de EPEC SAU
// Tres bots especializados:
//   1. Asistente General  — consultas generales de obra
//   2. Bot Auditor        — pliegos, contratos y documentación legal
//   3. Bot Analista       — gestión, tableros y datos de seguimiento
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// ── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  navy:      '#0B5A50',
  navyDark:  '#083d30',
  navyLight: '#0F7367',
  teal:      '#1db899',
  tealLight: '#a8eddf',
  tealBg:    '#EAF5F4',
  tealBd:    '#B2DFDB',
  paper:     '#f5f3ee',
  paper2:    '#eceae3',
  rule:      '#d6d3c8',
  ink:       '#0f0f0d',
  ink2:      '#3a3a35',
  ink3:      '#72726a',
  white:     '#ffffff',
  blue:      '#1e4d8c',
  blueBg:    '#f0f5fd',
  blueBd:    '#bfdbfe',
  purple:    '#5b21b6',
  purpleBg:  '#f5f3ff',
  purpleBd:  '#ddd6fe',
  amber:     '#b45309',
  amberBg:   '#fefbf0',
}
const FM = "'DM Mono', monospace"
const FS = "'DM Serif Display', Georgia, serif"
const FA = "'Instrument Sans', sans-serif"

// ── Definición de los bots ────────────────────────────────────────────────────
const BOTS = {
  general: {
    id:        'general',
    nombre:    'Asistente General',
    subtitulo: 'Consultas de obra',
    emoji:     null, // usa la mascota SVG
    accentBg:  C.tealBg,
    accentBd:  C.tealBd,
    accentColor: C.navyLight,
    headerBg:  C.navy,
    bubbleBot: '#e2f0ef',
    bubbleUser:'#0B5A50',
    chips: [
      { id: 'pliego',   label: 'Pliego técnico',   message: 'Necesito información sobre el pliego técnico.' },
      { id: 'general',  label: 'Info general',      message: 'Quiero información general de la obra.' },
      { id: 'computo',  label: 'Cómputo métrico',   message: 'Necesito detalles del cómputo métrico.' },
      { id: 'registro', label: 'Registro de obra',  message: 'Necesito ver el registro de obra.' },
    ],
    respuestas: {
      tiempo:      'Según el cronograma, la obra debe estar finalizada en 180 días desde el inicio. Verificá el countdown en el detalle técnico.',
      presupuesto: 'El avance financiero registrado está en 58%. Revisá los detalles completos en la pestaña Detalle Financiero.',
      problema:    'Detecto que podés necesitar un análisis de riesgo. Te recomiendo abrir una Orden de Servicio y registrar la novedad.',
      pliego:      'Para consultar el pliego técnico, accedé al Panel Admin de la obra y descargá el PDF desde la sección Documentos.',
      computo:     'El cómputo métrico está disponible en el Detalle Financiero → Bloque 3. Ahí encontrás la tabla mensual y la curva S.',
      registro:    'Los registros de inspección se cargan desde el Panel Inspector. Los últimos 3 registros son visibles en el Detalle Técnico.',
      default: [
        'Entiendo tu consulta. ¿Querés más detalles sobre el estado técnico o financiero de la obra?',
        'Podemos revisar el avance, detectar bloqueos o generar un resumen ejecutivo.',
        'Para datos en tiempo real, verificá la obra directamente en el listado.',
        'Puedo ayudarte a interpretar los indicadores o preparar los próximos pasos.',
      ],
    },
  },

  auditor: {
    id:        'auditor',
    nombre:    'Bot Auditor',
    subtitulo: 'Pliegos y Contratos',
    emoji:     '⚖️',
    accentBg:  C.blueBg,
    accentBd:  C.blueBd,
    accentColor: C.blue,
    headerBg:  '#0f2d4a',
    bubbleBot: '#e8f0fb',
    bubbleUser:'#1e4d8c',
    chips: [
      { id: 'luminaria',  label: 'Especificación técnica', message: '¿Qué tipo de luminaria LED exige el pliego técnico para alumbrado público?' },
      { id: 'anticipo',   label: 'Anticipo financiero',    message: '¿Cuál es el porcentaje de anticipo financiero en el contrato de la LP 5541?' },
      { id: 'penalidades',label: 'Penalidades por atraso', message: '¿Qué dice el artículo 15 sobre las penalidades por atraso en la curva de inversión?' },
      { id: 'contrato',   label: 'Contrato adjudicado',    message: '¿Dónde puedo consultar el contrato adjudicado y la resolución de aprobación?' },
    ],
    respuestas: {
      luminaria:   'Según el Pliego de Especificaciones Técnicas (sección 4.2), las luminarias LED deben ser tipo módulo integrado 150W, IRC≥70, temperatura de color 4000K, con certificación IRAM 62462. No se admiten lámparas de sodio como sustituto.',
      anticipo:    'El contrato LP 5541 estipula un anticipo financiero del 20% del monto contractual, sujeto a presentación de garantía bancaria equivalente y a la firma del Acta de Inicio. Ver Cláusula 8.1.',
      penalidad:   'El Artículo 15 establece una multa del 1‰ del monto contractual por cada día de atraso sobre la curva de inversión planificada, aplicable a partir del día 8 de desvío acumulado.',
      contrato:    'El contrato adjudicado y la resolución de aprobación están disponibles en el Panel Admin de la obra → sección Documentos. Si no está cargado, solicitalo al área de Administración de Contratos.',
      default: [
        'Soy el Bot Auditor. Analizaré la documentación contractual para responderte con precisión.',
        'Revisaré el Pliego de Especificaciones Técnicas y el Contrato Adjudicado para darte la cláusula exacta.',
        'Para validar datos legales, necesito que la documentación esté cargada en el sistema. ¿Querés que busque en los documentos disponibles?',
        'Detecté una consulta sobre cláusulas contractuales. ¿Especificás el número de LP para buscar el contrato exacto?',
      ],
    },
  },

  analista: {
    id:        'analista',
    nombre:    'Bot Analista',
    subtitulo: 'Gestión y Tableros',
    emoji:     '📊',
    accentBg:  C.purpleBg,
    accentBd:  C.purpleBd,
    accentColor: C.purple,
    headerBg:  '#3b0764',
    bubbleBot: '#f1eeff',
    bubbleUser:'#5b21b6',
    chips: [
      { id: 'desvio',      label: 'Obras con mayor desvío',   message: 'Listame las 5 obras con mayor desvío entre avance físico y financiero.' },
      { id: 'inspecciones',label: 'Inspecciones pendientes',  message: '¿Cuántas inspecciones pendientes de revisión hay en transmisión esta semana?' },
      { id: 'reporte',     label: 'Reporte ejecutivo',        message: 'Resumime el estado general de la obra de la subestación Los Espinillos.' },
      { id: 'certificados',label: 'Certificados emitidos',    message: '¿Cuál es el monto total certificado acumulado en obras de distribución?' },
    ],
    respuestas: {
      desvio:       'Top 5 obras con mayor brecha físico–financiero:\n1. LP 5238 — Desvío: +18 pts (físico 98%, financiero 80%)\n2. LP 4972 — Desvío: +14 pts\n3. LP 5243 — Desvío: +11 pts\n4. LP 5516 — Desvío: +8 pts\n5. LP 5478 — Desvío: +7 pts\nTe recomiendo revisar LP 5238 con urgencia.',
      inspeccion:   'Esta semana hay 4 inspecciones pendientes de revisión en obras de transmisión:\n• LP 5238 — 18 días sin registro ⚠️\n• LP 5243 — 5 días sin registro ✓\n• LP 5262 — 12 días sin registro ⚠️\n• LP 5516 — 3 días sin registro ✓',
      reporte:      'Estado LP 5516 — E.T. Los Espinillos:\n• Avance físico: 26% | Financiero: 18%\n• Estado: EN PLAZO (fecha fin: ago/27)\n• Inspector: Sin asignar\n• Alertas: Sin registros recientes\n• Certificado: $475M de $4.802B total\n• Recomendación: Asignar inspector y activar registro semanal.',
      certificado:  'Monto total certificado en obras de distribución activas: $12.847M\nDistribución: 14 obras en ejecución, avance financiero promedio 42%. 3 obras superan el 80% de avance. 2 obras con avance menor al 15%.',
      default: [
        'Soy el Bot Analista. Cruzaré los datos de gestión para darte una respuesta directa.',
        'Analizando los tableros de seguimiento. Dame un momento para procesar los datos actuales.',
        'Para un análisis más preciso, indicame el número de LP o el tipo de obra (transmisión/distribución/civil).',
        'Detecté tu consulta de gestión. ¿Querés que filtre por estado, tipo de obra o inspector?',
      ],
    },
  },
}

// ── Motor de respuestas ────────────────────────────────────────────────────────
function getBotReply(botId, text) {
  const bot = BOTS[botId]
  const t = text.toLowerCase()

  if (botId === 'general') {
    if (t.includes('tiempo') || t.includes('plazo') || t.includes('countdown')) return bot.respuestas.tiempo
    if (t.includes('presupuesto') || t.includes('dinero') || t.includes('financiero')) return bot.respuestas.presupuesto
    if (t.includes('problema') || t.includes('error') || t.includes('bloqueo')) return bot.respuestas.problema
    if (t.includes('pliego')) return bot.respuestas.pliego
    if (t.includes('cómputo') || t.includes('computo')) return bot.respuestas.computo
    if (t.includes('registro')) return bot.respuestas.registro
  }
  if (botId === 'auditor') {
    if (t.includes('luminaria') || t.includes('led') || t.includes('alumbrado')) return bot.respuestas.luminaria
    if (t.includes('anticipo') || t.includes('5541')) return bot.respuestas.anticipo
    if (t.includes('penalidad') || t.includes('multa') || t.includes('artículo 15') || t.includes('atraso')) return bot.respuestas.penalidad
    if (t.includes('contrato') || t.includes('resolución') || t.includes('adjudicado')) return bot.respuestas.contrato
  }
  if (botId === 'analista') {
    if (t.includes('desvío') || t.includes('desvio') || t.includes('brecha')) return bot.respuestas.desvio
    if (t.includes('inspección') || t.includes('inspeccion') || t.includes('pendiente')) return bot.respuestas.inspeccion
    if (t.includes('reporte') || t.includes('resumen') || t.includes('espinillo')) return bot.respuestas.reporte
    if (t.includes('certificado') || t.includes('monto') || t.includes('distribución')) return bot.respuestas.certificado
  }

  const arr = bot.respuestas.default
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Mascota SVG compacta ──────────────────────────────────────────────────────
function MascotaSVG({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cb" cx="42%" cy="35%" r="58%">
          <stop offset="0%" stopColor="#e8f5f2"/>
          <stop offset="100%" stopColor="#8fbfb8"/>
        </radialGradient>
        <radialGradient id="ch" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#1db899"/>
          <stop offset="100%" stopColor="#083d30"/>
        </radialGradient>
        <radialGradient id="cv" cx="38%" cy="32%" r="55%">
          <stop offset="0%" stopColor="#a8eddf"/>
          <stop offset="100%" stopColor="#0a5e4a"/>
        </radialGradient>
        <radialGradient id="cbg2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0d3d35"/>
          <stop offset="100%" stopColor="#061f1b"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="100" fill="url(#cbg2)"/>
      <ellipse cx="52"  cy="105" rx="18" ry="12" fill="url(#cb)"/>
      <ellipse cx="148" cy="105" rx="18" ry="12" fill="url(#cb)"/>
      <ellipse cx="100" cy="128" rx="40" ry="43" fill="url(#cb)" stroke="#9ecfc8" strokeWidth="1"/>
      <ellipse cx="100" cy="84"  rx="44" ry="48" fill="url(#ch)" stroke="#0f6b54" strokeWidth="1.2"/>
      <path d="M97 36 L100 26 L98 26 L102 17 L99 17 L104 7 L106 17 L103 17 L107 26 L105 26 L108 36 Z" fill="#f0c040"/>
      <ellipse cx="100" cy="84" rx="32" ry="28" fill="url(#cv)" stroke="#0d7a62" strokeWidth="1.5"/>
      <ellipse cx="100" cy="84" rx="28" ry="24" fill="#0a2e26" opacity="0.6"/>
      <ellipse cx="88" cy="80" rx="9" ry="9" fill="#061f1b"/>
      <ellipse cx="112" cy="80" rx="9" ry="9" fill="#061f1b"/>
      <ellipse cx="88" cy="80" rx="6" ry="6" fill="#1db899"/>
      <ellipse cx="112" cy="80" rx="6" ry="6" fill="#1db899"/>
      <ellipse cx="88" cy="80" rx="3" ry="3" fill="#a8eddf"/>
      <ellipse cx="112" cy="80" rx="3" ry="3" fill="#a8eddf"/>
      <ellipse cx="86" cy="78" rx="1.5" ry="1.5" fill="#fff" opacity="0.85"/>
      <ellipse cx="110" cy="78" rx="1.5" ry="1.5" fill="#fff" opacity="0.85"/>
    </svg>
  )
}

// ── BotAvatar ─────────────────────────────────────────────────────────────────
function BotAvatar({ bot, size = 36 }) {
  if (bot.id === 'general') return <MascotaSVG size={size} />
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bot.headerBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.45, flexShrink: 0,
      border: `2px solid ${bot.accentBd}`,
    }}>
      {bot.emoji}
    </div>
  )
}

// ── BotCard — tarjeta de selección ────────────────────────────────────────────
function BotCard({ bot, active, onClick }) {
  const [hov, setHov] = useState(false)
  const isActive = active || hov

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: '1 1 0', minWidth: 0,
        background: active ? bot.accentBg : C.white,
        border: `2px solid ${active ? bot.accentColor : C.rule}`,
        borderRadius: 14, padding: '16px 14px',
        cursor: 'pointer', textAlign: 'left',
        transition: 'all .18s ease',
        transform: hov && !active ? 'translateY(-2px)' : 'none',
        boxShadow: active
          ? `0 0 0 3px ${bot.accentBd}`
          : hov ? '0 4px 16px rgba(0,0,0,.08)' : '0 1px 4px rgba(0,0,0,.04)',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <BotAvatar bot={bot} size={40} />
        <div>
          <p style={{
            fontFamily: FS, fontSize: 15,
            color: active ? bot.accentColor : C.ink,
            margin: 0, lineHeight: 1.2,
            transition: 'color .18s',
          }}>
            {bot.nombre}
          </p>
          <p style={{
            fontFamily: FM, fontSize: 10,
            color: active ? bot.accentColor : C.ink3,
            margin: 0, letterSpacing: '.04em',
            textTransform: 'uppercase', opacity: .8,
          }}>
            {bot.subtitulo}
          </p>
        </div>
        {active && (
          <div style={{
            marginLeft: 'auto', width: 8, height: 8,
            borderRadius: '50%', background: bot.accentColor,
            flexShrink: 0,
            animation: 'pulse-dot 1.8s ease-in-out infinite',
          }}/>
        )}
      </div>
    </button>
  )
}

// ── Chip de sugerencia ────────────────────────────────────────────────────────
function Chip({ label, onClick, color, bg, bd }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: `1px solid ${hov ? color : bd}`,
        borderRadius: 99, background: hov ? bg : C.white,
        padding: '6px 14px', cursor: 'pointer',
        fontFamily: FM, fontSize: 11, fontWeight: 600,
        color: hov ? color : C.ink2,
        letterSpacing: '.04em',
        transition: 'all .15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

// ── Burbuja de mensaje ────────────────────────────────────────────────────────
function Bubble({ msg, bot }) {
  const isBot = msg.from === 'bot'
  return (
    <div style={{
      display: 'flex',
      flexDirection: isBot ? 'row' : 'row-reverse',
      alignItems: 'flex-end',
      gap: 8, marginBottom: 12,
    }}>
      {isBot && <BotAvatar bot={bot} size={28} />}
      <div style={{
        maxWidth: '78%',
        padding: '10px 14px',
        borderRadius: isBot ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
        background: isBot ? bot.bubbleBot : bot.bubbleUser,
        color: isBot ? C.ink : C.white,
        fontSize: 13, lineHeight: 1.65,
        fontFamily: FA,
        whiteSpace: 'pre-line',
        boxShadow: '0 1px 4px rgba(0,0,0,.06)',
      }}>
        {msg.text}
      </div>
    </div>
  )
}

// ── Indicador "escribiendo..." ────────────────────────────────────────────────
function TypingIndicator({ bot }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 12 }}>
      <BotAvatar bot={bot} size={28} />
      <div style={{
        padding: '10px 16px',
        borderRadius: '4px 14px 14px 14px',
        background: bot.bubbleBot,
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: bot.accentColor,
            animation: `typing-dot 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}/>
        ))}
      </div>
    </div>
  )
}

// ── Chatbot principal ─────────────────────────────────────────────────────────
export default function Chatbot() {
  const [activeBotId, setActiveBotId] = useState('general')
  const [chats, setChats] = useState({
    general:  [{ from: 'bot', text: '¡Hola! Soy el Asistente General de EPEC. ¿En qué puedo ayudarte hoy?' }],
    auditor:  [{ from: 'bot', text: '⚖️ Bot Auditor activo. Consultame sobre pliegos, contratos y cláusulas de tus obras.' }],
    analista: [{ from: 'bot', text: '📊 Bot Analista activo. Consultame sobre desvíos, certificados, inspecciones pendientes o pedí un reporte ejecutivo.' }],
  })
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  const bot = BOTS[activeBotId]
  const messages = chats[activeBotId]

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, sending])

  // Cambia de bot sin borrar el historial de ninguno
  const switchBot = (id) => {
    setActiveBotId(id)
    setDraft('')
    setSending(false)
  }

  const sendMessage = (text) => {
    if (!text.trim() || sending) return
    const userMsg = { from: 'user', text: text.trim() }
    setChats(prev => ({ ...prev, [activeBotId]: [...prev[activeBotId], userMsg] }))
    setDraft('')
    setSending(true)

    setTimeout(() => {
      const reply = getBotReply(activeBotId, text)
      const botMsg = { from: 'bot', text: reply }
      setChats(prev => ({ ...prev, [activeBotId]: [...prev[activeBotId], botMsg] }))
      setSending(false)
    }, 700 + Math.random() * 400)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(draft)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500;600&family=Instrument+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #eceae3; font-family: 'Instrument Sans', sans-serif; }
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.4; transform:scale(1.4); }
        }
        @keyframes typing-dot {
          0%,60%,100% { transform:translateY(0); opacity:.4; }
          30%          { transform:translateY(-5px); opacity:1; }
        }
        .chat-input:focus { outline:none; border-color:#1db899 !important; box-shadow:0 0 0 3px #EAF5F4; }
        .chat-scroll::-webkit-scrollbar { width:4px; }
        .chat-scroll::-webkit-scrollbar-track { background:transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background:#d6d3c8; border-radius:99px; }
      `}</style>

      <div style={{
        minHeight: '100vh', background: C.paper2,
        padding: '24px 20px',
        fontFamily: FA,
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

          {/* ── Nav superior ── */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MascotaSVG size={36} />
              <div>
                <p style={{
                  fontFamily: FS, fontSize: 20, color: C.ink, lineHeight: 1.1,
                }}>
                  Centro de Asistentes IA
                </p>
                <p style={{
                  fontFamily: FM, fontSize: 10, color: C.ink3,
                  letterSpacing: '.06em', textTransform: 'uppercase',
                }}>
                  EPEC SAU · Sistema de obras públicas
                </p>
              </div>
            </div>
            <Link
              to="/"
              style={{
                fontFamily: FM, fontSize: 11, color: C.ink2,
                textDecoration: 'none', letterSpacing: '.04em',
                padding: '6px 14px', border: `1px solid ${C.rule}`,
                borderRadius: 99, background: C.white,
                transition: 'background .15s',
              }}
            >
              ← Volver
            </Link>
          </div>

          {/* ── Selector de bots ── */}
          <div style={{
            display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap',
          }}>
            {Object.values(BOTS).map(b => (
              <BotCard
                key={b.id}
                bot={b}
                active={activeBotId === b.id}
                onClick={() => switchBot(b.id)}
              />
            ))}
          </div>

          {/* ── Panel principal del chat ── */}
          <div style={{
            background: C.white,
            border: `1px solid ${C.rule}`,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,.07)',
          }}>

            {/* Header del bot activo */}
            <div style={{
              background: bot.headerBg,
              padding: '14px 20px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <BotAvatar bot={bot} size={38} />
                <div>
                  <p style={{
                    fontFamily: FS, fontSize: 17, color: C.white,
                    margin: 0, lineHeight: 1.2,
                  }}>
                    {bot.nombre}
                  </p>
                  <p style={{
                    fontFamily: FM, fontSize: 9, color: 'rgba(255,255,255,.55)',
                    margin: 0, letterSpacing: '.07em', textTransform: 'uppercase',
                  }}>
                    {bot.subtitulo}
                  </p>
                </div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: FM, fontSize: 10,
                color: 'rgba(255,255,255,.6)',
                letterSpacing: '.04em',
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: sending ? '#fde68a' : '#1db899',
                  transition: 'background .3s',
                }}/>
                {sending ? 'Procesando...' : 'En línea'}
              </div>
            </div>

            {/* Chips de sugerencias */}
            <div style={{
              padding: '12px 16px 0',
              display: 'flex', flexWrap: 'wrap', gap: 7,
              borderBottom: `1px solid ${C.rule}`,
              paddingBottom: 12,
              background: bot.accentBg,
            }}>
              <span style={{
                fontFamily: FM, fontSize: 10, color: bot.accentColor,
                letterSpacing: '.06em', textTransform: 'uppercase',
                alignSelf: 'center', marginRight: 4, opacity: .8,
              }}>
                Sugerencias:
              </span>
              {bot.chips.map(chip => (
                <Chip
                  key={chip.id}
                  label={chip.label}
                  onClick={() => sendMessage(chip.message)}
                  color={bot.accentColor}
                  bg={bot.accentBg}
                  bd={bot.accentBd}
                />
              ))}
            </div>

            {/* Área de mensajes */}
            <div
              ref={scrollRef}
              className="chat-scroll"
              style={{
                height: 380, overflowY: 'auto',
                padding: '20px 16px 8px',
                background: C.white,
              }}
            >
              {messages.map((msg, i) => (
                <Bubble key={i} msg={msg} bot={bot} />
              ))}
              {sending && <TypingIndicator bot={bot} />}
            </div>

            {/* Input */}
            <div style={{
              padding: '12px 16px',
              borderTop: `1px solid ${C.rule}`,
              background: C.paper,
              display: 'flex', gap: 10,
            }}>
              <input
                className="chat-input"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
                placeholder={`Preguntale al ${bot.nombre}...`}
                disabled={sending}
                style={{
                  flex: 1,
                  border: `1px solid ${C.rule}`,
                  borderRadius: 99, padding: '10px 18px',
                  fontSize: 13, fontFamily: FA, color: C.ink,
                  background: C.white,
                  transition: 'border-color .15s, box-shadow .15s',
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={sending || !draft.trim()}
                style={{
                  background: sending || !draft.trim() ? C.ink3 : bot.headerBg,
                  color: C.white, border: 'none',
                  borderRadius: 99, padding: '10px 22px',
                  fontFamily: FM, fontSize: 11, fontWeight: 600,
                  letterSpacing: '.06em', textTransform: 'uppercase',
                  cursor: sending || !draft.trim() ? 'not-allowed' : 'pointer',
                  transition: 'background .15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                  whiteSpace: 'nowrap',
                }}
              >
                {sending ? (
                  <span style={{
                    width: 12, height: 12,
                    border: '2px solid rgba(255,255,255,.3)',
                    borderTopColor: C.white,
                    borderRadius: '50%',
                    animation: 'spin .7s linear infinite',
                    display: 'inline-block',
                  }}/>
                ) : '↑ Enviar'}
              </button>
            </div>

          </div>

          {/* Nota disclaimer */}
          <p style={{
            textAlign: 'center', marginTop: 12,
            fontFamily: FM, fontSize: 10, color: C.ink3,
            letterSpacing: '.04em', opacity: .7,
          }}>
            Los asistentes IA generan respuestas automáticas — verificá información crítica en las fuentes oficiales.
          </p>

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}
