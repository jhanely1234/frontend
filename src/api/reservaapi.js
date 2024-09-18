import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);
// URLs de los servidores usando variables de entorno de Vite
let serverPrimary = `${import.meta.env.VITE_URL_DOCKER}:3000/api/reserva`;
let serverBackup = `${import.meta.env.VITE_URL_BACKUP}/api/reserva`;
let currentServer = serverPrimary; // Servidor actual
let useBackupServer = false; // Bandera para usar el servidor de respaldo

// Crear una instancia de Axios
const api = axios.create({
  baseURL: serverPrimary,
  timeout: 10000 // Timeout de las solicitudes a 5 segundos
});

// Función para verificar la disponibilidad del servidor, considerando el token
const checkServerAvailability = async (url) => {
  const token = localStorage.getItem("token"); // Obtener el token del localStorage
  try {
    await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 20000
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

const mostrarAlerta = (tipo, mensaje) => {
  Swal.fire({
    icon: tipo, // 'success' o 'error'
    title: tipo === "error" ? "¡Error!" : "¡Éxito!",
    text: mensaje,
    confirmButtonColor: "#3085d6", // Color del botón de confirmación
    confirmButtonText: "Aceptar"
  });
};

export const obtenerDisponibilidadMedico = async (medicoId) => {
  const response = await fetch(`/api/medicos/${medicoId}/disponibilidad`);
  const data = await response.json();
  return data; // Devuel  ve un array de fechas disponibles
};

export const obtenerTodasReservas = async () => {
  try {
    const respuesta = await api.get("/");
    console.log(respuesta.data);
    return respuesta.data;
  } catch (error) {
    mostrarAlerta(
      "error",
      error.response?.data?.message || "Error al obtener reservas"
    );
    throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
  }
};

export const obtenerReservaPorId = async (id) => {
  try {
    const respuesta = await api.get(`/${id}`);
    return respuesta.data;
  } catch (error) {
    mostrarAlerta(
      "error",
      error.response?.data?.message || "Error al obtener reserva"
    );
    throw error;
  }
};

export const crearReserva = async (reserva) => {
  try {
    const respuesta = await api.post("/create", reserva);
    mostrarAlerta("success", "Reserva creada exitosamente");
    return respuesta.data;
  } catch (error) {
    mostrarAlerta(
      "error",
      error.response?.data?.message || "Error al crear reserva"
    );
    throw error;
  }
};

export const actualizarReserva = async (id, datosReserva) => {
  try {
    const respuesta = await api.put(`/${id}`, datosReserva);
    mostrarAlerta("success", "Reserva actualizada exitosamente");
    return respuesta.data;
  } catch (error) {
    mostrarAlerta(
      "error",
      error.response?.data?.message || "Error al actualizar reserva"
    );
    throw error;
  }
};

export const eliminarReserva = async (id) => {
  try {
    const respuesta = await api.delete(`/${id}`);
    mostrarAlerta("success", "Reserva eliminada exitosamente");
    return respuesta.data;
  } catch (error) {
    mostrarAlerta(
      "error",
      error.response?.data?.message || "Error al eliminar reserva"
    );
    throw error;
  }
};

export const reservarDiaLibre = async (medicoId, especialidadId) => {
  try {
    const respuesta = await api.post("/dialibre", {
      medicoId,
      especialidadId
    });
    return respuesta.data;
  } catch (error) {
    MySwal.fire({
      icon: "error",
      title: "Error",
      text: error.response?.data?.message || "Error al reservar el día libre"
    });
    throw error;
  }
};

export default api;
