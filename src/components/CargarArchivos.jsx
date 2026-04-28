import React, { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OBRAS_DATA } from './ListadoObras';

const C = {
  paper: '#f5f3ee',
  paper2: '#eceae3',
  rule: '#d6d3c8',
  ink: '#0f0f0d',
  ink2: '#3a3a35',
  ink3: '#72726a',
  white: '#ffffff',
  navy: '#0f2d4a',
  navyHov: '#1a4a6e',
  teal: '#0B5A50',
  tealSoft: '#EAF5F4',
  tealBd: '#B2DFDB',
  blue: '#1e4d8c',
  blueBg: '#f0f5fd',
  blueBd: '#bfdbfe',
  amber: '#b45309',
  amberBg: '#fefbf0',
  amberBd: '#fde8a8',
  green: '#166534',
  greenBg: '#f0faf4',
  greenBd: '#bbf7d0',
}

const FONT_MONO = "'DM Mono', monospace"
const FONT_SERIF = "'DM Serif Display', Georgia, serif"
const FONT_SANS = "'Instrument Sans', sans-serif"

const TIPOS_DOCUMENTO = [
  { key: 'pliego', label: 'Pliego', hint: 'Pliego de bases y condiciones', color: C.blue, bg: C.blueBg, border: C.blueBd },
  { key: 'libroObra', label: 'Libro de obra', hint: 'Actas, novedades y seguimiento diario', color: C.teal, bg: C.tealSoft, border: C.tealBd },
  { key: 'planos', label: 'Planos / anexos', hint: 'Planimetría, detalles y documentación técnica', color: C.amber, bg: C.amberBg, border: C.amberBd },
  { key: 'otros', label: 'Otros archivos', hint: 'Contratos, certificados o documentación complementaria', color: C.green, bg: C.greenBg, border: C.greenBd },
]

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

function formatFileList(files) {
  if (!files.length) return 'Sin archivos cargados'
  if (files.length === 1) return files[0].name
  return `${files[0].name} +${files.length - 1}`
}

