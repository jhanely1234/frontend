import axios from "axios";
import { toast } from "react-toastify"; // Importa Toastify para el error elegante

// URL del servidor usando variable de entorno de Vite
let serverPrimary = `${import.meta.env.VITE_URL_PRIMARY_HISTORIAL
  }/historial`;
let serverConsulta = `${import.meta.env.VITE_URL_PRIMARY_CONSULTA
  }/consulta`; // URL específica para crear consulta
let currentServer = serverPrimary; // Servidor actual

// Crear una instancia de Axios para el historial
const api = axios.create({
  baseURL: serverPrimary,
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
    });
    return true;
  } catch (error) {
    return false;
  }
};

// Función para inicializar la conexión al servidor de historial
const initializeServerConnection = async () => {
  const isPrimaryAvailable = await checkServerAvailability(serverPrimary);
  if (isPrimaryAvailable) {
    console.log("Conectado al microservicio de historial:", serverPrimary);
    currentServer = serverPrimary;
  } else {
    console.error("El microservicio de historial no está disponible");
    toast.error("El microservicio de historial no está disponible.", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }
};

// Inicializar la conexión al cargar el módulo
initializeServerConnection();

// Interceptor para añadir el token a cada solicitud en la instancia principal (historial)
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
    console.error(
      "Error al obtener el historial:",
      error.response?.data?.message || error.message
    );
    toast.error("Error al obtener el historial.", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    return Promise.reject(error);
  }
};

// Función para crear una consulta, usando la URL específica
export const crearConsulta = async (consulta) => {
  try {
    const response = await apiConsulta.post("/create", consulta);
    return response.data;
  } catch (error) {
    console.error(
      "Error al crear la consulta:",
      error.response?.data?.message || error.message
    );
    toast.error("Error al crear la consulta.", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    return Promise.reject(error);
  }
};

// Función para obtener historial por reserva ID
export const obtenerHistorialPorReservaId = async (reservaId) => {
  try {
    const respuesta = await api.get(`/reserva/${reservaId}`);
    return respuesta.data;
  } catch (error) {
    console.error(
      "Error al obtener el historial por reserva ID:",
      error.response?.data?.message || error.message
    );
    toast.error("Error al obtener el historial por reserva ID.", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    return Promise.reject(error);
  }
};

export default api;
