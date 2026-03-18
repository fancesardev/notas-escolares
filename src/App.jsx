import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import Materias from './pages/Materias'
import Alumnos from './pages/Alumnos'
import Notas from './pages/Notas'
import LibroTemas from './pages/LibroTemas'
import Dashboard from './pages/Dashboard'

function App() {
  const [sesion, setSesion] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [pagina, setPagina] = useState('materias')
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null)
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session)
      setCargando(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSesion(session)
    )
    return () => subscription.unsubscribe()
  }, [])

  if (cargando) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div>
  if (!sesion) return <Login />

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Navbar sesion={sesion} paginaActual={pagina} setPagina={setPagina} />
      {pagina === 'materias' && (
        <Materias sesion={sesion} setPagina={setPagina} setMateriaSeleccionada={setMateriaSeleccionada} />
      )}
      {pagina === 'alumnos' && materiaSeleccionada && (
        <Alumnos materia={materiaSeleccionada} setPagina={setPagina} setAlumnoSeleccionado={setAlumnoSeleccionado} />
      )}
      {pagina === 'notas' && alumnoSeleccionado && materiaSeleccionada && (
        <Notas alumno={alumnoSeleccionado} materia={materiaSeleccionada} setPagina={setPagina} />
      )}
      {pagina === 'dashboard' && alumnoSeleccionado && materiaSeleccionada && (
        <Dashboard alumno={alumnoSeleccionado} materia={materiaSeleccionada} setPagina={setPagina} />
      )}
      {pagina === 'libro' && (
        <LibroTemas sesion={sesion} />
      )}
    </div>
  )
}

export default App