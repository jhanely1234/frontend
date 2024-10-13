import axios from "axios";
import { toast } from "react-toastify"; // Importar react-toastify

// URL del servidor usando variable de entorno de Vite
let serverPrimary = `${import.meta.env.VITE_URL_MICROSERVICE_MEDICO}/medico`;
let currentServer = serverPrimary; // Servidor actual

// Crear una instancia de Axios
const api = axios.create({
  baseURL: serverPrimary,
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

// Función para inicializar la conexión al servidor
const initializeServerConnection = async () => {
  const isPrimaryAvailable = await checkServerAvailability(serverPrimary);
  if (isPrimaryAvailable) {
    console.log("Conectado al microservicio de medicos:", serverPrimary);
    currentServer = serverPrimary;
  } else {
    console.error("El microservicio de medicos no está disponible");
    toast.error(
      "El microservicio de medicos no está disponible",
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
    toast.error(
      error.response?.data?.message || "Error al obtener los médicos",
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    throw error;
  }
};

export const obtenerMedicoPorId = async (id) => {
  try {
    const respuesta = await api.get(`/${id}`);
    return respuesta.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Error al obtener el médico", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    throw error;
  }
};

export const obtenerMedicoPorId2 = async (id) => {
  try {
    const respuesta = await api.get(`/datos/${id}`);
    return respuesta.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Error al obtener el médico", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    throw error;
  }
};

export const crearMedico = async (datosMedico) => {
  try {
    const respuesta = await api.post("/register/", datosMedico);
    toast.success(respuesta.data.message, {
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
      error.response?.data?.message || "Error al registrar el médico",
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    throw error;
  }
};

export const actualizarMedico = async (id, datosMedico) => {
  try {
    const respuesta = await api.put(`/${id}`, datosMedico);
    toast.success(respuesta.data.message, {
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
      error.response?.data?.message || "Error al actualizar el médico",
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    throw error;
  }
};

export const eliminarMedico = async (id) => {
  try {
    const respuesta = await api.delete(`/${id}`);
    toast.success(respuesta.data.message, {
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
      error.response?.data?.message || "Error al eliminar el médico",
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    throw error;
  }
};

export const obtenerMedicosPorEspecialidad = async (id) => {
  try {
    const respuesta = await api.get(`/especialidad/${id}`);
    return respuesta.data;
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "Error al obtener médicos por especialidad",
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    throw error;
  }
};

export const obtenerMedicosPorEspecialidadCompleto = async (id) => {
  try {
    const respuesta = await api.get(`/especialidadcompleto/${id}`);
    return respuesta.data;
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "Error al obtener médicos por especialidad",
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    throw error;
  }
};

// Nueva función para obtener las especialidades por `medicoId`
export const obtenerEspecialidadesPorMedico = async (medicoId) => {
  try {
    const respuesta = await api.get(`/medicos/${medicoId}/especialidades`);
    return respuesta.data;
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "Error al obtener especialidades del médico",
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    throw error;
  }
};

export default api;
