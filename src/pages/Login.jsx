import { useState } from 'react'
import { supabase } from '../supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setCargando(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError('Email o contraseña incorrectos')
    }
    setCargando(false)
  }

  return (
    <div style={estilos.fondo}>
      <div style={estilos.caja}>
        <h1 style={estilos.titulo}>📚 Notas Escolares</h1>
        <p style={estilos.subtitulo}>Ingresá con tu cuenta</p>

        <form onSubmit={handleLogin}>
          <div style={estilos.campo}>
            <label style={estilos.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={estilos.input}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={estilos.input}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p style={estilos.error}>{error}</p>}

          <button
            type="submit"
            style={estilos.boton}
            disabled={cargando}
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

const estilos = {
  fondo: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  caja: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  titulo: {
    textAlign: 'center',
    fontSize: '24px',
    marginBottom: '8px',
    color: '#1a1a2e'
  },
  subtitulo: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '28px'
  },
  campo: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '500',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '15px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  boton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px'
  },
  error: {
    color: '#e53e3e',
    fontSize: '14px',
    marginBottom: '12px'
  }
}