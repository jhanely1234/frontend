import Swal from "sweetalert2"; // Importa SweetAlert
import axios from "axios";

// URLs de los servidores usando variables de entorno de Vite
let serverPrimary = `${import.meta.env.VITE_URL_DOCKER}:3003/api/especialidad`;
let serverBackup = `${import.meta.env.VITE_URL_BACKUP}/api/especialidad`;
let currentServer = serverPrimary; // Servidor actual
let useBackupServer = false; // Bandera para usar el servidor de respaldo

// Crear una instancia de Axios
const api = axios.create({
  baseURL: currentServer,
  timeout: 5000 // Timeout de las solicitudes a 5 segundos
});

// Función para verificar la disponibilidad del servidor, considerando el token
const checkServerAvailability = async (url) => {
  const token = localStorage.getItem("token"); // Obtener el token del localStorage
  try {
    await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 1000
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
    console.warn(
      "Servidor principal no disponible. Intentando con el servidor de respaldo..."
    );
    const isBackupAvailable = await checkServerAvailability(serverBackup);
    if (isBackupAvailable) {
      console.log(
        "Conexión exitosa con el servidor de respaldo:",
        serverBackup
      );
      api.defaults.baseURL = serverBackup;
      currentServer = serverBackup;
      useBackupServer = true;

      await Swal.fire({
        icon: "success",
        title: "Conectado con Servidor de Respaldo",
        text: "Ahora estás conectado con el servidor de respaldo.",
        confirmButtonText: "Aceptar"
      });
    } else {
      console.error("El servidor de respaldo tampoco está disponible");
      await Swal.fire({
        icon: "error",
        title: "Error de Conexión",
        text: "El servidor de respaldo tampoco está disponible. Por favor, intente de nuevo más tarde.",
        confirmButtonText: "Aceptar"
      });
    }
  }
};

// Inicializar la conexión al cargar el módulo
initializeServerConnection();

// Configura un intervalo para verificar periódicamente la disponibilidad de los servidores
const checkServerInterval = setInterval(async () => {
  const isPrimaryAvailable = await checkServerAvailability(serverPrimary);
  if (isPrimaryAvailable && useBackupServer) {
    console.log("El servidor principal está disponible nuevamente");
    api.defaults.baseURL = serverPrimary;
    currentServer = serverPrimary;
    useBackupServer = false;

    await Swal.fire({
      icon: "success",
      title: "Conectado con el Servidor Principal",
      text: "El servidor principal está disponible nuevamente. Ahora estás conectado con el servidor principal.",
      confirmButtonText: "Aceptar"
    });
  } else if (!isPrimaryAvailable && !useBackupServer) {
    console.warn(
      "Servidor principal no disponible. Intentando con el servidor de respaldo..."
    );
    const isBackupAvailable = await checkServerAvailability(serverBackup);
    if (isBackupAvailable) {
      console.log("Conexión exitosa con el servidor de respaldo");
      api.defaults.baseURL = serverBackup;
      currentServer = serverBackup;
      useBackupServer = true;

      await Swal.fire({
        icon: "success",
        title: "Conectado con Servidor de Respaldo",
        text: "Ahora estás conectado con el servidor de respaldo.",
        confirmButtonText: "Aceptar"
      });
    } else {
      console.error("El servidor de respaldo tampoco está disponible");
      await Swal.fire({
        icon: "error",
        title: "Error de Conexión",
        text: "El servidor de respaldo tampoco está disponible. Por favor, intente de nuevo más tarde.",
        confirmButtonText: "Aceptar"
      });
    }
  }
}, 5000); // Verifica cada 5 segundos

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

// Funciones CRUD
export const obtenerTodasEspecialidades = async () => {
  try {
    const respuesta = await api.get("/");
    return respuesta.data;
  } catch (error) {
    console.error(
      "Error al obtener todas las especialidades:",
      error.response?.data?.message || error.message
    );
    return Promise.reject(error);
  }
};

export const obtenerEspecialidadPorId = async (id) => {
  try {
    const respuesta = await api.get(`/${id}`);
    return respuesta.data;
  } catch (error) {
    console.error(
      "Error al obtener la especialidad por ID:",
      error.response?.data?.message || error.message
    );
    return Promise.reject(error);
  }
};

export const crearEspecialidad = async (datosEspecialidad) => {
  try {
    const respuesta = await api.post("/create/", datosEspecialidad);
    return respuesta.data;
  } catch (error) {
    console.error(
      "Error al crear la especialidad:",
      error.response?.data?.message || error.message
    );
    return Promise.reject(error);
  }
};

export const actualizarEspecialidad = async (id, datosEspecialidad) => {
  try {
    const respuesta = await api.put(`/${id}`, datosEspecialidad);
    return respuesta.data;
  } catch (error) {
    console.error(
      "Error al actualizar la especialidad:",
      error.response?.data?.message || error.message
    );
    return Promise.reject(error);
  }
};

export const eliminarEspecialidad = async (id) => {
  try {
    const respuesta = await api.delete(`/${id}`);
    return respuesta.data;
  } catch (error) {
    console.error(
      "Error al eliminar la especialidad:",
      error.response?.data?.message || error.message
    );
    return Promise.reject(error);
  }
};

export default api;
