import axios from "axios";
import { toast } from "react-toastify"; // Importa Toastify para el error elegante

// URL del servidor usando variable de entorno de Vite
let serverPrimary = `${
  import.meta.env.VITE_URL_MICROSERVICE_ESPECIALIDADES
}/especialidad`;

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
    console.log("Conectado al servidor:", serverPrimary);
  } else {
    console.error("El microservicio de especialidades no está disponible.");
    toast.error("El microservicio de especialidades no está disponible.", {
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

// Interceptor para añadir el token a cada solicitud
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Obtener el token del localStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    config.baseURL = serverPrimary;
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
    console.log("respuesta.data", respuesta.data);
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
