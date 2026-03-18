import { supabase } from '../supabase'

export default function Navbar({ sesion, paginaActual, setPagina }) {
  return (
    <nav style={estilos.nav}>
      <span style={estilos.logo}>📚 Notas Escolares</span>
      <div style={estilos.links}>
        <button
          onClick={() => setPagina('materias')}
          style={paginaActual === 'materias' ? estilos.linkActivo : estilos.link}
        >
          Materias
        </button>
        <button
          onClick={() => setPagina('libro')}
          style={paginaActual === 'libro' ? estilos.linkActivo : estilos.link}
        >
          Libro de Temas
        </button>
      </div>
      <div style={estilos.usuario}>
        <span style={estilos.email}>{sesion.user.email}</span>
        <button
          onClick={() => supabase.auth.signOut()}
          style={estilos.botonSalir}
        >
          Salir
        </button>
      </div>
    </nav>
  )
}

const estilos = {
  nav: {
    backgroundColor: '#4f46e5',
    padding: '0 24px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logo: {
    color: 'white',
    fontWeight: '700',
    fontSize: '18px'
  },
  links: {
    display: 'flex',
    gap: '8px'
  },
  link: {
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.75)',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px'
  },
  linkActivo: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600'
  },
  usuario: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  email: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '13px'
  },
  botonSalir: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: 'white',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  }
}