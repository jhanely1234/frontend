import React, { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { FileBarChart, Users, UserCog, Calendar } from 'lucide-react'
import { obtenerReporteConsultas, obtenerReporteReservas, obtenerReportePaciente, obtenerReporteDoctor } from "../../api/reportesApi"
import { obtenerTodosPacientes } from "../../api/pacienteapi"
import { obtenerTodosMedicos } from "../../api/medicoapi"

export default function EnhancedPanelReportes() {
  const [tipoReporte, setTipoReporte] = useState('consultas')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [estado, setEstado] = useState('')
  const [pacienteId, setPacienteId] = useState('')
  const [medicoId, setMedicoId] = useState('')
  const [datosReporte, setDatosReporte] = useState(null)
  const [pacientes, setPacientes] = useState([])
  const [medicos, setMedicos] = useState([])
  const [pdfPreview, setPdfPreview] = useState(null)

  useEffect(() => {
    const obtenerPacientes = async () => {
      try {
        const data = await obtenerTodosPacientes()
        setPacientes(data)
      } catch (error) {
        console.error("Error al obtener pacientes:", error)
        alert("No se pudieron cargar los pacientes")
      }
    }

    const obtenerMedicos = async () => {
      try {
        const data = await obtenerTodosMedicos()
        setMedicos(data.medicos)
      } catch (error) {
        console.error("Error al obtener médicos:", error)
        alert("No se pudieron cargar los médicos")
      }
    }

    obtenerPacientes()
    obtenerMedicos()
  }, [])

  useEffect(() => {
    setFechaInicio('')
    setFechaFin('')
    setEstado('')
    setPacienteId('')
    setMedicoId('')
    setDatosReporte(null)
    setPdfPreview(null)
  }, [tipoReporte])

  const manejarGenerarReporte = async () => {
    try {
      let datos
      switch (tipoReporte) {
        case 'consultas':
          datos = await obtenerReporteConsultas(fechaInicio, fechaFin)
          break
        case 'reservas':
          datos = await obtenerReporteReservas(fechaInicio, fechaFin, estado)
          break
        case 'pacientes':
          datos = await obtenerReportePaciente(pacienteId, fechaInicio, fechaFin, estado)
          break
        case 'medicos':
          datos = await obtenerReporteDoctor(medicoId, fechaInicio, fechaFin, estado)
          break
        default:
          throw new Error('Tipo de reporte no válido')
      }
      setDatosReporte(datos)
      generarPDF(datos)
    } catch (error) {
      console.error("Error al generar el reporte:", error)
      alert("Hubo un problema al generar el reporte")
    }
  }

  const generarPDF = (datos) => {
    const doc = new jsPDF({
      format: 'letter',
      unit: 'pt'
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 40
    let y = margin

    // Configuración de estilos
    const colorPrimario = [0, 102, 204]
    const colorSecundario = [41, 128, 185]
    const colorFondo = [236, 240, 241]

    const agregarSeccion = (titulo, datos, columnas) => {
      if (y + 60 > pageHeight - margin) {
        doc.addPage()
        y = margin
      }

      doc.setFillColor(...colorSecundario)
      doc.rect(margin, y, pageWidth - 2 * margin, 30, 'F')
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(255, 255, 255)
      doc.text(titulo, margin + 10, y + 20)
      y += 40

      doc.setTextColor(0, 0, 0)
      doc.autoTable({
        startY: y,
        head: [columnas],
        body: datos,
        theme: 'striped',
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: { 0: { fontStyle: 'bold' } },
        alternateRowStyles: { fillColor: colorFondo },
        headStyles: { fillColor: colorPrimario, textColor: [255, 255, 255] },
        margin: { left: margin, right: margin },
        tableWidth: 'auto'
      })

      y = doc.lastAutoTable.finalY + 20
    }

    // Agregar logo
    const logoUrl = '/logo_mediconsulta_original.png?height=40&width=40'
    doc.addImage(logoUrl, 'PNG', margin, y, 40, 40)

    // Título del reporte
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.setTextColor(...colorPrimario)
    doc.text(`Reporte Medico: ${tipoReporte.charAt(0).toUpperCase() + tipoReporte.slice(1)}`, pageWidth / 2, y + 25, { align: 'center' })

    y += 60

    // Información del reporte
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, margin, y)
    doc.text(`Período: ${fechaInicio} - ${fechaFin}`, margin, y + 15)

    y += 40

    if (tipoReporte === 'consultas' && datos) {
      datos.data?.forEach((consulta, index) => {
        agregarSeccion(`Consulta ${index + 1}`, [
          ['Paciente', consulta.paciente?.nombreCompleto || 'No disponible'],
          ['Médico', consulta.medico?.nombreCompleto || 'No disponible'],
          ['Fecha de Consulta', new Date(consulta.consulta?.fechaConsulta).toLocaleString() || 'No disponible'],
          ['Motivo', consulta.consulta?.motivoConsulta || 'No disponible'],
          ['Diagnóstico', consulta.consulta?.diagnostico || 'No disponible'],
          ['Receta', consulta.consulta?.receta || 'No disponible']
        ], ['Campo', 'Valor'])

        const sv = consulta.consulta?.signosVitales?.[0]
        agregarSeccion('Signos Vitales', [
          ['FC', sv?.Fc || 'N/A'],
          ['FR', sv?.Fr || 'N/A'],
          ['Temperatura', sv?.Temperatura || 'N/A'],
          ['Peso', sv?.peso || 'N/A'],
          ['Talla', sv?.talla || 'N/A']
        ], ['Signo Vital', 'Valor'])
      })

      agregarSeccion("Resumen de Consultas", [
        ['Total Consultas', datos.totals?.totalConsultas || '0'],
        ['Consultas Atendidas', datos.totals?.consultasAtendidas || '0'],
        ['Consultas Pendientes', datos.totals?.consultasPendientes || '0'],
        ['Consultas Canceladas', datos.totals?.consultasCanceladas || '0']
      ], ['Categoría', 'Cantidad'])
    }

    if (tipoReporte === 'reservas' && datos) {
      const reservasData = datos.data.map(reserva => [
        new Date(reserva.reserva.fechaReserva).toLocaleDateString(),
        reserva.reserva.horaInicio,
        reserva.paciente.nombreCompleto,
        reserva.medico.nombreCompleto,
        reserva.medico.especialidad,
        reserva.reserva.estado
      ])

      agregarSeccion("Reservas", reservasData, ['Fecha', 'Hora', 'Paciente', 'Médico', 'Especialidad', 'Estado'])

      agregarSeccion("Resumen de Reservas", [
        ['Total Reservas', datos.totals.totalReservas],
        ['Reservas Atendidas', datos.totals.reservasAtendidas],
        ['Reservas Pendientes', datos.totals.reservasPendientes],
        ['Reservas Canceladas', datos.totals.reservasCanceladas]
      ], ['Categoría', 'Cantidad'])
    }

    if (tipoReporte === 'pacientes' && datos) {
      const { paciente, reservas, consultas, totals } = datos.data

      agregarSeccion("Información del Paciente", [
        ['Nombre', paciente.nombreCompleto],
        ['CI', paciente.ci],
        ['Fecha de Nacimiento', new Date(paciente.fechaNacimiento).toLocaleDateString()]
      ], ['Campo', 'Valor'])

      if (reservas.length > 0) {
        const reservasData = reservas.map(reserva => [
          new Date(reserva.fechaReserva).toLocaleDateString(),
          reserva.horaInicio,
          reserva.especialidad,
          reserva.estado,
          reserva.medico
        ])
        agregarSeccion("Reservas del Paciente", reservasData, ['Fecha', 'Hora', 'Especialidad', 'Estado', 'Médico'])
      }

      if (consultas.length > 0) {
        const consultasData = consultas.map(consulta => [
          new Date(consulta.fechaConsulta).toLocaleString(),
          consulta.motivoConsulta,
          consulta.diagnostico,
          consulta.receta
        ])
        agregarSeccion("Consultas del Paciente", consultasData, ['Fecha', 'Motivo', 'Diagnóstico', 'Receta'])
      }

      agregarSeccion("Resumen del Paciente", [
        ['Total Reservas', totals.totalReservas],
        ['Reservas Atendidas', totals.reservasAtendidas],
        ['Reservas Pendientes', totals.reservasPendientes],
        ['Reservas Canceladas', totals.reservasCanceladas],
        ['Total Consultas', totals.totalConsultas]
      ], ['Categoría', 'Cantidad'])
    }

    if (tipoReporte === 'medicos' && datos) {
      const { medico, reservas, consultas, totals } = datos.data

      agregarSeccion("Información del Médico", [
        ['Nombre', medico.nombreCompleto],
        ['Especialidades', medico.especialidades],
        ['Turno', medico.turno]
      ], ['Campo', 'Valor'])

      if (reservas.length > 0) {
        const reservasData = reservas.map(reserva => [
          new Date(reserva.fechaReserva).toLocaleDateString(),
          reserva.horaInicio,
          reserva.especialidad,
          reserva.estado,
          reserva.paciente
        ])
        agregarSeccion("Reservas del Médico", reservasData, ['Fecha', 'Hora', 'Especialidad', 'Estado', 'Paciente'])
      }

      if (consultas.length > 0) {
        const consultasData = consultas.map(consulta => [
          new Date(consulta.fechaConsulta).toLocaleString(),
          consulta.motivoConsulta,
          consulta.diagnostico,
          consulta.receta,
          consulta.paciente
        ])
        agregarSeccion("Consultas del Médico", consultasData, ['Fecha', 'Motivo', 'Diagnóstico', 'Receta', 'Paciente'])
      }

      agregarSeccion("Resumen del Médico", [
        ['Total Reservas', totals.totalReservas],
        ['Reservas Atendidas', totals.reservasAtendidas],
        ['Reservas Pendientes', totals.reservasPendientes],
        ['Reservas Canceladas', totals.reservasCanceladas],
        ['Total Consultas', totals.totalConsultas]
      ], ['Categoría', 'Cantidad'])
    }

    // Agregar pie de página
    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 20, { align: 'center' })
    }

    const pdfDataUri = doc.output('datauristring')
    setPdfPreview(pdfDataUri)
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-blue-600">Panel de Reportes Médicos</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Generar Reporte</h2>
        <div className="space-y-4">
          <div className="flex space-x-2">
            {['consultas', 'reservas', 'pacientes', 'medicos'].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setTipoReporte(tipo)}
                className={`flex items-center justify-center px-4 py-2 rounded-md ${tipoReporte === tipo
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {tipo === 'consultas' && <FileBarChart className="mr-2 h-4 w-4" />}
                {tipo === 'reservas' && <Calendar className="mr-2 h-4 w-4" />}
                {tipo === 'pacientes' && <Users className="mr-2 h-4 w-4" />}
                {tipo === 'medicos' && <UserCog className="mr-2 h-4 w-4" />}
                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tipoReporte === 'pacientes' && (
              <select
                value={pacienteId}
                onChange={(e) => setPacienteId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Seleccionar Paciente</option>
                {Array.isArray(pacientes) && pacientes.map((paciente) => (
                  <option key={paciente._id} value={paciente._id}>
                    {paciente.name} {paciente.lastname}
                  </option>
                ))}
              </select>
            )}
            {tipoReporte === 'medicos' && (
              <select
                value={medicoId}
                onChange={(e) => setMedicoId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Seleccionar Médico</option>
                {Array.isArray(medicos) && medicos.map((medico) => (
                  <option key={medico._id} value={medico._id}>
                    {medico.name} {medico.lastname}
                  </option>
                ))}
              </select>
            )}
            <input
              type="date"
              placeholder="Fecha de Inicio"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <input
              type="date"
              placeholder="Fecha de Fin"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Todos los estados</option>
              <option value="atendido">Atendido</option>
              <option value="pendiente">Pendiente</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <button
            onClick={manejarGenerarReporte}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Generar Reporte
          </button>
        </div>
      </div>
      {pdfPreview && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Vista Previa del Reporte</h2>
          <iframe src={pdfPreview} className="w-full h-[600px] mb-4" />
          <button
            onClick={() => window.open(pdfPreview)}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300"
          >
            Descargar PDF
          </button>
        </div>
      )}
    </div>
  )
}