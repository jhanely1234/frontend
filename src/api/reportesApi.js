import axios from "axios";
import Swal from "sweetalert2";

// URLs de los servidores usando variables de entorno de Vite
let serverPrimary = `${import.meta.env.VITE_URL_DOCKER}:3007/api/reporte`;
let serverBackup = `${import.meta.env.VITE_URL_BACKUP}/api/reporte`;
let currentServer = serverPrimary; // Servidor actual
let useBackupServer = false; // Bandera para usar el servidor de respaldo

// Crear una instancia de Axios
const api = axios.create({
  baseURL: currentServer,
  timeout: 5000, // Timeout de las solicitudes a 5 segundos
});

// Función para verificar la disponibilidad del servidor, considerando el token
const checkServerAvailability = async (url) => {
  const token = localStorage.getItem("token"); // Obtener el token del localStorage
  try {
    await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 1000,
    });
    return true;
  } catch (error) {
    return false;
  }
};

// Función para inicializar la conexión al servidor
const initializeServerConnection = async () => {
  const isPrimaryAvailable = await checkServerAvailability(serverPrimary);
  if (isPrimaryAvailable) {
    console.log("Conectado al servidor principal:", serverPrimary);
    currentServer = serverPrimary;
  } else {
    console.warn("Servidor principal no disponible. Intentando con el servidor de respaldo...");
    const isBackupAvailable = await checkServerAvailability(serverBackup);
    if (isBackupAvailable) {
      console.log("Conexión exitosa con el servidor de respaldo:", serverBackup);
      api.defaults.baseURL = serverBackup;
      currentServer = serverBackup;
      useBackupServer = true;
    } else {
      console.error("El servidor de respaldo tampoco está disponible. No se puede establecer la conexión.");
      throw new Error("Ambos servidores están fuera de línea. No se puede establecer la conexión.");
    }
  }
};

// Inicializar la conexión al cargar el módulo
await initializeServerConnection();

// Interceptor para añadir el token a cada solicitud y asegurar que la solicitud use el servidor correcto
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Obtener el token del localStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    config.baseURL = currentServer;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API para obtener el resumen de reservas (GET)
export const obtenerResumenReservas = async () => {
  try {
    const respuesta = await api.get("/reservas");
    console.log("Resumen de reservas:", respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener el resumen de reservas:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
};

// API para generar un nuevo reporte de consultas (POST)
export const generarReporteConsultas = async (datosReporte) => {
  try {
    const respuesta = await api.post("/consultas", datosReporte);
    return respuesta.data;
  } catch (error) {
    console.error("Error al generar el reporte de consultas:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
};

// API para obtener estadísticas de citas por período (día, mes o año)
export const obtenerEstadisticasCitas = async (period = "day") => {
  try {
    const respuesta = await api.get(`http://localhost:3000/api/reporte/appointments/stats?period=${period}`);
    return respuesta.data;
  } catch (error) {
    console.error(`Error al obtener estadísticas de citas para el período ${period}:`, error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
};

// API para obtener estadísticas de pacientes por período (día, mes o año)
export const obtenerEstadisticasPacientes = async (period = "day") => {
  try {
    const respuesta = await api.get(`http://localhost:3000/api/reporte/patients/stats?period=${period}`);
    return respuesta.data;
  } catch (error) {
    console.error(`Error al obtener estadísticas de pacientes para el período ${period}:`, error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
};

// Nueva API para obtener próximas citas
export const obtenerProximasCitas = async () => {
  try {
    const respuesta = await api.get("http://localhost:3000/api/reporte/appointments/upcoming");
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener próximas citas:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
};

// Nueva API para obtener la distribución de especialidades
export const obtenerDistribucionEspecialidades = async () => {
  try {
    const respuesta = await api.get("http://localhost:3000/api/reporte/specialties/distribution");
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener la distribución de especialidades:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
};

// Nueva API para obtener el resumen del dashboard
export const obtenerResumenDashboard = async () => {
  try {
    const respuesta = await api.get("http://localhost:3000/api/reporte/dashboard/summary");
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener el resumen del dashboard:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
};
// API para obtener la tasa de reingresos por período (día, mes o año)
export const obtenerTasaReingreso = async (period = "day") => {
  try {
    const respuesta = await api.get(`http://localhost:3000/api/reporte/reingreso/rate?period=${period}`);
    return respuesta.data;
  } catch (error) {
    console.error(`Error al obtener la tasa de reingreso para el período ${period}:`, error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
};
// API para obtener estadísticas de estado de citas por período (día, mes o año)
export const obtenerEstadisticasEstadoCitas = async (period = "month") => {
  try {
    const respuesta = await api.get(`http://localhost:3000/api/reporte/appointments/status-stats?period=${period}`);
    return respuesta.data;
  } catch (error) {
    console.error(`Error al obtener estadísticas de estado de citas para el período ${period}:`, error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
};

// API para obtener el reporte de consultas entre un rango de fechas
export const obtenerReporteConsultas = async (startDate, endDate) => {
  console.log("startDate:", startDate, "endDate:", endDate);
  try {
    const respuesta = await api.get(
      `http://localhost:3000/api/reporte/consultation-report?startDate=${startDate}&endDate=${endDate}`
    );
    console.log("Reporte de consultas:", respuesta.data);
    //Swal.fire("success",respuesta.data.message);
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener el reporte de consultas:", error.response?.data?.message || error.message);
    Swal.fire("Error", error.response?.data?.error || error.message, "error");
    return Promise.reject(error);
  }
};

// API para obtener el reporte de reservas entre un rango de fechas con estado opcional
export const obtenerReporteReservas = async (startDate, endDate, estado = "") => {
  try {
    const url = `http://localhost:3000/api/reporte/reservation-report?startDate=${startDate}&endDate=${endDate}${
      estado ? `&estado=${estado}` : ""
    }`;
    const respuesta = await api.get(url);
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener el reporte de reservas:", error.response?.data?.message || error.message);
    Swal.fire("Error", error.response?.data?.error || error.message, "error");
    return Promise.reject(error);
  }
};
// API para obtener el reporte de un paciente específico entre un rango de fechas
export const obtenerReportePaciente = async (patientId, startDate, endDate, estado = "") => {
  try {
    const url = `http://localhost:3000/api/reporte/patient-report?patientId=${patientId}&startDate=${startDate}&endDate=${endDate}${
      estado ? `&estado=${estado}` : ""
    }`;
    const respuesta = await api.get(url);
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener el reporte del paciente:", error.response?.data?.message || error.message);
    Swal.fire("Error", error.response?.data?.error || error.message, "error");
    return Promise.reject(error);
  }
};
// API para obtener el reporte de un doctor específico entre un rango de fechas
export const obtenerReporteDoctor = async (doctorId, startDate, endDate, estado = "") => {
  try {
    const url = `http://localhost:3000/api/reporte/doctor-report?doctorId=${doctorId}&startDate=${startDate}&endDate=${endDate}${
      estado ? `&estado=${estado}` : ""
    }`;
    const respuesta = await api.get(url);
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener el reporte del doctor:", error.response?.data?.message || error.message);
    Swal.fire("Error", error.response?.data?.error || error.message, "error");
    return Promise.reject(error);
  }
};

export default api;
