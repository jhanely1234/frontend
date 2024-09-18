import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { PieChart, BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { FileBarChart, Users, UserCog, Calendar } from 'lucide-react';
import { obtenerReporteConsultas, obtenerReporteReservas, obtenerReportePaciente, obtenerReporteDoctor } from "../../api/reportesApi";
import { obtenerTodosPacientes } from "../../api/pacienteApi";
import { obtenerTodosMedicos } from "../../api/medicoApi";
import Swal from 'sweetalert2';

echarts.use([GridComponent, TooltipComponent, LegendComponent, PieChart, BarChart, CanvasRenderer]);

export default function ReportsDashboard() {
  const [reportType, setReportType] = useState('consultation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await obtenerTodosPacientes();
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };

    const fetchDoctors = async () => {
      try {
        const data = await obtenerTodosMedicos();
        setDoctors(data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchPatients();
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (reportData) {
      renderChart();
    }
  }, [reportData]);

  const handleGenerateReport = async () => {
    try {
      let data;
      switch (reportType) {
        case 'consultation':
          data = await obtenerReporteConsultas(startDate, endDate);
          break;
        case 'reservation':
          data = await obtenerReporteReservas(startDate, endDate, status);
          break;
        case 'patient':
          data = await obtenerReportePaciente(patientId, startDate, endDate, status);
          break;
        case 'doctor':
          data = await obtenerReporteDoctor(doctorId, startDate, endDate, status);
          break;
        default:
          throw new Error('Invalid report type');
      }
      setReportData(data);
    } catch (error) {
      console.error("Error generating report:", error);
      
    }
  };

  const renderChart = () => {
    if (!chartRef.current || !reportData) return;

    const chart = echarts.init(chartRef.current);

    let option;
    switch (reportType) {
      case 'consultation':
      case 'reservation':
        option = {
          title: {
            text: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Status Distribution`,
            left: 'center'
          },
          tooltip: {
            trigger: 'item'
          },
          legend: {
            orient: 'vertical',
            left: 'left'
          },
          series: [
            {
              name: 'Status',
              type: 'pie',
              radius: '50%',
              data: [
                { value: reportData.totals[`${reportType}esAtendidas`], name: 'Attended' },
                { value: reportData.totals[`${reportType}esPendientes`], name: 'Pending' },
                { value: reportData.totals[`${reportType}esCanceladas`], name: 'Cancelled' }
              ],
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        };
        break;
      case 'patient':
      case 'doctor':
        option = {
          title: {
            text: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report Summary`,
            left: 'center'
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: ['Total Reservations', 'Attended', 'Pending', 'Cancelled', 'Total Consultations']
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: 'Count',
              type: 'bar',
              data: [
                reportData.data.totals.totalReservas,
                reportData.data.totals.reservasAtendidas,
                reportData.data.totals.reservasPendientes,
                reportData.data.totals.reservasCanceladas,
                reportData.data.totals.totalConsultas
              ]
            }
          ]
        };
        break;
    }

    chart.setOption(option);
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Medical Reports Dashboard</h1>
      <div className="mb-4">
        <div className="flex space-x-2 mb-4">
          {['consultation', 'reservation', 'patient', 'doctor'].map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`flex items-center justify-center px-4 py-2 rounded-md ${
                reportType === type ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'
              }`}
            >
              {type === 'consultation' && <FileBarChart className="mr-2" />}
              {type === 'reservation' && <Calendar className="mr-2" />}
              {type === 'patient' && <Users className="mr-2" />}
              {type === 'doctor' && <UserCog className="mr-2" />}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {reportType === 'patient' && (
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.name} {patient.lastname}
                  </option>
                ))}
              </select>
            )}
            {reportType === 'doctor' && (
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name} {doctor.lastname}
                  </option>
                ))}
              </select>
            )}
            <input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
             <option value="">All Statuses</option>
              <option value="atendido">Atendido</option>
              <option value="pendiente">Pendiente</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <button
            onClick={handleGenerateReport}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Generate Report
          </button>
        </div>
      </div>
      {reportData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Summary</h3>
              {reportType === 'consultation' && (
                <>
                  <p>Total Consultations: {reportData.totals.totalConsultas}</p>
                  <p>Attended: {reportData.totals.consultasAtendidas}</p>
                  <p>Pending: {reportData.totals.consultasPendientes}</p>
                  <p>Cancelled: {reportData.totals.consultasCanceladas}</p>
                </>
              )}
              {reportType === 'reservation' && (
                <>
                  <p>Total Reservations: {reportData.totals.totalReservas}</p>
                  <p>Attended: {reportData.totals.reservasAtendidas}</p>
                  <p>Pending: {reportData.totals.reservasPendientes}</p>
                  <p>Cancelled: {reportData.totals.reservasCanceladas}</p>
                </>
              )}
              {(reportType === 'patient' || reportType === 'doctor') && (
                <>
                  <p>Total Reservations: {reportData.data.totals.totalReservas}</p>
                  <p>Attended Reservations: {reportData.data.totals.reservasAtendidas}</p>
                  <p>Pending Reservations: {reportData.data.totals.reservasPendientes}</p>
                  <p>Cancelled Reservations: {reportData.data.totals.reservasCanceladas}</p>
                  <p>Total Consultations: {reportData.data.totals.totalConsultas}</p>
                </>
              )}
            </div>
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Chart</h3>
              <div ref={chartRef} style={{ width: '100%', height: '300px' }}></div>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Detailed Report</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    {reportType === 'consultation' && (
                      <>
                        <th className="py-2 px-4 border-b text-left">Patient Name</th>
                        <th className="py-2 px-4 border-b text-left">Date</th>
                        <th className="py-2 px-4 border-b text-left">Time</th>
                        <th className="py-2 px-4 border-b text-left">Status</th>
                        <th className="py-2 px-4 border-b text-left">Doctor</th>
                        <th className="py-2 px-4 border-b text-left">Reason</th>
                      </>
                    )}
                    {reportType === 'reservation' && (
                      <>
                        <th className="py-2 px-4 border-b text-left">Patient Name</th>
                        <th className="py-2 px-4 border-b text-left">Date</th>
                        <th className="py-2 px-4 border-b text-left">Time</th>
                        <th className="py-2 px-4 border-b text-left">Status</th>
                        <th className="py-2 px-4 border-b text-left">Doctor</th>
                        <th className="py-2 px-4 border-b text-left">Specialty</th>
                      </>
                    )}
                    {reportType === 'patient' && (
                      <>
                        <th className="py-2 px-4 border-b text-left">Date</th>
                        <th className="py-2 px-4 border-b text-left">Time</th>
                        <th className="py-2 px-4 border-b text-left">Specialty</th>
                        <th className="py-2 px-4 border-b text-left">Status</th>
                        <th className="py-2 px-4 border-b text-left">Doctor</th>
                      </>
                    )}
                    {reportType === 'doctor' && (
                      <>
                        <th className="py-2 px-4 border-b text-left">Date</th>
                        <th className="py-2 px-4 border-b text-left">Time</th>
                        <th className="py-2 px-4 border-b text-left">Specialty</th>
                        <th className="py-2 px-4 border-b text-left">Status</th>
                        <th className="py-2 px-4 border-b text-left">Patient</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportType === 'consultation' && reportData.data.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-2 px-4 border-b">{item.paciente.nombreCompleto}</td>
                      <td className="py-2 px-4 border-b">{new Date(item.consulta.fechaConsulta).toLocaleDateString()}</td>
                      <td className="py-2 px-4 border-b">{`${item.consulta.horaInicio} - ${item.consulta.horaFin}`}</td>
                      <td className="py-2 px-4 border-b">{item.consulta.estado}</td>
                      <td className="py-2 px-4 border-b">{item.medico.nombreCompleto}</td>
                      <td className="py-2 px-4 border-b">{item.consulta.motivoConsulta}</td>
                    </tr>
                  ))}
                  {reportType === 'reservation' && reportData.data.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-2 px-4 border-b">{item.paciente.nombreCompleto}</td>
                      <td className="py-2 px-4 border-b">{new Date(item.reserva.fechaReserva).toLocaleDateString()}</td>
                      <td className="py-2 px-4 border-b">{`${item.reserva.horaInicio} - ${item.reserva.horaFin}`}</td>
                      <td className="py-2 px-4 border-b">{item.reserva.estado}</td>
                      <td className="py-2 px-4 border-b">{item.medico.nombreCompleto}</td>
                      <td className="py-2 px-4 border-b">{item.medico.especialidad}</td>
                    </tr>
                  ))}
                  {reportType === 'patient' && reportData.data.reservas.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-2 px-4 border-b">{new Date(item.fechaReserva).toLocaleDateString()}</td>
                      <td className="py-2 px-4 border-b">{`${item.horaInicio} - ${item.horaFin}`}</td>
                      <td className="py-2 px-4 border-b">{item.especialidad}</td>
                      <td className="py-2 px-4 border-b">{item.estado}</td>
                      <td className="py-2 px-4 border-b">{item.medico}</td>
                    </tr>
                  ))}
                  {reportType === 'doctor' && reportData.data.reservas.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-2 px-4 border-b">{new Date(item.fechaReserva).toLocaleDateString()}</td>
                      <td className="py-2 px-4 border-b">{`${item.horaInicio} - ${item.horaFin}`}</td>
                      <td className="py-2 px-4 border-b">{item.especialidad}</td>
                      <td className="py-2 px-4 border-b">{item.estado}</td>
                      <td className="py-2 px-4 border-b">{item.paciente}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}