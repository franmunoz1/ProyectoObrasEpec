import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './components/Home';
import Login from './components/Login';
import ListadoObras from './components/ListadoObras';
import InspectorDashboard from './components/InspectorDashboard';
import RegistroInspeccion from './components/RegistroInspeccion';
import ObraDetalleTecnico from './components/ObraDetalleTecnico';
import ObraDetalleFinanciero from './components/ObraDetalleFinanciero';
import Chatbot from './components/Chatbot';

// ── Mascota SVG inline ────────────────────────────────────────────────────────
const EpecMascotSVG = ({ size = 60 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="mb" cx="42%" cy="35%" r="58%">
        <stop offset="0%"  stopColor="#e8f5f2"/>
        <stop offset="60%" stopColor="#c2ddd8"/>
        <stop offset="100%" stopColor="#8fbfb8"/>
      </radialGradient>
      <radialGradient id="mh" cx="40%" cy="30%" r="60%">
        <stop offset="0%"  stopColor="#1db899"/>
        <stop offset="50%" stopColor="#0d7a62"/>
        <stop offset="100%" stopColor="#083d30"/>
      </radialGradient>
      <radialGradient id="mv" cx="38%" cy="32%" r="55%">
        <stop offset="0%"  stopColor="#a8eddf"/>
        <stop offset="50%" stopColor="#3bc8a8"/>
        <stop offset="100%" stopColor="#0a5e4a"/>
      </radialGradient>
      <radialGradient id="mbg" cx="50%" cy="50%" r="50%">
        <stop offset="0%"  stopColor="#0d3d35"/>
        <stop offset="100%" stopColor="#061f1b"/>
      </radialGradient>
    </defs>

    <circle cx="100" cy="100" r="100" fill="url(#mbg)"/>
    <circle cx="100" cy="100" r="90"  fill="none" stroke="#1db899" strokeWidth="0.8" opacity="0.2"/>

    <ellipse cx="52"  cy="105" rx="20" ry="13" fill="url(#mb)" stroke="#9ecfc8" strokeWidth="1"/>
    <ellipse cx="148" cy="105" rx="20" ry="13" fill="url(#mb)" stroke="#9ecfc8" strokeWidth="1"/>
    <circle cx="52"  cy="105" r="8" fill="#e8f5f2" stroke="#9ecfc8" strokeWidth="0.8"/>
    <circle cx="148" cy="105" r="8" fill="#e8f5f2" stroke="#9ecfc8" strokeWidth="0.8"/>

    <ellipse cx="100" cy="128" rx="42" ry="45" fill="url(#mb)" stroke="#9ecfc8" strokeWidth="1.2"/>

    <rect x="82" y="115" width="36" height="24" rx="4" fill="#0d3d35" opacity="0.75"/>
    <rect x="84" y="117" width="11" height="18" rx="2" fill="#1db899" opacity="0.55"/>
    <rect x="97" y="117" width="5"  height="18" rx="2" fill="#0a8c74" opacity="0.5"/>
    <rect x="104" y="117" width="10" height="18" rx="2" fill="#1db899" opacity="0.4"/>
    <line x1="85"  y1="121" x2="94"  y2="121" stroke="#a8eddf" strokeWidth="0.8" opacity="0.7"/>
    <line x1="85"  y1="125" x2="93"  y2="125" stroke="#a8eddf" strokeWidth="0.6" opacity="0.5"/>
    <line x1="85"  y1="129" x2="94"  y2="129" stroke="#a8eddf" strokeWidth="0.8" opacity="0.7"/>

    <ellipse cx="100" cy="84"  rx="46" ry="50" fill="url(#mh)" stroke="#0f6b54" strokeWidth="1.5"/>
    <ellipse cx="93"  cy="66"  rx="16" ry="11" fill="#1db899" opacity="0.18"/>

    <path d="M97 38 L100 27 L98 27 L102 18 L99 18 L104 8 L106 18 L103 18 L107 27 L105 27 L108 38 Z"
          fill="#f0c040" stroke="#c89020" strokeWidth="0.6"/>

    <ellipse cx="100" cy="84" rx="34" ry="30" fill="url(#mv)" stroke="#0d7a62" strokeWidth="1.8"/>
    <ellipse cx="100" cy="84" rx="30" ry="26" fill="#0a2e26" opacity="0.6"/>

    <ellipse cx="88" cy="80" rx="10" ry="10" fill="#061f1b"/>
    <ellipse cx="112" cy="80" rx="10" ry="10" fill="#061f1b"/>
    <ellipse cx="88" cy="80" rx="7"  ry="7"  fill="#1db899"/>
    <ellipse cx="112" cy="80" rx="7"  ry="7"  fill="#1db899"/>
    <ellipse cx="88" cy="80" rx="4"  ry="4"  fill="#a8eddf"/>
    <ellipse cx="112" cy="80" rx="4"  ry="4"  fill="#a8eddf"/>
    <ellipse cx="88" cy="80" rx="2"  ry="2"  fill="#061f1b"/>
    <ellipse cx="112" cy="80" rx="2"  ry="2"  fill="#061f1b"/>
    <ellipse cx="86" cy="78" rx="1.2" ry="1.2" fill="#ffffff" opacity="0.85"/>
    <ellipse cx="110" cy="78" rx="1.2" ry="1.2" fill="#ffffff" opacity="0.85"/>

    <rect x="91"  cy="93" y="93" width="18" height="3" rx="1.5" fill="#1db899" opacity="0.5"/>

    <ellipse cx="66"  cy="78" rx="5" ry="4" fill="#0d7a62" stroke="#0f6b54" strokeWidth="0.8"/>
    <ellipse cx="134" cy="78" rx="5" ry="4" fill="#0d7a62" stroke="#0f6b54" strokeWidth="0.8"/>
  </svg>
)

function FloatingChatButton() {
  const [hovered, setHovered] = useState(false);
  const location = useLocation();

  if (location.pathname === '/chatbot') return null;

  return (
    <div
      style={{
        position: 'fixed',
        right: 22,
        bottom: 22,
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div
        style={{
          background: '#0B5A50',
          color: '#fff',
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          padding: '5px 12px',
          borderRadius: 99,
          whiteSpace: 'nowrap',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0) scale(1)' : 'translateY(6px) scale(.95)',
          transition: 'opacity .2s ease, transform .2s ease',
          pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,.25)',
        }}
      >
        Asistente IA · EPEC
      </div>

      <Link
        to="/chatbot"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Abrir asistente IA de EPEC"
        style={{
          display: 'block',
          width: 68,
          height: 68,
          borderRadius: '50%',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          textDecoration: 'none',
          boxShadow: hovered
            ? '0 0 0 4px rgba(29,184,153,.35), 0 12px 28px rgba(0,0,0,.35)'
            : '0 0 0 2px rgba(29,184,153,.2), 0 8px 20px rgba(0,0,0,.25)',
          transition: 'box-shadow .2s ease, transform .2s ease',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
          animation: 'epec-float 3.2s ease-in-out infinite',
        }}
      >
        <EpecMascotSVG size={68} />
      </Link>

      <div
        style={{
          position: 'absolute',
          bottom: 4,
          right: 4,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#1db899',
          border: '2px solid #fff',
          animation: 'epec-pulse 2s ease-in-out infinite',
        }}
      />

      <style>{`
        @keyframes epec-float {
          0%,100% { transform: ${hovered ? 'scale(1.08)' : 'scale(1)'} translateY(0); }
          50%      { transform: ${hovered ? 'scale(1.08)' : 'scale(1)'} translateY(-5px); }
        }
        @keyframes epec-pulse {
          0%,100% { opacity: 1;   transform: scale(1);    }
          50%      { opacity: .55; transform: scale(1.25); }
        }
      `}</style>
    </div>
  );
}


function AuthenticatedApp() {
  const { user } = useAuth();

  return (
    <>
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/obras" element={<ListadoObras />} />
          <Route path="/inspector" element={<InspectorDashboard />} />
          <Route path="/registro-inspeccion" element={<RegistroInspeccion />} />
          <Route path="/obra/:id/tecnico" element={<ObraDetalleTecnico />} />
          <Route path="/obra/:id/financiero" element={<ObraDetalleFinanciero />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {user && <FloatingChatButton />}
    </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AuthenticatedApp />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;