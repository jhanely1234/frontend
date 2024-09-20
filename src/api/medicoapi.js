import axios from "axios";
import Swal from "sweetalert2"; // Importar SweetAlert2
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// URLs de los servidores usando variables de entorno de Vite
let serverPrimary = `${import.meta.env.VITE_URL_DOCKER}:3000/api/medico`;
let serverBackup = `${import.meta.env.VITE_URL_BACKUP}/api/medico`;
let currentServer = serverPrimary; // Servidor actual
let useBackupServer = false; // Bandera para usar el servidor de respaldo

// Crear una instancia de Axios
const api = axios.create({
  baseURL: serverPrimary
});

// Función para verificar la disponibilidad del servidor, considerando el token
const checkServerAvailability = async (url) => {
  const token = localStorage.getItem("token"); // Obtener el token del localStorage
  try {
    await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
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
      MySwal.fire({
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

// Funciones CRUD para médicos
export const obtenerTodosMedicos = async () => {
  try {
    const respuesta = await api.get("/");
    return respuesta.data;
  } catch (error) {
    MySwal.fire({
      icon: "error",
      title: "Error",
      text: error.response?.data?.message || "Error al obtener los médicos"
    });
    throw error;
  }
};

export const obtenerMedicoPorId = async (id) => {
  try {
    const respuesta = await api.get(`/${id}`);
    console.log("Respuesta:", respuesta.data);
    return respuesta.data;
  } catch (error) {
    MySwal.fire({
      icon: "error",
      title: "Error",
      text: error.response?.data?.message || "Error al obtener el médico"
    });
    throw error;
  }
};
export const obtenerMedicoPorId2 = async (id) => {
  try {
    const respuesta = await api.get(`/datos/${id}`);
    console.log("Respuesta:", respuesta.data);
    return respuesta.data;
  } catch (error) {
    MySwal.fire({
      icon: "error",
      title: "Error",
      text: error.response?.data?.message || "Error al obtener el médico"
    });
    throw error;
  }
};

export const crearMedico = async (datosMedico) => {
  try {
    const respuesta = await api.post("/register/", datosMedico);
    MySwal.fire({
      icon: "success",
      title: "Éxito",
      text: respuesta.data.message
    });
    return respuesta.data;
  } catch (error) {
    MySwal.fire({
      icon: "error",
      title: "Error",
      text: error.response?.data?.message
    });
    throw error;
  }
};

export const actualizarMedico = async (id, datosMedico) => {
  try {
    const respuesta = await api.put(`/${id}`, datosMedico);
    MySwal.fire({
      icon: "success",
      title: "Éxito",
      text: respuesta.data.message
    });
    return respuesta.data;
  } catch (error) {
    MySwal.fire({
      icon: "error",
      title: "Error",
      text: error.response?.data?.message || "Error al actualizar el médico"
    });
    throw error;
  }
};

export const eliminarMedico = async (id) => {
  try {
    const respuesta = await api.delete(`/${id}`);
    MySwal.fire({
      icon: "success",
      title: "Eliminado",
      text: respuesta.data.message
    });
    return respuesta.data;
  } catch (error) {
    MySwal.fire({
      icon: "error",
      title: "Error",
      text: error.response?.data?.message || "Error al eliminar el médico"
    });
    throw error;
  }
};

export const obtenerMedicosPorEspecialidad = async (id) => {
  try {
    const respuesta = await api.get(`/especialidad/${id}`);
    return respuesta.data;
  } catch (error) {
    MySwal.fire({
      icon: "error",
      title: "Error",
      text:
        error.response?.data?.message ||
        "Error al obtener médicos por especialidad"
    });
    throw error;
  }
};

// Nueva función para obtener las especialidades por `medicoId`
export const obtenerEspecialidadesPorMedico = async (medicoId) => {
  try {
    const respuesta = await api.get(`/medicos/${medicoId}/especialidades`);
    console.log("Respuesta:", respuesta.data);
    return respuesta.data;
  } catch (error) {
    MySwal.fire({
      icon: "error",
      title: "Error",
      text:
        error.response?.data?.message ||
        "Error al obtener especialidades del médico"
    });
    console.log("Error:", error);
    throw error;
  }
};


export default api;
