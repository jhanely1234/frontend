import axios from "axios";
import { toast } from "react-toastify"; // Importar react-toastify


// URL del servidor usando variable de entorno de Vite
let serverPrimary = `${import.meta.env.VITE_URL_MICROSERVICE_REPORTE}/reporte`;
let currentServer = serverPrimary; // Servidor actual

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
    console.log("Conectado al microservicio de reportes :", serverPrimary);
    currentServer = serverPrimary;
  } else {
    console.error("El microservicio de reportes no está disponible.");
    toast.error(
      "El microservicio de reportes no está disponible.",
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  }
};

// Inicializar la conexión al cargar el módulo
await initializeServerConnection();

// Interceptor para añadir el token a cada solicitud
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
    return respuesta.data;
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Error al obtener el resumen de reservas",
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    return Promise.reject(error);
  }
};

// API para generar un nuevo reporte de consultas (POST)
export const generarReporteConsultas = async (datosReporte) => {
  try {
    const respuesta = await api.post("/consultas", datosReporte);
    toast.success("Reporte de consultas generado con éxito", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    return respuesta.data;
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Error al generar el reporte de consultas",
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    return Promise.reject(error);
  }
};

// API para obtener estadísticas de citas por período (día, mes o año)
export const obtenerEstadisticasCitas = async (period = "day") => {
  try {
    const respuesta = await api.get(`/appointments/stats?period=${period}`);
    return respuesta.data;
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        `Error al obtener estadísticas de citas para el período ${period}`,
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    return Promise.reject(error);
  }
};

// API para obtener estadísticas de pacientes por período (día, mes o año)
export const obtenerEstadisticasPacientes = async (period = "day") => {
  try {
    const respuesta = await api.get(`/patients/stats?period=${period}`);
    return respuesta.data;
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        `Error al obtener estadísticas de pacientes para el período ${period}`,
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    return Promise.reject(error);
  }
};

// Nueva API para obtener próximas citas
export const obtenerProximasCitas = async () => {
  try {
    const respuesta = await api.get("/appointments/upcoming");
    return respuesta.data;
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Error al obtener próximas citas",
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    return Promise.reject(error);
  }
};

// Nueva API para obtener la distribución de especialidades
export const obtenerDistribucionEspecialidades = async () => {
  try {
    const respuesta = await api.get("/specialties/distribution");
    return respuesta.data;
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Error al obtener la distribución de especialidades",
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    return Promise.reject(error);
  }
};

// Nueva API para obtener el resumen del dashboard
export const obtenerResumenDashboard = async () => {
  try {
    const respuesta = await api.get("/dashboard/summary");
    return respuesta.data;
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Error al obtener el resumen del dashboard",
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    return Promise.reject(error);
  }
};

// API para obtener la tasa de reingresos por período (día, mes o año)
export const obtenerTasaReingreso = async (period = "day") => {
  try {
    const respuesta = await api.get(`/reingreso/rate?period=${period}`);
    return respuesta.data;
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        `Error al obtener la tasa de reingreso para el período ${period}`,
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    return Promise.reject(error);
  }
};

// API para obtener estadísticas de estado de citas por período (día, mes o año)
export const obtenerEstadisticasEstadoCitas = async (period = "month") => {
  try {
    const respuesta = await api.get(
      `/appointments/status-stats?period=${period}`
    );
    return respuesta.data;
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        `Error al obtener estadísticas de estado de citas para el período ${period}`,
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    return Promise.reject(error);
  }
};

// API para obtener el reporte de consultas entre un rango de fechas
export const obtenerReporteConsultas = async (startDate, endDate) => {
  try {
    const respuesta = await api.get(
      `/consultation-report?startDate=${startDate}&endDate=${endDate}`
    );
    return respuesta.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      toast.error(
        error.response?.data?.message ||
          "Error al obtener el reporte de consultas",
        {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } else {
      toast.error("Error desconocido al obtener el reporte de consultas", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    return Promise.reject(error);
  }
};

// API para obtener el reporte de reservas entre un rango de fechas con estado opcional
export const obtenerReporteReservas = async (
  startDate,
  endDate,
  estado = ""
) => {
  try {
    const url = `/reservation-report?startDate=${startDate}&endDate=${endDate}${
      estado ? `&estado=${estado}` : ""
    }`;
    const respuesta = await api.get(url);
    return respuesta.data;
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Error al obtener el reporte de reservas",
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    return Promise.reject(error);
  }
};

// API para obtener el reporte de un paciente específico entre un rango de fechas
export const obtenerReportePaciente = async (
  patientId,
  startDate,
  endDate,
  estado = ""
) => {
  try {
    const url = `/patient-report?patientId=${patientId}&startDate=${startDate}&endDate=${endDate}${
      estado ? `&estado=${estado}` : ""
    }`;
    const respuesta = await api.get(url);
    return respuesta.data;
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Error al obtener el reporte del paciente",
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    return Promise.reject(error);
  }
};

// API para obtener el reporte de un doctor específico entre un rango de fechas
export const obtenerReporteDoctor = async (
  doctorId,
  startDate,
  endDate,
  estado = ""
) => {
  try {
    const url = `/doctor-report?doctorId=${doctorId}&startDate=${startDate}&endDate=${endDate}${
      estado ? `&estado=${estado}` : ""
    }`;
    const respuesta = await api.get(url);
    return respuesta.data;
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Error al obtener el reporte del doctor",
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    return Promise.reject(error);
  }
};

export default api;
