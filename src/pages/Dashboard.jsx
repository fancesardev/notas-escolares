import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine
} from 'recharts'

export default function Dashboard({ alumno, materia, setPagina }) {
  const [notas, setNotas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarNotas()
  }, [])

  async function cargarNotas() {
    const { data } = await supabase
      .from('notas')
      .select('*')
      .eq('alumno_id', alumno.id)
      .order('fecha', { ascending: true })
    if (data) setNotas(data)
    setCargando(false)
  }

  const tiposLabel = {
    trabajo_practico: 'TP',
    evaluacion_oral: 'Oral',
    evaluacion_escrita: 'Escrita',
    evaluacion_grupal: 'Grupal',
    participacion: 'Participación'
  }

  const notasBim1 = notas.filter(n => n.bimestre === 1)
  const notasBim2 = notas.filter(n => n.bimestre === 2)

  const promedio1 = notasBim1.length
    ? (notasBim1.reduce((s, n) => s + n.valor, 0) / notasBim1.length).toFixed(2)
    : null
  const promedio2 = notasBim2.length
    ? (notasBim2.reduce((s, n) => s + n.valor, 0) / notasBim2.length).toFixed(2)
    : null
  const notaFinal = promedio1 && promedio2
    ? ((parseFloat(promedio1) + parseFloat(promedio2)) / 2).toFixed(2)
    : promedio1 || promedio2

  function estadoColor(nota) {
    if (!nota) return '#718096'
    const n = parseFloat(nota)
    if (n >= 6) return '#38a169'
    if (n >= 5) return '#d97706'
    return '#e53e3e'
  }

  // Datos para gráfico de evolución
  const datosEvolucion = notas.map((n, i) => ({
    nombre: `${new Date(n.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}`,
    nota: n.valor,
    bimestre: n.bimestre,
    tipo: tiposLabel[n.tipo_evaluacion]
  }))

  // Datos para gráfico por tipo
  const porTipo = Object.entries(
    notas.reduce((acc, n) => {
      const tipo = tiposLabel[n.tipo_evaluacion]
      if (!acc[tipo]) acc[tipo] = { tipo, suma: 0, cant: 0 }
      acc[tipo].suma += n.valor
      acc[tipo].cant += 1
      return acc
    }, {})
  ).map(([, v]) => ({
    tipo: v.tipo,
    promedio: parseFloat((v.suma / v.cant).toFixed(2)),
    cantidad: v.cant
  }))

  // Datos comparativo bimestres
  const datosBimestres = [
    { nombre: '1° Bimestre', promedio: parseFloat(promedio1) || 0, cantidad: notasBim1.length },
    { nombre: '2° Bimestre', promedio: parseFloat(promedio2) || 0, cantidad: notasBim2.length },
  ]

  if (cargando) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div>

  return (
    <div style={estilos.contenedor}>
      {/* Encabezado */}
      <div style={estilos.encabezado}>
        <div>
          <button onClick={() => setPagina('notas')} style={estilos.botonVolver}>
            ← Volver a Notas
          </button>
          <h2 style={estilos.titulo}>Dashboard — {alumno.apellido}, {alumno.nombre}</h2>
          <p style={estilos.subtitulo}>{materia.nombre} — {materia.anio} {materia.division && `Div. ${materia.division}`}</p>
        </div>
      </div>

      {notas.length === 0 ? (
        <p style={estilos.mensaje}>No hay notas cargadas para mostrar el dashboard.</p>
      ) : (
        <>
          {/* Tarjetas resumen */}
          <div style={estilos.tarjetas}>
            <div style={estilos.tarjeta}>
              <p style={estilos.tarjetaLabel}>Total de evaluaciones</p>
              <p style={estilos.tarjetaValor}>{notas.length}</p>
            </div>
            <div style={estilos.tarjeta}>
              <p style={estilos.tarjetaLabel}>Promedio 1° Bimestre</p>
              <p style={{ ...estilos.tarjetaValor, color: estadoColor(promedio1) }}>
                {promedio1 || '—'}
              </p>
            </div>
            <div style={estilos.tarjeta}>
              <p style={estilos.tarjetaLabel}>Promedio 2° Bimestre</p>
              <p style={{ ...estilos.tarjetaValor, color: estadoColor(promedio2) }}>
                {promedio2 || '—'}
              </p>
            </div>
            <div style={{
              ...estilos.tarjeta,
              border: `2px solid ${estadoColor(notaFinal)}`
            }}>
              <p style={estilos.tarjetaLabel}>Nota Final</p>
              <p style={{ ...estilos.tarjetaValor, color: estadoColor(notaFinal) }}>
                {notaFinal || '—'}
              </p>
              <p style={{ fontSize: '12px', color: estadoColor(notaFinal), margin: 0, fontWeight: '600' }}>
                {notaFinal
                  ? parseFloat(notaFinal) >= 6 ? 'Aprobado ✓'
                  : parseFloat(notaFinal) >= 5 ? 'Diciembre'
                  : 'Febrero'
                  : ''}
              </p>
            </div>
          </div>

          {/* Gráfico evolución */}
          <div style={estilos.grafico}>
            <h3 style={estilos.tituloGrafico}>Evolución de notas</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={datosEvolucion} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} ticks={[0,2,4,5,6,8,10]} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [value, 'Nota']}
                  labelFormatter={(label) => `Fecha: ${label}`}
                />
                <ReferenceLine y={6} stroke="#38a169" strokeDasharray="4 4" label={{ value: 'Aprobado', position: 'right', fontSize: 11, fill: '#38a169' }} />
                <ReferenceLine y={5} stroke="#d97706" strokeDasharray="4 4" label={{ value: 'Dic.', position: 'right', fontSize: 11, fill: '#d97706' }} />
                <Line
                  type="monotone"
                  dataKey="nota"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ fill: '#4f46e5', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico por tipo de evaluación */}
          <div style={estilos.filaDos}>
            <div style={estilos.graficoMedio}>
              <h3 style={estilos.tituloGrafico}>Promedio por tipo de evaluación</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={porTipo} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="tipo" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [v, 'Promedio']} />
                  <ReferenceLine y={6} stroke="#38a169" strokeDasharray="4 4" />
                  <Bar dataKey="promedio" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={estilos.graficoMedio}>
              <h3 style={estilos.tituloGrafico}>Comparativo bimestres</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={datosBimestres} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [v, 'Promedio']} />
                  <ReferenceLine y={6} stroke="#38a169" strokeDasharray="4 4" />
                  <Bar dataKey="promedio" radius={[6, 6, 0, 0]}
                    fill="#4f46e5"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla detalle */}
          <div style={estilos.grafico}>
            <h3 style={estilos.tituloGrafico}>Detalle de todas las evaluaciones</h3>
            <table style={estilos.tabla}>
              <thead>
                <tr>
                  <th style={estilos.th}>Fecha</th>
                  <th style={estilos.th}>Bimestre</th>
                  <th style={estilos.th}>Tipo</th>
                  <th style={estilos.th}>Concepto</th>
                  <th style={estilos.th}>Nota</th>
                </tr>
              </thead>
              <tbody>
                {notas.map(n => (
                  <tr key={n.id} style={estilos.tr}>
                    <td style={estilos.td}>{new Date(n.fecha + 'T12:00:00').toLocaleDateString('es-AR')}</td>
                    <td style={estilos.td}>{n.bimestre}° Bimestre</td>
                    <td style={estilos.td}>{tiposLabel[n.tipo_evaluacion]}</td>
                    <td style={estilos.td}>{n.concepto || '—'}</td>
                    <td style={{ ...estilos.td, fontWeight: '700', color: estadoColor(n.valor) }}>
                      {n.valor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

const estilos = {
  contenedor: { padding: '32px', maxWidth: '1000px', margin: '0 auto' },
  encabezado: { marginBottom: '24px' },
  botonVolver: { backgroundColor: 'transparent', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '14px', padding: '0 0 8px 0', fontWeight: '500' },
  titulo: { fontSize: '22px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 4px 0' },
  subtitulo: { color: '#666', fontSize: '14px', margin: 0 },
  tarjetas: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  tarjeta: { backgroundColor: 'white', padding: '20px 24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center', flex: 1, minWidth: '130px', border: '2px solid transparent' },
  tarjetaLabel: { color: '#666', fontSize: '13px', margin: '0 0 8px 0' },
  tarjetaValor: { fontSize: '28px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 4px 0' },
  grafico: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' },
  tituloGrafico: { fontSize: '15px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 20px 0' },
  filaDos: { display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' },
  graficoMedio: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', flex: 1, minWidth: '280px' },
  mensaje: { color: '#666', textAlign: 'center', padding: '40px' },
  tabla: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 14px', textAlign: 'left', backgroundColor: '#f8f9fa', color: '#555', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid #eee' },
  tr: { borderBottom: '1px solid #f5f5f5' },
  td: { padding: '10px 14px', fontSize: '14px', color: '#333' }
}