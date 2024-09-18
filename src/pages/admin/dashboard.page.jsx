import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import {
  CalendarIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  LineChartIcon,
  PieChartIcon
} from "lucide-react";
import {
  obtenerProximasCitas,
  obtenerEstadisticasCitas,
  obtenerEstadisticasPacientes,
  obtenerDistribucionEspecialidades,
  obtenerResumenDashboard,
  obtenerTasaReingreso,
  obtenerEstadisticasEstadoCitas
} from "../../api/reportesApi";

export default function Dashboard() {
  const [resumenDashboard, setResumenDashboard] = useState(null);
  const [estadisticasCitas, setEstadisticasCitas] = useState([]);
  const [estadisticasPacientes, setEstadisticasPacientes] = useState([]);
  const [proximasCitas, setProximasCitas] = useState([]);
  const [distribucionEspecialidades, setDistribucionEspecialidades] = useState(
    []
  );
  const [tasaReingreso, setTasaReingreso] = useState(null);
  const [estadosCitas, setEstadosCitas] = useState([]);
  const [periodoTiempo, setPeriodoTiempo] = useState("day");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resumen = await obtenerResumenDashboard();
        setResumenDashboard(resumen);

        const citas = await obtenerEstadisticasCitas(periodoTiempo);
        setEstadisticasCitas(citas.data);

        const pacientes = await obtenerEstadisticasPacientes(periodoTiempo);
        setEstadisticasPacientes(pacientes.data);

        const proxCitas = await obtenerProximasCitas();
        setProximasCitas(proxCitas.appointments);

        const distribucion = await obtenerDistribucionEspecialidades();
        setDistribucionEspecialidades(distribucion.data);

        const reingreso = await obtenerTasaReingreso(periodoTiempo);
        setTasaReingreso(reingreso);

        const estadosCitasData = await obtenerEstadisticasEstadoCitas(
          periodoTiempo
        );
        setEstadosCitas(estadosCitasData.data);
      } catch (error) {
        console.error("Error al obtener datos del dashboard:", error);
      }
    };

    fetchData();
  }, [periodoTiempo]);

  const StatCard = ({ title, value, change, color, icon: Icon }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="text-2xl font-bold mb-2">{value}</p>
      <p
        className={`text-xs ${change >= 0 ? "text-green-500" : "text-red-500"}`}
      >
        {change >= 0 ? "+" : ""}
        {change}% desde el mes pasado
      </p>
    </div>
  );

  const chartOptions = {
    citas: {
      title: { text: "Citas por Período", left: "center" },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: estadisticasCitas.map((item) => item.name)
      },
      yAxis: { type: "value" },
      series: [
        {
          data: estadisticasCitas.map((item) => item.total),
          type: "bar",
          itemStyle: {
            color: "#8b5cf6"
          }
        }
      ]
    },
    pacientes: {
      title: { text: "Pacientes por Período", left: "center" },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: estadisticasPacientes.map((item) => item.name)
      },
      yAxis: { type: "value" },
      series: [
        {
          data: estadisticasPacientes.map((item) => item.total),
          type: "line",
          smooth: true,
          itemStyle: {
            color: "#10b981"
          }
        }
      ]
    },
    especialidades: {
      title: { text: "Distribución de Especialidades", left: "center" },
      tooltip: { trigger: "item" },
      series: [
        {
          type: "pie",
          radius: "50%",
          data: distribucionEspecialidades,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)"
            }
          }
        }
      ]
    }
  };

  return (
    <div className="space-y-6 p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Citas Totales"
          value={resumenDashboard?.totalAppointments || 0}
          change={resumenDashboard?.appointmentsGrowth || 0}
          color="text-blue-600"
          icon={CalendarIcon}
        />
        <StatCard
          title="Nuevos Pacientes"
          value={resumenDashboard?.newPatients || 0}
          change={resumenDashboard?.newPatientsGrowth || 0}
          color="text-green-600"
          icon={UserPlusIcon}
        />
        <StatCard
          title="Atendidos"
          value={resumenDashboard?.attendedAppointments || 0}
          change={resumenDashboard?.attendedAppointmentsGrowth || 0}
          color="text-yellow-600"
          icon={CheckCircleIcon}
        />
        <StatCard
          title="Por Atender"
          value={resumenDashboard?.upcomingAppointments || 0}
          change={resumenDashboard?.upcomingAppointmentsGrowth || 0}
          color="text-purple-600"
          icon={ClockIcon}
        />
      </div>

      <div className="flex justify-end mb-4">
        <select
          className="p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={periodoTiempo}
          onChange={(e) => setPeriodoTiempo(e.target.value)}
        >
          <option value="day">Día</option>
          <option value="month">Mes</option>
          <option value="year">Año</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <ChartBarIcon className="mr-2 h-5 w-5 text-purple-600" />
            Citas por Período
          </h2>
          <ReactECharts
            option={chartOptions.citas}
            style={{ height: "400px" }}
          />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <LineChartIcon className="mr-2 h-5 w-5 text-green-600" />
            Pacientes por Período
          </h2>
          <ReactECharts
            option={chartOptions.pacientes}
            style={{ height: "400px" }}
          />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <PieChartIcon className="mr-2 h-5 w-5 text-blue-600" />
            Distribución de Especialidades
          </h2>
          <ReactECharts
            option={chartOptions.especialidades}
            style={{ height: "400px" }}
          />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-yellow-600" />
            Próximas Citas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proximasCitas.slice(0, 4).map((cita, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow">
                <h3 className="font-semibold text-lg mb-2">{cita.name}</h3>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Fecha:</span> {cita.date}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Hora:</span> {cita.time}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Especialidad:</span>{" "}
                  {cita.specialty}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
