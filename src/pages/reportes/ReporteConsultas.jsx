'use client'

import React, { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import { FileBarChart, Users, UserCog, Calendar } from 'lucide-react'
import { obtenerReporteConsultas, obtenerReporteReservas, obtenerReportePaciente, obtenerReporteDoctor } from "../../api/reportesApi"
import { obtenerTodosPacientes } from "../../api/pacienteapi"
import { obtenerTodosMedicos } from "../../api/medicoapi"

export default function PanelReportes() {
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
    const doc = new jsPDF()

    const checkNewPage = (y) => {
      if (y >= 280) {
        doc.addPage()
        return 20
      }
      return y
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(24)
    doc.setTextColor(0, 102, 204)
    doc.text(`Reporte de ${tipoReporte.charAt(0).toUpperCase() + tipoReporte.slice(1)}`, 105, 20, { align: 'center' })

    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)

    let y = 40

    if (tipoReporte === 'consultas' && datos) {
      datos.data.forEach((consulta, index) => {
        y = checkNewPage(y)
        doc.setFont("helvetica", "bold")
        doc.text(`Consulta ${index + 1}:`, 20, y)
        y += 10
        doc.setFont("helvetica", "normal")

        y = checkNewPage(y)
        doc.text(`Paciente: ${consulta.paciente.nombreCompleto}`, 20, y)
        y += 10

        y = checkNewPage(y)
        doc.text(`Médico: ${consulta.medico.nombreCompleto}`, 20, y)
        y += 10

        y = checkNewPage(y)
        doc.text(`Fecha de Consulta: ${new Date(consulta.consulta.fechaConsulta).toLocaleString()}`, 20, y)
        y += 10

        y = checkNewPage(y)
        doc.text(`Motivo: ${consulta.consulta.motivoConsulta}`, 20, y)
        y += 10

        y = checkNewPage(y)
        doc.text(`Diagnóstico: ${consulta.consulta.diagnostico}`, 20, y)
        y += 10

        y = checkNewPage(y)
        doc.text(`Receta: ${consulta.consulta.receta}`, 20, y)
        y += 10

        const sv = consulta.consulta.signosVitales[0]
        y = checkNewPage(y)
        doc.text(`Signos Vitales:`, 20, y)
        y += 10
        doc.text(`FC: ${sv.Fc}, FR: ${sv.Fr}, Temperatura: ${sv.Temperatura}, Peso: ${sv.peso}, Talla: ${sv.talla}`, 30, y)
        y += 20
      })

      y = checkNewPage(y)
      doc.setFont("helvetica", "bold")
      doc.text("Totales:", 20, y)
      y += 10
      doc.setFont("helvetica", "normal")
      doc.text(`Total Consultas: ${datos.totals.totalConsultas}`, 30, y)
      y += 10
      doc.text(`Consultas Atendidas: ${datos.totals.consultasAtendidas}`, 30, y)
      y += 10
      doc.text(`Consultas Pendientes: ${datos.totals.consultasPendientes}`, 30, y)
      y += 10
      doc.text(`Consultas Canceladas: ${datos.totals.consultasCanceladas}`, 30, y)
    }

    if (tipoReporte === 'reservas' && datos) {
      datos.data.forEach((reserva, index) => {
        y = checkNewPage(y)
        doc.setFont("helvetica", "bold")
        doc.text(`Reserva ${index + 1}:`, 20, y)
        y += 10
        doc.setFont("helvetica", "normal")

        y = checkNewPage(y)
        doc.text(`Paciente: ${reserva.paciente.nombreCompleto} (CI: ${reserva.paciente.ci})`, 20, y)
        y += 10

        y = checkNewPage(y)
        doc.text(`Médico: ${reserva.medico.nombreCompleto} (${reserva.medico.especialidad})`, 20, y)
        y += 10

        y = checkNewPage(y)
        doc.text(`Fecha de Reserva: ${new Date(reserva.reserva.fechaReserva).toLocaleDateString()}`, 20, y)
        y += 10

        y = checkNewPage(y)
        doc.text(`Hora: ${reserva.reserva.horaInicio} - ${reserva.reserva.horaFin}`, 20, y)
        y += 10

        y = checkNewPage(y)
        doc.text(`Estado: ${reserva.reserva.estado}`, 20, y)
        y += 20
      })

      y = checkNewPage(y)
      doc.setFont("helvetica", "bold")
      doc.text("Totales:", 20, y)
      y += 10
      doc.setFont("helvetica", "normal")
      doc.text(`Total Reservas: ${datos.totals.totalReservas}`, 30, y)
      y += 10
      doc.text(`Reservas Atendidas: ${datos.totals.reservasAtendidas}`, 30, y)
      y += 10
      doc.text(`Reservas Pendientes: ${datos.totals.reservasPendientes}`, 30, y)
      y += 10
      doc.text(`Reservas Canceladas: ${datos.totals.reservasCanceladas}`, 30, y)
    }

    if (tipoReporte === 'pacientes' && datos) {
      const { paciente, reservas, consultas, totals } = datos.data

      y = checkNewPage(y)
      doc.setFont("helvetica", "bold")
      doc.text("Información del Paciente:", 20, y)
      y += 10
      doc.setFont("helvetica", "normal")
      doc.text(`Nombre: ${paciente.nombreCompleto}`, 30, y)
      y += 10
      doc.text(`CI: ${paciente.ci}`, 30, y)
      y += 10
      doc.text(`Fecha de Nacimiento: ${new Date(paciente.fechaNacimiento).toLocaleDateString()}`, 30, y)
      y += 20

      if (reservas.length > 0) {
        y = checkNewPage(y)
        doc.setFont("helvetica", "bold")
        doc.text("Reservas:", 20, y)
        y += 10
        doc.setFont("helvetica", "normal")

        reservas.forEach((reserva, index) => {
          y = checkNewPage(y)
          doc.text(`Reserva ${index + 1}:`, 30, y)
          y += 10
          doc.text(`Fecha: ${new Date(reserva.fechaReserva).toLocaleDateString()}`, 40, y)
          y += 10
          doc.text(`Hora: ${reserva.horaInicio}`, 40, y)
          y += 10
          doc.text(`Especialidad: ${reserva.especialidad}`, 40, y)
          y += 10
          doc.text(`Estado: ${reserva.estado}`, 40, y)
          y += 10
          doc.text(`Médico: ${reserva.medico}`, 40, y)
          y += 15
        })
      }

      if (consultas.length > 0) {
        y = checkNewPage(y)
        doc.setFont("helvetica", "bold")
        doc.text("Consultas:", 20, y)
        y += 10
        doc.setFont("helvetica", "normal")

        consultas.forEach((consulta, index) => {
          y = checkNewPage(y)
          doc.text(`Consulta ${index + 1}:`, 30, y)
          y += 10
          doc.text(`Fecha: ${new Date(consulta.fechaConsulta).toLocaleString()}`, 40, y)
          y += 10
          doc.text(`Motivo: ${consulta.motivoConsulta}`, 40, y)
          y += 10
          doc.text(`Diagnóstico: ${consulta.diagnostico}`, 40, y)
          y += 10
          doc.text(`Receta: ${consulta.receta}`, 40, y)
          y += 15
        })
      }

      y = checkNewPage(y)
      doc.setFont("helvetica", "bold")
      doc.text("Totales:", 20, y)
      y += 10
      doc.setFont("helvetica", "normal")
      doc.text(`Total Reservas: ${totals.totalReservas}`, 30, y)
      y += 10
      doc.text(`Reservas Atendidas: ${totals.reservasAtendidas}`, 30, y)
      y += 10
      doc.text(`Reservas Pendientes: ${totals.reservasPendientes}`, 30, y)
      y += 10
      doc.text(`Reservas Canceladas: ${totals.reservasCanceladas}`, 30, y)
      y += 10
      doc.text(`Total Consultas: ${totals.totalConsultas}`, 30, y)
    }

    if (tipoReporte === 'medicos' && datos) {
      const { medico, reservas, consultas, totals } = datos.data

      y = checkNewPage(y)
      doc.setFont("helvetica", "bold")
      doc.text("Información del Médico:", 20, y)
      y += 10
      doc.setFont("helvetica", "normal")
      doc.text(`Nombre: ${medico.nombreCompleto}`, 30, y)
      y += 10
      doc.text(`Especialidades: ${medico.especialidades}`, 30, y)
      y += 10
      doc.text(`Turno: ${medico.turno}`, 30, y)
      y += 20

      if (reservas.length > 0) {
        y = checkNewPage(y)
        doc.setFont("helvetica", "bold")
        doc.text("Reservas:", 20, y)
        y += 10
        doc.setFont("helvetica", "normal")

        reservas.forEach((reserva, index) => {
          y = checkNewPage(y)
          doc.text(`Reserva ${index + 1}:`, 30, y)
          y += 10
          doc.text(`Fecha: ${new Date(reserva.fechaReserva).toLocaleDateString()}`, 40, y)
          y += 10
          doc.text(`Hora: ${reserva.horaInicio}`, 40, y)
          y += 10
          doc.text(`Especialidad: ${reserva.especialidad}`, 40, y)
          y += 10
          doc.text(`Estado: ${reserva.estado}`, 40, y)
          y += 10
          doc.text(`Paciente: ${reserva.paciente}`, 40, y)
          y += 15
        })
      }

      if (consultas.length > 0) {
        y = checkNewPage(y)
        doc.setFont("helvetica", "bold")
        doc.text("Consultas:", 20, y)
        y += 10
        doc.setFont("helvetica", "normal")

        consultas.forEach((consulta, index) => {
          y = checkNewPage(y)
          doc.text(`Consulta ${index + 1}:`, 30, y)
          y += 10
          doc.text(`Fecha: ${new Date(consulta.fechaConsulta).toLocaleString()}`, 40, y)
          y += 10
          doc.text(`Motivo: ${consulta.motivoConsulta}`, 40, y)
          y += 10
          doc.text(`Diagnóstico: ${consulta.diagnostico}`, 40, y)
          y += 10
          doc.text(`Receta: ${consulta.receta}`, 40, y)
          y += 10
          doc.text(`Paciente: ${consulta.paciente}`, 40, y)
          y += 15
        })
      }

      y = checkNewPage(y)
      doc.setFont("helvetica", "bold")
      doc.text("Totales:", 20, y)
      y += 10
      doc.setFont("helvetica", "normal")
      doc.text(`Total Reservas: ${totals.totalReservas}`, 30, y)
      y += 10
      doc.text(`Reservas Atendidas: ${totals.reservasAtendidas}`, 30, y)
      y += 10
      doc.text(`Reservas Pendientes: ${totals.reservasPendientes}`, 30, y)
      y += 10
      doc.text(`Reservas Canceladas: ${totals.reservasCanceladas}`, 30, y)
      y += 10
      doc.text(`Total Consultas: ${totals.totalConsultas}`, 30, y)
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