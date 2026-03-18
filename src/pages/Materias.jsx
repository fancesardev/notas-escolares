import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Materias({ sesion, setPagina, setMateriaSeleccionada }) {
  const [materias, setMaterias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [anio, setAnio] = useState('')
  const [division, setDivision] = useState('')

  useEffect(() => {
    cargarMaterias()
  }, [])

  async function cargarMaterias() {
    const { data, error } = await supabase
      .from('materias')
      .select('*')
      .eq('profesor_id', sesion.user.id)
      .order('created_at', { ascending: false })

    if (!error) setMaterias(data)
    setCargando(false)
  }

  async function agregarMateria(e) {
    e.preventDefault()
    const { error } = await supabase.from('materias').insert({
      nombre,
      anio,
      division,
      profesor_id: sesion.user.id
    })
    if (!error) {
      setNombre('')
      setAnio('')
      setDivision('')
      setMostrarForm(false)
      cargarMaterias()
    }
  }

  async function eliminarMateria(id) {
    if (!confirm('¿Seguro que querés eliminar esta materia?')) return
    await supabase.from('materias').delete().eq('id', id)
    cargarMaterias()
  }

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.encabezado}>
        <h2 style={estilos.titulo}>Mis Materias</h2>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          style={estilos.botonAgregar}
        >
          {mostrarForm ? 'Cancelar' : '+ Nueva Materia'}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={agregarMateria} style={estilos.form}>
          <div style={estilos.fila}>
            <div style={estilos.campo}>
              <label style={estilos.label}>Nombre de la materia</label>
              <input
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                style={estilos.input}
                placeholder="Ej: Matemática"
                required
              />
            </div>
            <div style={estilos.campo}>
              <label style={estilos.label}>Año</label>
              <input
                value={anio}
                onChange={e => setAnio(e.target.value)}
                style={estilos.input}
                placeholder="Ej: 3°"
              />
            </div>
            <div style={estilos.campo}>
              <label style={estilos.label}>División</label>
              <input
                value={division}
                onChange={e => setDivision(e.target.value)}
                style={estilos.input}
                placeholder="Ej: A"
              />
            </div>
          </div>
          <button type="submit" style={estilos.botonGuardar}>
            Guardar Materia
          </button>
        </form>
      )}

      {cargando ? (
        <p style={estilos.mensaje}>Cargando...</p>
      ) : materias.length === 0 ? (
        <p style={estilos.mensaje}>Todavía no tenés materias cargadas.</p>
      ) : (
        <div style={estilos.grilla}>
          {materias.map(m => (
            <div key={m.id} style={estilos.tarjeta}>
              <div style={estilos.tarjetaInfo}>
                <h3 style={estilos.tarjetaNombre}>{m.nombre}</h3>
                <p style={estilos.tarjetaDetalle}>
                  {m.anio} {m.division && `— División ${m.division}`}
                </p>
              </div>
              <div style={estilos.tarjetaAcciones}>
                <button
                  onClick={() => {
                    setMateriaSeleccionada(m)
                    setPagina('alumnos')
                  }}
                  style={estilos.botonVer}
                >
                  Ver alumnos
                </button>
                <button
                  onClick={() => eliminarMateria(m.id)}
                  style={estilos.botonEliminar}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
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
  form: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  fila: { display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' },
  campo: { flex: 1, minWidth: '160px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333', fontSize: '14px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box' },
  botonGuardar: { backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' },
  mensaje: { color: '#666', textAlign: 'center', padding: '40px' },
  grilla: { display: 'flex', flexDirection: 'column', gap: '12px' },
  tarjeta: { backgroundColor: 'white', padding: '20px 24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  tarjetaInfo: {},
  tarjetaNombre: { fontSize: '17px', fontWeight: '600', color: '#1a1a2e', marginBottom: '4px' },
  tarjetaDetalle: { color: '#666', fontSize: '14px' },
  tarjetaAcciones: { display: 'flex', gap: '8px' },
  botonVer: { backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  botonEliminar: { backgroundColor: '#fff0f0', color: '#e53e3e', border: '1px solid #fecaca', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }
}