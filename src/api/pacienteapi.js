import axios from "axios";
import { toast } from "react-toastify"; // Importar react-toastify

// URL del servidor usando variable de entorno de Vite
let serverPrimary = `${import.meta.env.VITE_URL_MICROSERVICE_PACIENTE}/paciente`;
let currentServer = serverPrimary; // Servidor actual

// Crear una instancia de Axios
const api = axios.create({
  baseURL: serverPrimary,
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
    console.log("Conectado al microservicio de pacientes", serverPrimary);
    currentServer = serverPrimary;
  } else {
    console.error("El microservicio de pacientes no está disponible.");
    toast.error(
      "El microservicio de pacientes no está disponible.",
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

// Funciones CRUD para pacientes
export const obtenerTodosPacientes = async () => {
  try {
    const respuesta = await api.get("/");
    return respuesta.data;
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Error al obtener los pacientes",
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

export const obtenerPacientePorId = async (id) => {
  try {
    const respuesta = await api.get(`/${id}`);
    return respuesta.data;
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Error al obtener el paciente",
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

export const crearPaciente = async (datosPaciente) => {
  try {
    const respuesta = await api.post("/create/", datosPaciente);
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
      error.response?.data?.message || "Ocurrió un error al crear el paciente.",
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

export const actualizarPaciente = async (id, datosPaciente) => {
  try {
    const respuesta = await api.put(`/${id}`, datosPaciente);
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
      error.response?.data?.message ||
        "Ocurrió un error al actualizar el paciente.",
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

export const eliminarPaciente = async (id) => {
  const confirmacion = window.confirm(
    "¿Estás seguro de que quieres eliminar este paciente? ¡Esta acción no se puede deshacer!"
  );

  if (confirmacion) {
    try {
      const respuesta = await api.delete(`/${id}`);
      toast.success("Paciente eliminado correctamente", {
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
          "Ocurrió un error al eliminar el paciente.",
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
  }
};

export default api;