function DocumentCard({ tipo, archivos, onChange }) {
  const cantidad = archivos.length

  return (
    <label
      style={{
        display: 'block',
        background: C.white,
        border: `1px solid ${tipo.border}`,
        borderRadius: 16,
        padding: 18,
        boxShadow: '0 1px 4px rgba(0,0,0,.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <div>
          <p style={{ fontFamily: FONT_SERIF, fontSize: 18, color: C.ink, marginBottom: 4 }}>
            {tipo.label}
          </p>
          <p style={{ fontSize: 13, color: C.ink3, fontFamily: FONT_SANS, lineHeight: 1.5 }}>
            {tipo.hint}
          </p>
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 28,
            height: 28,
            padding: '0 8px',
            borderRadius: 999,
            background: tipo.bg,
            color: tipo.color,
            fontFamily: FONT_MONO,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {cantidad}
        </span>
      </div>

      <input
        type="file"
        multiple
        onChange={onChange}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
        style={{
          width: '100%',
          border: `1px dashed ${tipo.border}`,
          borderRadius: 12,
          padding: 12,
          background: tipo.bg,
          fontFamily: FONT_SANS,
          color: C.ink2,
          cursor: 'pointer',
        }}
      />

      <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
        {archivos.length ? (
          archivos.map((archivo) => (
            <div
              key={`${tipo.key}-${archivo.name}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                padding: '8px 10px',
                borderRadius: 10,
                background: '#fafafa',
                border: `1px solid ${C.rule}`,
                fontSize: 13,
                color: C.ink2,
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{archivo.name}</span>
              <span style={{ flexShrink: 0, color: C.ink3, fontFamily: FONT_MONO }}>{formatBytes(archivo.size)}</span>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 13, color: C.ink3, fontFamily: FONT_SANS }}>
            No hay archivos seleccionados para esta categoría.
          </div>
        )}
      </div>
    </label>
  )
}

export default function CargarArchivos() {
  const { user, logout } = useAuth()
  const obras = useMemo(() => OBRAS_DATA, [])
  const [obraId, setObraId] = useState(String(OBRAS_DATA[0]?.id || ''))
  const [archivosPorTipo, setArchivosPorTipo] = useState({
    pliego: [],
    libroObra: [],
    planos: [],
    otros: [],
  })
  const [comentario, setComentario] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState('success')

  const obraSeleccionada = obras.find((obra) => String(obra.id) === obraId) || obras[0]
  const totalArchivos = Object.values(archivosPorTipo).reduce((total, files) => total + files.length, 0)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const handleChangeFiles = (tipoKey) => (event) => {
    const nuevosArchivos = Array.from(event.target.files || [])

    setArchivosPorTipo((prev) => ({
      ...prev,
      [tipoKey]: [...prev[tipoKey], ...nuevosArchivos],
    }))

    event.target.value = ''
    setMensaje('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!obraSeleccionada) {
      setTipoMensaje('error')
      setMensaje('Seleccioná una obra antes de cargar archivos.')
      return
    }

    if (totalArchivos === 0) {
      setTipoMensaje('error')
      setMensaje('Agregá al menos un archivo para registrar la carga.')
      return
    }

    setTipoMensaje('success')
    setMensaje(`Archivos preparados para ${obraSeleccionada.nroLp} - ${obraSeleccionada.nombre}.`)
    setComentario('')
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
          <div className="bg-[#0B5A50] text-white px-6 py-3 rounded-t-xl font-mono text-xs font-semibold tracking-widest uppercase flex justify-between items-center">
            <span>Panel de Carga Documental</span>
            <span className="text-white/60">Sistema EPEC</span>
          </div>

          <div className="bg-white border border-t-0 border-[#d6d3c8] rounded-b-xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-2 leading-tight">
                  Cargar archivos por obra
                </h1>
                <p className="text-sm text-gray-600">
                  Seleccioná una obra y adjuntá la documentación correspondiente.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/obras"
                  className="px-4 py-2 bg-[#F9F8F6] border border-[#d6d3c8] text-[#0f0f0d] rounded-lg hover:bg-[#EAF5F4] transition font-mono text-sm uppercase tracking-widest"
                >
                  Volver al listado
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-[#0F7367] text-white rounded-lg hover:bg-[#0B5A50] transition font-mono text-sm uppercase tracking-widest"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_.9fr] gap-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-[#F9F8F6] border border-[#d6d3c8] rounded-xl p-5">
                  <label className="block mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-[#3a3a35]">
                    Obra
                  </label>
                  <select
                    value={obraId}
                    onChange={(e) => setObraId(e.target.value)}
                    className="w-full border border-[#d6d3c8] rounded-lg p-3 bg-white"
                  >
                    {obras.map((obra) => (
                      <option key={obra.id} value={obra.id}>
                        {obra.nroLp} - {obra.nombre}
                      </option>
                    ))}
                  </select>

                  {obraSeleccionada && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
                      <div className="bg-white border border-[#d6d3c8] rounded-lg p-3">
                        <span className="block text-[11px] font-mono uppercase tracking-widest text-gray-500 mb-1">Departamento</span>
                        <strong>{obraSeleccionada.departamento}</strong>
                      </div>
                      <div className="bg-white border border-[#d6d3c8] rounded-lg p-3">
                        <span className="block text-[11px] font-mono uppercase tracking-widest text-gray-500 mb-1">Estado</span>
                        <strong>{obraSeleccionada.estado}</strong>
                      </div>
                      <div className="bg-white border border-[#d6d3c8] rounded-lg p-3">
                        <span className="block text-[11px] font-mono uppercase tracking-widest text-gray-500 mb-1">Inspector</span>
                        <strong>{obraSeleccionada.inspectorAsignado}</strong>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {TIPOS_DOCUMENTO.map((tipo) => (
                    <DocumentCard
                      key={tipo.key}
                      tipo={tipo}
                      archivos={archivosPorTipo[tipo.key]}
                      onChange={handleChangeFiles(tipo.key)}
                    />
                  ))}
                </div>

                <div className="bg-white border border-[#d6d3c8] rounded-xl p-5 shadow-sm">
                  <label className="block mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-[#3a3a35]">
                    Observaciones
                  </label>
                  <textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    rows={4}
                    placeholder="Indicá si la carga corresponde a un hito, una ampliación de contrato o un respaldo documental."
                    className="w-full border border-[#d6d3c8] rounded-lg p-3 bg-white"
                  />

                  {mensaje && (
                    <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${tipoMensaje === 'success' ? 'bg-[#F0FAF4] border-[#BBF7D0] text-[#166534]' : 'bg-[#FEFBF0] border-[#FDE8A8] text-[#B45309]'}`}>
                      {mensaje}
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-gray-600">
                      <strong className="text-[#0f0f0d]">{totalArchivos}</strong> archivo(s) seleccionados
                      {comentario ? <span className="block mt-1">Observación: {comentario}</span> : null}
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#0F7367] text-white rounded-lg hover:bg-[#0B5A50] transition font-mono text-sm uppercase tracking-widest"
                    >
                      Registrar carga
                    </button>
                  </div>
                </div>
              </form>

              <aside className="space-y-4">
                <div className="bg-[#0f2d4a] text-white rounded-xl p-5 shadow-sm">
                  <p className="font-mono text-xs uppercase tracking-widest text-white/60 mb-2">Resumen</p>
                  <h2 className="font-serif text-2xl leading-tight mb-3">
                    {obraSeleccionada?.nroLp} - {obraSeleccionada?.nombre}
                  </h2>
                  <p className="text-sm text-white/80 leading-6">
                    {obraSeleccionada?.descripcion}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white/10 rounded-lg p-3">
                      <span className="block text-[11px] uppercase tracking-widest text-white/55 font-mono mb-1">Avance físico</span>
                      <strong>{obraSeleccionada?.avanceFisico}%</strong>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <span className="block text-[11px] uppercase tracking-widest text-white/55 font-mono mb-1">Avance financiero</span>
                      <strong>{obraSeleccionada?.avanceFinanciero}%</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#d6d3c8] rounded-xl p-5 shadow-sm">
                  <p className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-3">Archivos cargados</p>

                  <div className="space-y-3">
                    {TIPOS_DOCUMENTO.map((tipo) => (
                      <div key={`summary-${tipo.key}`} className="flex items-center justify-between gap-3 border border-[#eceae3] rounded-lg px-3 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-[#0f0f0d]">{tipo.label}</p>
                          <p className="text-xs text-gray-500">{formatFileList(archivosPorTipo[tipo.key])}</p>
                        </div>
                        <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
                          {archivosPorTipo[tipo.key].length}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-lg bg-[#F9F8F6] border border-[#d6d3c8] p-3 text-sm text-gray-600 leading-6">
                    Este formulario deja preparada la carga documental para su posterior persistencia. Si querés, después puedo conectarlo con backend o almacenamiento real.
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}