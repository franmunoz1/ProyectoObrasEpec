import React, { useState, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

// ─────────────────────────────────────────────────────────────────────────────
// FormRegistroInspeccion.jsx
// Formulario completo de registro de inspección de obra
//
// USO:
//   Copiar a src/components/FormRegistroInspeccion.jsx
//   En tu router o en App.jsx:
//     import FormRegistroInspeccion from './components/FormRegistroInspeccion'
//     <FormRegistroInspeccion
//       obraId={3}
//       obraNombre="LP 3 PEQUEÑO APROVECHAMIENTO HIDROELÉCTRICO"
//       onGuardar={(datos) => console.log(datos)}
//       onVolver={() => navigate(-1)}
//     />
//
// SIN dependencias externas — solo React
// ─────────────────────────────────────────────────────────────────────────────

// ── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  navy:     '#0f2d4a',
  navyLight:'#1a4a6e',
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
}

const FONT_MONO  = "'DM Mono', monospace"
const FONT_SERIF = "'DM Serif Display', Georgia, serif"
const FONT_SANS  = "'Instrument Sans', sans-serif"

// ── Estado inicial del formulario ─────────────────────────────────────────────
const FORM_INICIAL = {
  fechaInspeccion:    new Date().toISOString().slice(0, 10),
  responsable:        '',
  descripcionTareas:  '',
  avanceFisico:       '',
  presenciaRT:        'Si',

  req_ingresoEstaciones: false,
  req_cortesEnergia:     false,
  req_cambiosProyecto:   false,
  req_prensa:            false,
  req_sinSolicitudes:    false,

  estadoObra:        'En curso según lo planificado',
  hayPersonal:       'Si',

  fotos: [],
  observaciones: '',
  conformidad: '',
}

// ── Componentes auxiliares ───────────────────────────────────────────────────
function SectionTitle({ icon, title }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      marginBottom: 16, paddingBottom: 10,
      borderBottom: `1px solid ${C.rule}`,
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <h3 style={{
        fontFamily: FONT_SERIF, fontSize: 18,
        color: C.ink, fontWeight: 400,
      }}>
        {title}
      </h3>
    </div>
  )
}

function Label({ children, required }) {
  return (
    <label style={{
      display: 'block',
      fontSize: 12, fontWeight: 600,
      fontFamily: FONT_MONO, color: C.ink2,
      letterSpacing: '.04em', marginBottom: 6,
      textTransform: 'uppercase',
    }}>
      {children}
      {required && <span style={{ color: C.red, marginLeft: 3 }}>*</span>}
    </label>
  )
}

const inputBase = {
  width: '100%',
  padding: '10px 14px',
  background: C.white,
  border: `1px solid ${C.rule}`,
  borderRadius: 8,
  fontSize: 14,
  fontFamily: FONT_SANS,
  color: C.ink,
  outline: 'none',
  transition: 'border-color .15s, box-shadow .15s',
}

function Input({ value, onChange, type = 'text', placeholder, min, max }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min} max={max}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        borderColor: focused ? C.blue : C.rule,
        boxShadow: focused ? `0 0 0 3px ${C.blueBg}` : 'none',
      }}
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 4 }) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        resize: 'vertical',
        lineHeight: 1.6,
        borderColor: focused ? C.blue : C.rule,
        boxShadow: focused ? `0 0 0 3px ${C.blueBg}` : 'none',
      }}
    />
  )
}

function Select({ value, onChange, options }) {
  const [focused, setFocused] = useState(false)
  return (
    <select
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        cursor: 'pointer',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2372726a' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
        paddingRight: 36,
        borderColor: focused ? C.blue : C.rule,
        boxShadow: focused ? `0 0 0 3px ${C.blueBg}` : 'none',
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 10,
      cursor: 'pointer', userSelect: 'none',
      fontSize: 13, color: C.ink2, fontFamily: FONT_SANS,
      padding: '6px 0',
    }}>
      <div
        onClick={onChange}
        style={{
          width: 18, height: 18, borderRadius: 4,
          border: `2px solid ${checked ? C.blue : C.rule}`,
          background: checked ? C.blue : C.white,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, cursor: 'pointer',
          transition: 'all .15s',
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      {label}
    </label>
  )
}

