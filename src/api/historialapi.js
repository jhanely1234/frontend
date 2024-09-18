import axios from "axios";

// URLs de los servidores usando variables de entorno de Vite
let serverPrimary = `${import.meta.env.VITE_URL_DOCKER}:3004/api/historial`;
let serverBackup = `${import.meta.env.VITE_URL_BACKUP}/api/historial`;
let serverConsulta = `${import.meta.env.VITE_URL_BACKUP}/api/consulta`; // URL específica para crear consulta
let currentServer = serverPrimary; // Servidor actual
let useBackupServer = false; // Bandera para usar el servidor de respaldo

// Crear una instancia de Axios para el historial
const api = axios.create({
  baseURL: serverPrimary,
  timeout: 5000, // Timeout de las solicitudes a 5 segundos
});

// Crear una instancia de Axios específica para crear consulta
const apiConsulta = axios.create({
  baseURL: serverConsulta,
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
      console.error("El servidor de respaldo tampoco está disponible");
    }
  }
};

// Inicializar la conexión al cargar el módulo
initializeServerConnection();

// Interceptor para añadir el token a cada solicitud en la instancia principal
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

// Interceptor para añadir el token a cada solicitud en la instancia de consulta
apiConsulta.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Obtener el token del localStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Funciones CRUD para historial
export const obtenerHistorialPorPaciente = async (pacienteId) => {
  try {
    const respuesta = await api.get(`/${pacienteId}`);
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener el historial:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
};

// Función para crear una consulta, usando la URL específica
export const crearConsulta = async (consulta) => {
  try {
    const response = await apiConsulta.post("/create", consulta);
    console.log("Consulta creada con éxito:", response.data.message);
    return response.data;
  } catch (error) {
    console.error("Error al crear la consulta:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
};

export const obtenerHistorialPorReservaId = async (reservaId) => {
  try {
    const respuesta = await api.get(`/reserva/${reservaId}`);
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener el historial por reserva ID:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
};

export default api;
