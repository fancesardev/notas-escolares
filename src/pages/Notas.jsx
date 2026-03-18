import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Notas({ alumno, materia, setPagina }) {
  const [notas, setNotas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [bimestre, setBimestre] = useState(1)
  const [valor, setValor] = useState('')
  const [tipo, setTipo] = useState('trabajo_practico')
  const [concepto, setConcepto] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [notaDiciembre, setNotaDiciembre] = useState('')
  const [notaFebrero, setNotaFebrero] = useState('')
  const [recuperatorio, setRecuperatorio] = useState(null)
  const [guardandoRec, setGuardandoRec] = useState(false)

  useEffect(() => {
    cargarNotas()
    cargarRecuperatorio()
  }, [])

  async function cargarNotas() {
    const { data, error } = await supabase
      .from('notas')
      .select('*')
      .eq('alumno_id', alumno.id)
      .order('fecha', { ascending: false })
    if (!error) setNotas(data)
    setCargando(false)
  }

  async function agregarNota(e) {
    e.preventDefault()
    const { error } = await supabase.from('notas').insert({
      alumno_id: alumno.id,
      valor: parseFloat(valor),
      tipo_evaluacion: tipo,
      concepto,
      bimestre: parseInt(bimestre),
      fecha,
      observaciones
    })
    if (!error) {
      setValor('')
      setConcepto('')
      setObservaciones('')
      setMostrarForm(false)
      cargarNotas()
    }
  }

  async function eliminarNota(id) {
    if (!confirm('¿Eliminar esta nota?')) return
    await supabase.from('notas').delete().eq('id', id)
    cargarNotas()
  }

  const notasBimestre1 = notas.filter(n => n.bimestre === 1)
  const notasBimestre2 = notas.filter(n => n.bimestre === 2)

  const promedio1 = notasBimestre1.length
    ? (notasBimestre1.reduce((s, n) => s + n.valor, 0) / notasBimestre1.length).toFixed(2)
    : null
  const promedio2 = notasBimestre2.length
    ? (notasBimestre2.reduce((s, n) => s + n.valor, 0) / notasBimestre2.length).toFixed(2)
    : null
  const notaFinal = promedio1 && promedio2
    ? ((parseFloat(promedio1) + parseFloat(promedio2)) / 2).toFixed(2)
    : promedio1 || promedio2

  function estadoFinal(nota) {
    if (!nota) return null
    const n = parseFloat(nota)
    if (n >= 6) return { texto: 'Aprobado ✓', color: '#38a169', fondo: '#f0fff4' }
    if (n >= 5) return { texto: 'Va a Diciembre', color: '#d97706', fondo: '#fffbeb' }
    return { texto: 'Va a Febrero', color: '#e53e3e', fondo: '#fff5f5' }
  }

  const estado = estadoFinal(notaFinal)

  const tiposLabel = {
    trabajo_practico: 'Trabajo Práctico',
    evaluacion_oral: 'Evaluación Oral',
    evaluacion_escrita: 'Evaluación Escrita',
    evaluacion_grupal: 'Evaluación Grupal',
    participacion: 'Participación'
  }

  async function guardarRecuperatorio(tipo) {
  setGuardandoRec(true)
  const nota = tipo === 'diciembre' ? parseFloat(notaDiciembre) : parseFloat(notaFebrero)
  const aprobado = nota >= 6

  const { data: existing } = await supabase
    .from('bimestres')
    .select('*')
    .eq('alumno_id', alumno.id)
    .single()

  if (existing) {
    await supabase.from('bimestres').update({
      nota_final: parseFloat(notaFinal),
      estado_final: estado?.texto.includes('Diciembre') ? 'diciembre' : 'febrero',
      nota_diciembre: tipo === 'diciembre' ? nota : existing.nota_diciembre,
      nota_febrero: tipo === 'febrero' ? nota : existing.nota_febrero,
      estado_recuperatorio: aprobado ? 'aprobado' : 'desaprobado'
    }).eq('alumno_id', alumno.id)
  } else {
    await supabase.from('bimestres').insert({
      alumno_id: alumno.id,
      numero: 2,
      nota_final: parseFloat(notaFinal),
      estado_final: estado?.texto.includes('Diciembre') ? 'diciembre' : 'febrero',
      nota_diciembre: tipo === 'diciembre' ? nota : null,
      nota_febrero: tipo === 'febrero' ? nota : null,
      estado_recuperatorio: aprobado ? 'aprobado' : 'desaprobado'
    })
  }

  await cargarRecuperatorio()
  setGuardandoRec(false)
}

async function cargarRecuperatorio() {
  const { data } = await supabase
    .from('bimestres')
    .select('*')
    .eq('alumno_id', alumno.id)
    .single()
  if (data) setRecuperatorio(data)
}

  return (
    <div style={estilos.contenedor}>

      {/* Encabezado */}
      <div style={estilos.encabezado}>
        <div>
          <button onClick={() => setPagina('alumnos')} style={estilos.botonVolver}>
            ← Volver a Alumnos
          </button>
          <h2 style={estilos.titulo}>
            {alumno.apellido}, {alumno.nombre}
          </h2>
          <p style={estilos.subtitulo}>{materia.nombre} — {materia.anio} {materia.division && `Div. ${materia.division}`}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setPagina('dashboard')}
            style={{ ...estilos.botonAgregar, backgroundColor: '#0891b2' }}
          >
            📊 Ver Dashboard
          </button>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            style={estilos.botonAgregar}
          >
            {mostrarForm ? 'Cancelar' : '+ Agregar Nota'}
          </button>
        </div>
      </div>

      {/* Resumen de notas */}
      <div style={estilos.resumen}>
        <div style={estilos.tarjetaResumen}>
          <p style={estilos.resumenLabel}>Promedio 1° Bimestre</p>
          <p style={estilos.resumenValor}>{promedio1 || '—'}</p>
        </div>
        <div style={estilos.tarjetaResumen}>
          <p style={estilos.resumenLabel}>Promedio 2° Bimestre</p>
          <p style={estilos.resumenValor}>{promedio2 || '—'}</p>
        </div>
        <div style={estilos.tarjetaResumen}>
          <p style={estilos.resumenLabel}>Nota Final</p>
          <p style={estilos.resumenValor}>{notaFinal || '—'}</p>
        </div>
        {estado && (
          <div style={{ ...estilos.tarjetaEstado, backgroundColor: estado.fondo, borderColor: estado.color }}>
            <p style={{ ...estilos.resumenEstado, color: estado.color }}>{estado.texto}</p>
          </div>
        )}
      </div>

      {/* Sección recuperatorios */}
{notaFinal && parseFloat(notaFinal) < 6 && (
  <div style={estilos.seccionRec}>
    <h3 style={estilos.tituloRec}>
      {parseFloat(notaFinal) >= 5 ? '📅 Diciembre' : '📅 Febrero'}
    </h3>
    <p style={estilos.textoRec}>
      {parseFloat(notaFinal) >= 5
        ? 'La nota final es menor a 6. El alumno debe rendir en Diciembre.'
        : 'La nota final es menor a 5. El alumno debe rendir en Febrero.'}
    </p>

    {recuperatorio?.estado_recuperatorio ? (
      <div style={{
        ...estilos.estadoRec,
        backgroundColor: recuperatorio.estado_recuperatorio === 'aprobado' ? '#f0fff4' : '#fff5f5',
        borderColor: recuperatorio.estado_recuperatorio === 'aprobado' ? '#38a169' : '#e53e3e',
        color: recuperatorio.estado_recuperatorio === 'aprobado' ? '#38a169' : '#e53e3e'
      }}>
        {recuperatorio.estado_recuperatorio === 'aprobado'
          ? `✓ Aprobó el recuperatorio con ${recuperatorio.nota_diciembre || recuperatorio.nota_febrero}`
          : `✗ No aprobó el recuperatorio con ${recuperatorio.nota_diciembre || recuperatorio.nota_febrero}`}
      </div>
    ) : (
      <div style={estilos.formRec}>
        <input
          type="number"
          min="1" max="10" step="0.1"
          placeholder="Nota del recuperatorio (1-10)"
          value={parseFloat(notaFinal) >= 5 ? notaDiciembre : notaFebrero}
          onChange={e => parseFloat(notaFinal) >= 5
            ? setNotaDiciembre(e.target.value)
            : setNotaFebrero(e.target.value)}
          style={{ ...estilos.input, maxWidth: '260px' }}
        />
        <button
          onClick={() => guardarRecuperatorio(parseFloat(notaFinal) >= 5 ? 'diciembre' : 'febrero')}
          disabled={guardandoRec}
          style={estilos.botonRec}
        >
          {guardandoRec ? 'Guardando...' : 'Guardar nota recuperatorio'}
        </button>
      </div>
    )}
  </div>
)}

      {/* Formulario nueva nota */}
      {mostrarForm && (
        <form onSubmit={agregarNota} style={estilos.form}>
          <div style={estilos.fila}>
            <div style={estilos.campo}>
              <label style={estilos.label}>Bimestre</label>
              <select value={bimestre} onChange={e => setBimestre(e.target.value)} style={estilos.input}>
                <option value={1}>1° Bimestre</option>
                <option value={2}>2° Bimestre</option>
              </select>
            </div>
            <div style={estilos.campo}>
              <label style={estilos.label}>Nota (1 al 10)</label>
              <input
                type="number"
                min="1" max="10" step="0.1"
                value={valor}
                onChange={e => setValor(e.target.value)}
                style={estilos.input}
                placeholder="Ej: 8"
                required
              />
            </div>
            <div style={estilos.campo}>
              <label style={estilos.label}>Tipo de evaluación</label>
              <select value={tipo} onChange={e => setTipo(e.target.value)} style={estilos.input}>
                <option value="trabajo_practico">Trabajo Práctico</option>
                <option value="evaluacion_oral">Evaluación Oral</option>
                <option value="evaluacion_escrita">Evaluación Escrita</option>
                <option value="evaluacion_grupal">Evaluación Grupal</option>
                <option value="participacion">Participación</option>
              </select>
            </div>
            <div style={estilos.campo}>
              <label style={estilos.label}>Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                style={estilos.input}
              />
            </div>
          </div>
          <div style={estilos.fila}>
            <div style={{ ...estilos.campo, flex: 2 }}>
              <label style={estilos.label}>Concepto</label>
              <input
                value={concepto}
                onChange={e => setConcepto(e.target.value)}
                style={estilos.input}
                placeholder="Ej: Unidad 2 — Sistemas operativos"
              />
            </div>
            <div style={{ ...estilos.campo, flex: 3 }}>
              <label style={estilos.label}>Observaciones</label>
              <input
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
                style={estilos.input}
                placeholder="Ej: Muy buena participación, demostró comprensión del tema"
              />
            </div>
          </div>
          <button type="submit" style={estilos.botonGuardar}>
            Guardar Nota
          </button>
        </form>
      )}

      {/* Notas por bimestre */}
      {cargando ? (
        <p style={estilos.mensaje}>Cargando...</p>
      ) : notas.length === 0 ? (
        <p style={estilos.mensaje}>Todavía no hay notas cargadas para este alumno.</p>
      ) : (
        [1, 2].map(b => {
          const notasB = notas.filter(n => n.bimestre === b)
          if (notasB.length === 0) return null
          return (
            <div key={b} style={estilos.seccion}>
              <h3 style={estilos.tituloSeccion}>{b}° Bimestre</h3>
              <table style={estilos.tabla}>
                <thead>
                  <tr>
                    <th style={estilos.th}>Fecha</th>
                    <th style={estilos.th}>Tipo</th>
                    <th style={estilos.th}>Concepto</th>
                    <th style={estilos.th}>Nota</th>
                    <th style={estilos.th}>Observaciones</th>
                    <th style={estilos.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {notasB.map(n => (
                    <tr key={n.id} style={estilos.tr}>
                      <td style={estilos.td}>
                        {new Date(n.fecha).toLocaleDateString('es-AR')}
                      </td>
                      <td style={estilos.td}>{tiposLabel[n.tipo_evaluacion]}</td>
                      <td style={estilos.td}>{n.concepto || '—'}</td>
                      <td style={{ ...estilos.td, fontWeight: '700', fontSize: '17px', color: '#4f46e5' }}>
                        {n.valor}
                      </td>
                      <td style={{ ...estilos.td, color: '#666', fontSize: '13px' }}>
                        {n.observaciones || '—'}
                      </td>
                      <td style={estilos.td}>
                        <button
                          onClick={() => eliminarNota(n.id)}
                          style={estilos.botonEliminar}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })
      )}
    </div>
  )
}

const estilos = {
  contenedor: { padding: '32px', maxWidth: '1000px', margin: '0 auto' },
  encabezado: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  botonVolver: { backgroundColor: 'transparent', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '14px', padding: '0 0 8px 0', fontWeight: '500' },
  titulo: { fontSize: '22px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 4px 0' },
  subtitulo: { color: '#666', fontSize: '14px', margin: 0 },
  botonAgregar: { backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' },
  resumen: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  tarjetaResumen: { backgroundColor: 'white', padding: '20px 28px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center', minWidth: '140px' },
  tarjetaEstado: { padding: '20px 28px', borderRadius: '12px', border: '2px solid', textAlign: 'center', minWidth: '140px' },
  resumenLabel: { color: '#666', fontSize: '13px', margin: '0 0 8px 0' },
  resumenValor: { fontSize: '28px', fontWeight: '700', color: '#1a1a2e', margin: 0 },
  resumenEstado: { fontSize: '16px', fontWeight: '700', margin: 0 },
  form: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  fila: { display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' },
  campo: { flex: 1, minWidth: '160px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333', fontSize: '14px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box' },
  botonGuardar: { backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' },
  mensaje: { color: '#666', textAlign: 'center', padding: '40px' },
  seccion: { marginBottom: '32px' },
  tituloSeccion: { fontSize: '16px', fontWeight: '600', color: '#4f46e5', marginBottom: '12px' },
  tabla: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  th: { padding: '12px 16px', textAlign: 'left', backgroundColor: '#f8f9fa', color: '#555', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid #eee' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#333' },
  botonEliminar: { backgroundColor: '#fff0f0', color: '#e53e3e', border: '1px solid #fecaca', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  seccionRec: { backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
  tituloRec: { fontSize: '17px', fontWeight: '600', color: '#92400e', margin: '0 0 8px 0' },
  textoRec: { color: '#78350f', fontSize: '14px', margin: '0 0 16px 0' },
  formRec: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
  botonRec: { backgroundColor: '#d97706', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' },
  estadoRec: { padding: '14px 20px', borderRadius: '8px', border: '2px solid', fontWeight: '600', fontSize: '15px', display: 'inline-block' },
}