function AvanceFisicoSlider({ value, onChange }) {
  const num = Number(value) || 0
  const color = num < 30 ? C.red : num < 70 ? C.amber : C.green

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Input type="number" value={value} onChange={onChange} placeholder="0 – 100" min="0" max="100" />
        <div style={{
          flexShrink: 0,
          fontFamily: FONT_SERIF, fontSize: 26,
          color, minWidth: 60, textAlign: 'right',
        }}>
          {value !== '' ? `${num}%` : '—'}
        </div>
      </div>
      <div style={{
        height: 8, background: C.paper,
        border: `1px solid ${C.rule}`, borderRadius: 99, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${num}%`,
          background: color, borderRadius: 99,
          transition: 'width .3s ease, background .3s ease',
        }} />
      </div>
    </div>
  )
}

function DropZoneFotos({ fotos, onAgregar, onEliminar, onDescripcion }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = useCallback((files) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'))
    arr.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        onAgregar({ file, preview: e.target.result, descripcion: '' })
      }
      reader.readAsDataURL(file)
    })
  }, [onAgregar])

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files)
        }}
        style={{
          border: `2px dashed ${dragOver ? C.blue : C.rule}`,
          borderRadius: 10,
          padding: '28px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? C.blueBg : C.paper,
          transition: 'all .15s',
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
        <p style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.blue, fontWeight: 600, marginBottom: 4 }}>
          Hacé clic o arrastrá fotos aquí
        </p>
        <p style={{ fontSize: 11, color: C.ink3, fontFamily: FONT_SANS }}>
          JPG, PNG — múltiples archivos permitidos
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {fotos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {fotos.map((foto, i) => (
            <div key={i} style={{ border: `1px solid ${C.rule}`, borderRadius: 10, overflow: 'hidden', background: C.white }}>
              <div style={{ position: 'relative' }}>
                <img src={foto.preview} alt={`Foto ${i + 1}`} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                <button
                  type="button"
                  onClick={() => onEliminar(i)}
                  style={{
                    position: 'absolute', top: 6, right: 6,
                    background: 'rgba(0,0,0,.6)', color: C.white,
                    border: 'none', borderRadius: 99,
                    width: 24, height: 24, cursor: 'pointer',
                    fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >✕</button>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,.4)', padding: '3px 8px', fontSize: 10, color: C.white, fontFamily: FONT_MONO }}>
                  Foto {i + 1}
                </div>
              </div>
              <div style={{ padding: '8px' }}>
                <input
                  type="text"
                  value={foto.descripcion}
                  onChange={(e) => onDescripcion(i, e.target.value)}
                  placeholder="Descripción..."
                  style={{ width: '100%', padding: '5px 8px', border: `1px solid ${C.rule}`, borderRadius: 6, fontSize: 11, fontFamily: FONT_SANS, color: C.ink, outline: 'none', background: C.paper }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RegistroInspeccion({
  obraId = 3,
  obraNombre = 'LP 3 — 3° CONVOCATORIA: PEQUEÑO APROVECHAMIENTO HIDROELÉCTRICO LA VIÑA',
  onGuardar = (datos) => console.log('Guardar:', datos),
  onVolver = () => {},
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(FORM_INICIAL)
  const [enviando, setEnviando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [errores, setErrores] = useState({})

  const setVal = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const toggleReq = (key) => setForm((f) => {
    if (key === 'req_sinSolicitudes') {
      return {
        ...f,
        req_ingresoEstaciones: false,
        req_cortesEnergia: false,
        req_cambiosProyecto: false,
        req_prensa: false,
        req_sinSolicitudes: !f.req_sinSolicitudes,
      }
    }
    return { ...f, [key]: !f[key], req_sinSolicitudes: false }
  })

  const agregarFoto = (foto) => setForm((f) => ({ ...f, fotos: [...f.fotos, foto] }))
  const eliminarFoto = (i) => setForm((f) => ({ ...f, fotos: f.fotos.filter((_, idx) => idx !== i) }))
  const descripcionFoto = (i, desc) => setForm((f) => {
    const fotos = [...f.fotos]
    fotos[i] = { ...fotos[i], descripcion: desc }
    return { ...f, fotos }
  })

  const validar = () => {
    const e = {}
    if (!form.responsable.trim()) e.responsable = 'Requerido'
    if (form.avanceFisico === '' || Number(form.avanceFisico) < 0 || Number(form.avanceFisico) > 100) e.avanceFisico = 'Ingresá un valor entre 0 y 100'
    if (!form.descripcionTareas.trim()) e.descripcionTareas = 'Requerido'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validar()
    if (Object.keys(errs).length) { setErrores(errs); return }
    setEnviando(true)
    await new Promise((r) => setTimeout(r, 1200))
    onGuardar({ obraId, ...form })
    setEnviando(false)
    setGuardado(true)
  }

  if (guardado) {
    return (
      <div style={{ minHeight: '100vh', background: C.paper2, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: C.white, border: `1px solid ${C.greenBd}`, borderRadius: 16, padding: '48px 40px', textAlign: 'center', maxWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,.06)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, color: C.green, marginBottom: 8 }}>Inspección registrada</h2>
          <p style={{ fontSize: 13, color: C.ink3, fontFamily: FONT_SANS, lineHeight: 1.6, marginBottom: 24 }}>El registro fue guardado correctamente para la obra ID {obraId}.</p>
          <button onClick={() => { setGuardado(false); onVolver(); }} style={{ background: C.navy, color: C.white, border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 13, fontFamily: FONT_MONO, cursor: 'pointer', letterSpacing: '.04em' }}>Volver al inicio</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.paper2, padding: '24px 20px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={() => { if (onVolver) onVolver(); else navigate('/inspector') }} style={{ background: 'transparent', border: `1px solid ${C.rule}`, borderRadius: 8, padding: '7px 14px', fontSize: 12, fontFamily: FONT_MONO, color: C.ink2, cursor: 'pointer', letterSpacing: '.04em' }}>← Volver</button>
          <div style={{ background: C.navy, color: C.white, fontFamily: FONT_MONO, fontSize: 11, padding: '5px 12px', borderRadius: 6, letterSpacing: '.06em' }}>ID {obraId}</div>
        </div>

        <div style={{ background: C.navy, color: C.white, padding: '12px 20px', borderRadius: '10px 10px 0 0', fontSize: 12, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: FONT_MONO }}>Registro de Inspección</div>

        <div style={{ background: C.paper, border: `1px solid ${C.rule}`, borderTop: 'none', padding: '12px 20px' }}>
          <p style={{ fontSize: 11, color: C.ink3, fontFamily: FONT_MONO, marginBottom: 2, letterSpacing: '.04em' }}>OBRA</p>
          <p style={{ fontSize: 14, color: C.ink, fontFamily: FONT_SANS, fontWeight: 500 }}>{obraNombre}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ background: C.white, border: `1px solid ${C.rule}`, borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '28px' }}>

            <SectionTitle icon="📅" title="Información de la Visita" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <Label required>Fecha de inspección</Label>
                <Input type="date" value={form.fechaInspeccion} onChange={setVal('fechaInspeccion')} />
              </div>

              <div>
                <Label required>Nombre del responsable</Label>
                <Input value={form.responsable} onChange={setVal('responsable')} placeholder="Ej: Rocío Gómez" />
                {errores.responsable && <p style={{ fontSize: 11, color: C.red, fontFamily: FONT_MONO, marginTop: 4 }}>{errores.responsable}</p>}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Label required>Descripción de tareas realizadas</Label>
              <Textarea value={form.descripcionTareas} onChange={setVal('descripcionTareas')} placeholder="Detallá las tareas realizadas durante la visita..." rows={4} />
              {errores.descripcionTareas && <p style={{ fontSize: 11, color: C.red, fontFamily: FONT_MONO, marginTop: 4 }}>{errores.descripcionTareas}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
              <div>
                <Label required>Avance físico (%)</Label>
                <AvanceFisicoSlider value={form.avanceFisico} onChange={setVal('avanceFisico')} />
                {errores.avanceFisico && <p style={{ fontSize: 11, color: C.red, fontFamily: FONT_MONO, marginTop: 4 }}>{errores.avanceFisico}</p>}
              </div>
              <div>
                <Label>Presencia del R.T.</Label>
                <Select value={form.presenciaRT} onChange={setVal('presenciaRT')} options={[{ value: 'Si', label: 'Sí' }, { value: 'No', label: 'No' }, { value: 'N/A', label: 'No aplica' }]} />
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${C.rule}`, marginBottom: 28 }} />

            <SectionTitle icon="🔔" title="Requerimientos" />
            <div style={{ background: C.paper, border: `1px solid ${C.rule}`, borderRadius: 10, padding: '16px 20px', marginBottom: 28 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                <Checkbox checked={form.req_ingresoEstaciones} onChange={() => toggleReq('req_ingresoEstaciones')} label="Ingreso a estaciones" />
                <Checkbox checked={form.req_cortesEnergia} onChange={() => toggleReq('req_cortesEnergia')} label="Cortes de energía" />
                <Checkbox checked={form.req_cambiosProyecto} onChange={() => toggleReq('req_cambiosProyecto')} label="Cambios de proyecto" />
                <Checkbox checked={form.req_prensa} onChange={() => toggleReq('req_prensa')} label="Prensa" />
                <div style={{ gridColumn: '1 / -1', borderTop: `1px solid ${C.rule}`, margin: '6px 0' }} />
                <Checkbox checked={form.req_sinSolicitudes} onChange={() => toggleReq('req_sinSolicitudes')} label="Sin solicitudes externas" />
              </div>
            </div>

            <SectionTitle icon="👷" title="Estado Operativo" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
              <div>
                <Label>Estado de obra</Label>
                <Select value={form.estadoObra} onChange={setVal('estadoObra')} options={[{ value: 'En curso según lo planificado', label: 'En curso según lo planificado' }, { value: 'Con atraso leve', label: 'Con atraso leve' }, { value: 'Con atraso significativo', label: 'Con atraso significativo' }, { value: 'Paralizada', label: 'Paralizada' }, { value: 'Finalizada', label: 'Finalizada' }]} />
              </div>
              <div>
                <Label>¿Hay personas trabajando?</Label>
                <Select value={form.hayPersonal} onChange={setVal('hayPersonal')} options={[{ value: 'Si', label: 'Sí' }, { value: 'No', label: 'No' }, { value: 'Parcial', label: 'Parcialmente' }]} />
              </div>
            </div>

            <SectionTitle icon="📸" title="Evidencia (Fotos)" />
            <div style={{ marginBottom: 28 }}>
              <DropZoneFotos fotos={form.fotos} onAgregar={agregarFoto} onEliminar={eliminarFoto} onDescripcion={descripcionFoto} />
              {form.fotos.length > 0 && <p style={{ fontSize: 11, color: C.ink3, fontFamily: FONT_MONO, marginTop: 8 }}>{form.fotos.length} foto{form.fotos.length > 1 ? 's' : ''} adjunta{form.fotos.length > 1 ? 's' : ''}</p>}
            </div>

            <SectionTitle icon="📝" title="Observaciones y Conformidad" />
            <div style={{ marginBottom: 16 }}>
              <Label>Observaciones adicionales</Label>
              <Textarea value={form.observaciones} onChange={setVal('observaciones')} placeholder="Anotá cualquier novedad relevante de la visita..." rows={3} />
            </div>

            <div style={{ marginBottom: 28 }}>
              <Label>Conformidad con el avance declarado</Label>
              <Select value={form.conformidad} onChange={setVal('conformidad')} options={[{ value: '', label: 'Seleccioná una opción' }, { value: 'Conforme', label: 'Conforme' }, { value: 'Conforme con observaciones', label: 'Conforme con observaciones' }, { value: 'No conforme', label: 'No conforme' }]} />
            </div>

            <div style={{ display: 'flex', gap: 12, borderTop: `1px solid ${C.rule}`, paddingTop: 24 }}>
              <button type="button" onClick={() => { if (onVolver) onVolver(); else navigate('/inspector') }} style={{ flex: '0 0 auto', padding: '11px 24px', background: 'transparent', border: `1px solid ${C.rule}`, borderRadius: 8, fontSize: 13, fontFamily: FONT_MONO, color: C.ink2, cursor: 'pointer', letterSpacing: '.04em' }}>Cancelar</button>
              <button type="submit" disabled={enviando} style={{ flex: 1, padding: '11px 24px', background: enviando ? C.ink3 : C.navy, color: C.white, border: 'none', borderRadius: 8, fontSize: 13, fontFamily: FONT_MONO, fontWeight: 600, cursor: enviando ? 'not-allowed' : 'pointer', letterSpacing: '.06em', transition: 'background .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {enviando ? (
                  <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.3)', borderTopColor: C.white, borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} /> Guardando...</>
                ) : '✓ Guardar inspección'}
              </button>
            </div>

          </div>
        </form>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}

