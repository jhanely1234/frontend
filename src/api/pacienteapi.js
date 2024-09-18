import axios from "axios";
import Swal from "sweetalert2";

// URLs de los servidores usando variables de entorno de Vite
let serverPrimary = `${import.meta.env.VITE_URL_DOCKER}:3006/api/paciente`;
let serverBackup = `${import.meta.env.VITE_URL_BACKUP}/api/paciente`;
let currentServer = serverPrimary; // Servidor actual
let useBackupServer = false; // Bandera para usar el servidor de respaldo

// Crear una instancia de Axios
const api = axios.create({
  baseURL: serverPrimary,
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
    } else {
      console.error("El servidor de respaldo tampoco está disponible");
      Swal.fire({
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

// Funciones CRUD para pacientes
export const obtenerTodosPacientes = async () => {
  try {
    const respuesta = await api.get("/");
    return respuesta.data;
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.response?.data?.message || "Error al obtener los pacientes"
    });
    return Promise.reject(error);
  }
};

export const obtenerPacientePorId = async (id) => {
  try {
    const respuesta = await api.get(`/${id}`);
    return respuesta.data;
  } catch (error) {
    Swal.fire("Error", error.response.data.message, "error");
    return Promise.reject(error);
  }
};

export const crearPaciente = async (datosPaciente) => {
  try {
    const respuesta = await api.post("/create/", datosPaciente);
    Swal.fire("Éxito", respuesta.data.message, "success");
    return respuesta.data;
  } catch (error) {
    Swal.fire(
      "Error",
      error.response?.data?.message || "Ocurrió un error al crear el paciente.",
      "error"
    );
    return Promise.reject(error);
  }
};

export const actualizarPaciente = async (id, datosPaciente) => {
  try {
    const respuesta = await api.put(`/${id}`, datosPaciente);
    Swal.fire("Éxito", respuesta.data.message, "success");
    return respuesta.data;
  } catch (error) {
    Swal.fire({
      title: "Error",
      text:
        error.response?.data?.message ||
        "Ocurrió un error al actualizar el paciente.",
      icon: "error"
    });
    return Promise.reject(error);
  }
};

export const eliminarPaciente = async (id) => {
  const confirmacion = await Swal.fire({
    title: "¿Estás seguro?",
    text: "¡No podrás revertir esta acción!",
    icon: "warning",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    confirmButtonText: "Sí, eliminar",
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33"
  });

  if (confirmacion.isConfirmed) {
    try {
      const respuesta = await api.delete(`/${id}`);
      Swal.fire("Eliminado", respuesta.data.message, "success");
      return respuesta.data;
    } catch (error) {
      Swal.fire("Error", error.response.data.message, "error");
      return Promise.reject(error);
    }
  }
};

export default api;
