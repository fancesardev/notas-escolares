import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function LibroTemas({ sesion }) {
  const [materias, setMaterias] = useState([])
  const [materiaId, setMateriaId] = useState('')
  const [registros, setRegistros] = useState([])
  const [cargando, setCargando] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [horaInicio, setHoraInicio] = useState('')
  const [duracion, setDuracion] = useState(1)
  const [tema, setTema] = useState('')
  const [estado, setEstado] = useState('normal')

  useEffect(() => {
    cargarMaterias()
  }, [])

  useEffect(() => {
    if (materiaId) cargarRegistros()
  }, [materiaId])

  async function cargarMaterias() {
    const { data } = await supabase
      .from('materias')
      .select('*')
      .eq('profesor_id', sesion.user.id)
      .order('nombre')
    if (data) {
      setMaterias(data)
      if (data.length > 0) setMateriaId(data[0].id)
    }
  }

  async function cargarRegistros() {
    setCargando(true)
    const { data } = await supabase
      .from('libro_temas')
      .select('*')
      .eq('materia_id', materiaId)
      .order('fecha', { ascending: false })
      .order('hora_inicio', { ascending: false })
    if (data) setRegistros(data)
    setCargando(false)
  }

  async function agregarRegistro(e) {
    e.preventDefault()
    const { error } = await supabase.from('libro_temas').insert({
      materia_id: materiaId,
      fecha,
      hora_inicio: horaInicio,
      duracion_hs_catedra: parseInt(duracion),
      tema: estado === 'normal' ? tema : null,
      estado
    })
    if (!error) {
      setTema('')
      setHoraInicio('')
      setDuracion(1)
      setEstado('normal')
      setMostrarForm(false)
      cargarRegistros()
    }
  }

  async function eliminarRegistro(id) {
    if (!confirm('¿Eliminar este registro?')) return
    await supabase.from('libro_temas').delete().eq('id', id)
    cargarRegistros()
  }

  const estadoConfig = {
    normal:   { label: 'Clase normal',  color: '#38a169', fondo: '#f0fff4' },
    feriado:  { label: 'Feriado',       color: '#718096', fondo: '#f7fafc' },
    acto:     { label: 'Acto escolar',  color: '#4f46e5', fondo: '#eef2ff' },
    jornada:  { label: 'Jornada',       color: '#d97706', fondo: '#fffbeb' },
    examen:   { label: 'Examen',        color: '#e53e3e', fondo: '#fff5f5' },
    reunion:  { label: 'Reunión',       color: '#0891b2', fondo: '#ecfeff' }
  }

  function calcularHoraFin(horaInicio, cantHsCatedra) {
    if (!horaInicio) return ''
    const [h, m] = horaInicio.split(':').map(Number)
    const totalMinutos = h * 60 + m + cantHsCatedra * 40
    const hFin = Math.floor(totalMinutos / 60).toString().padStart(2, '0')
    const mFin = (totalMinutos % 60).toString().padStart(2, '0')
    return `${hFin}:${mFin}`
  }

  const materiaNombre = materias.find(m => m.id === materiaId)

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.encabezado}>
        <h2 style={estilos.titulo}>Libro de Temas</h2>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          style={estilos.botonAgregar}
          disabled={!materiaId}
        >
          {mostrarForm ? 'Cancelar' : '+ Nueva Entrada'}
        </button>
      </div>

      {/* Selector de materia */}
      <div style={estilos.selectorCaja}>
        <label style={estilos.label}>Materia</label>
        <select
          value={materiaId}
          onChange={e => setMateriaId(e.target.value)}
          style={estilos.select}
        >
          {materias.map(m => (
            <option key={m.id} value={m.id}>
              {m.nombre} — {m.anio} {m.division && `Div. ${m.division}`}
            </option>
          ))}
        </select>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <form onSubmit={agregarRegistro} style={estilos.form}>
          <div style={estilos.fila}>
            <div style={estilos.campo}>
              <label style={estilos.label}>Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                style={estilos.input}
                required
              />
            </div>
            <div style={estilos.campo}>
              <label style={estilos.label}>Hora de inicio</label>
              <input
                type="time"
                value={horaInicio}
                onChange={e => setHoraInicio(e.target.value)}
                style={estilos.input}
                required
              />
            </div>
            <div style={estilos.campo}>
              <label style={estilos.label}>Horas cátedra</label>
              <select
                value={duracion}
                onChange={e => setDuracion(e.target.value)}
                style={estilos.input}
              >
                <option value={1}>1 (40 min)</option>
                <option value={2}>2 (80 min)</option>
                <option value={3}>3 (120 min)</option>
                <option value={4}>4 (160 min)</option>
                <option value={5}>5 (200 min)</option>
              </select>
            </div>
            <div style={estilos.campo}>
              <label style={estilos.label}>Estado</label>
              <select
                value={estado}
                onChange={e => setEstado(e.target.value)}
                style={estilos.input}
              >
                <option value="normal">Clase normal</option>
                <option value="feriado">Feriado</option>
                <option value="acto">Acto escolar</option>
                <option value="jornada">Jornada</option>
                <option value="examen">Examen</option>
                <option value="reunion">Reunión</option>
              </select>
            </div>
          </div>

          {estado === 'normal' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={estilos.label}>Tema de la clase</label>
              <input
                value={tema}
                onChange={e => setTema(e.target.value)}
                style={estilos.input}
                placeholder="Ej: Introducción a los sistemas operativos"
                required
              />
            </div>
          )}

          {horaInicio && (
            <p style={estilos.horario}>
              🕐 Horario: {horaInicio} hs → {calcularHoraFin(horaInicio, duracion)} hs
              ({duracion} hora{duracion > 1 ? 's' : ''} cátedra — {duracion * 40} minutos)
            </p>
          )}

          <button type="submit" style={estilos.botonGuardar}>
            Guardar
          </button>
        </form>
      )}

      {/* Lista de registros */}
      {cargando ? (
        <p style={estilos.mensaje}>Cargando...</p>
      ) : registros.length === 0 ? (
        <p style={estilos.mensaje}>No hay registros para esta materia todavía.</p>
      ) : (
        <div style={estilos.lista}>
          {registros.map(r => {
            const cfg = estadoConfig[r.estado] || estadoConfig.normal
            const horaFin = calcularHoraFin(r.hora_inicio, r.duracion_hs_catedra)
            return (
              <div key={r.id} style={estilos.fila2}>
                <div style={estilos.fechaCol}>
                  <p style={estilos.fechaTexto}>
                    {new Date(r.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
                      weekday: 'short', day: 'numeric', month: 'short'
                    })}
                  </p>
                  <p style={estilos.horaTexto}>
                    {r.hora_inicio?.slice(0, 5)} → {horaFin}
                  </p>
                  <p style={estilos.catedraTexto}>
                    {r.duracion_hs_catedra} hc · {r.duracion_hs_catedra * 40} min
                  </p>
                </div>
                <div style={estilos.contenidoCol}>
                  <span style={{
                    ...estilos.badge,
                    backgroundColor: cfg.fondo,
                    color: cfg.color,
                    border: `1px solid ${cfg.color}`
                  }}>
                    {cfg.label}
                  </span>
                  {r.tema && <p style={estilos.temaTexto}>{r.tema}</p>}
                </div>
                <button
                  onClick={() => eliminarRegistro(r.id)}
                  style={estilos.botonEliminar}
                >
                  Eliminar
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const estilos = {
  contenedor: { padding: '32px', maxWidth: '900px', margin: '0 auto' },
  encabezado: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  titulo: { fontSize: '22px', fontWeight: '600', color: '#1a1a2e' },
  botonAgregar: { backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' },
  selectorCaja: { backgroundColor: 'white', padding: '20px 24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '16px' },
  select: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', minWidth: '300px' },
  form: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  fila: { display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' },
  campo: { flex: 1, minWidth: '150px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333', fontSize: '14px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box' },
  horario: { backgroundColor: '#eef2ff', color: '#4f46e5', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  botonGuardar: { backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' },
  mensaje: { color: '#666', textAlign: 'center', padding: '40px' },
  lista: { display: 'flex', flexDirection: 'column', gap: '10px' },
  fila2: { backgroundColor: 'white', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '20px' },
  fechaCol: { minWidth: '120px' },
  fechaTexto: { fontWeight: '600', color: '#1a1a2e', fontSize: '14px', margin: '0 0 2px 0', textTransform: 'capitalize' },
  horaTexto: { color: '#4f46e5', fontSize: '13px', margin: '0 0 2px 0' },
  catedraTexto: { color: '#999', fontSize: '12px', margin: 0 },
  contenidoCol: { flex: 1 },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginBottom: '6px' },
  temaTexto: { color: '#333', fontSize: '14px', margin: 0 },
  botonEliminar: { backgroundColor: '#fff0f0', color: '#e53e3e', border: '1px solid #fecaca', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }
}