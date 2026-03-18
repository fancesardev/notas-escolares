import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Alumnos({ materia, setPagina, setAlumnoSeleccionado }) {
  const [alumnos, setAlumnos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [dni, setDni] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')

  useEffect(() => {
    cargarAlumnos()
  }, [])

  async function cargarAlumnos() {
    const { data, error } = await supabase
      .from('alumnos')
      .select('*')
      .eq('materia_id', materia.id)
      .order('apellido', { ascending: true })
    if (!error) setAlumnos(data)
    setCargando(false)
  }

  async function agregarAlumno(e) {
    e.preventDefault()
    const { error } = await supabase.from('alumnos').insert({
      nombre,
      apellido,
      dni,
      fecha_nacimiento: fechaNacimiento || null,
      materia_id: materia.id
    })
    if (!error) {
      setNombre('')
      setApellido('')
      setDni('')
      setFechaNacimiento('')
      setMostrarForm(false)
      cargarAlumnos()
    }
  }

  async function eliminarAlumno(id) {
    if (!confirm('¿Seguro que querés eliminar este alumno?')) return
    await supabase.from('alumnos').delete().eq('id', id)
    cargarAlumnos()
  }

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.encabezado}>
        <div>
          <button onClick={() => setPagina('materias')} style={estilos.botonVolver}>
            ← Volver a Materias
          </button>
          <h2 style={estilos.titulo}>{materia.nombre}</h2>
          <p style={estilos.subtitulo}>{materia.anio} {materia.division && `— División ${materia.division}`}</p>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          style={estilos.botonAgregar}
        >
          {mostrarForm ? 'Cancelar' : '+ Nuevo Alumno'}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={agregarAlumno} style={estilos.form}>
          <div style={estilos.fila}>
            <div style={estilos.campo}>
              <label style={estilos.label}>Apellido</label>
              <input
                value={apellido}
                onChange={e => setApellido(e.target.value)}
                style={estilos.input}
                placeholder="Ej: García"
                required
              />
            </div>
            <div style={estilos.campo}>
              <label style={estilos.label}>Nombre</label>
              <input
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                style={estilos.input}
                placeholder="Ej: Lucas"
                required
              />
            </div>
            <div style={estilos.campo}>
              <label style={estilos.label}>DNI</label>
              <input
                value={dni}
                onChange={e => setDni(e.target.value)}
                style={estilos.input}
                placeholder="Ej: 44123456"
              />
            </div>
            <div style={estilos.campo}>
              <label style={estilos.label}>Fecha de nacimiento</label>
              <input
                type="date"
                value={fechaNacimiento}
                onChange={e => setFechaNacimiento(e.target.value)}
                style={estilos.input}
              />
            </div>
          </div>
          <button type="submit" style={estilos.botonGuardar}>
            Guardar Alumno
          </button>
        </form>
      )}

      {cargando ? (
        <p style={estilos.mensaje}>Cargando...</p>
      ) : alumnos.length === 0 ? (
        <p style={estilos.mensaje}>Todavía no hay alumnos en esta materia.</p>
      ) : (
        <table style={estilos.tabla}>
          <thead>
            <tr>
              <th style={estilos.th}>Apellido y Nombre</th>
              <th style={estilos.th}>DNI</th>
              <th style={estilos.th}>Fecha de Nac.</th>
              <th style={estilos.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map(a => (
              <tr key={a.id} style={estilos.tr}>
                <td style={estilos.td}>{a.apellido}, {a.nombre}</td>
                <td style={estilos.td}>{a.dni || '—'}</td>
                <td style={estilos.td}>
                  {a.fecha_nacimiento
                    ? new Date(a.fecha_nacimiento).toLocaleDateString('es-AR')
                    : '—'}
                </td>
                <td style={estilos.td}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setAlumnoSeleccionado(a)
                        setPagina('notas')
                      }}
                      style={estilos.botonNotas}
                    >
                      Ver notas
                    </button>
                    <button
                      onClick={() => eliminarAlumno(a.id)}
                      style={estilos.botonEliminar}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const estilos = {
  contenedor: { padding: '32px', maxWidth: '960px', margin: '0 auto' },
  encabezado: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  botonVolver: { backgroundColor: 'transparent', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '14px', padding: '0 0 8px 0', fontWeight: '500' },
  titulo: { fontSize: '22px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 4px 0' },
  subtitulo: { color: '#666', fontSize: '14px', margin: 0 },
  botonAgregar: { backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' },
  form: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  fila: { display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' },
  campo: { flex: 1, minWidth: '160px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333', fontSize: '14px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box' },
  botonGuardar: { backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' },
  mensaje: { color: '#666', textAlign: 'center', padding: '40px' },
  tabla: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  th: { padding: '14px 20px', textAlign: 'left', backgroundColor: '#f8f9fa', color: '#555', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid #eee' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '14px 20px', fontSize: '15px', color: '#333' },
  botonNotas: { backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  botonEliminar: { backgroundColor: '#fff0f0', color: '#e53e3e', border: '1px solid #fecaca', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }
}