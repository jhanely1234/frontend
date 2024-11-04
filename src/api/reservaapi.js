import axios from "axios";
import { toast } from "react-toastify"; // Importar react-toastify

// URLs de los servidores usando variables de entorno de Vite
let serverPrimary = `${import.meta.env.VITE_URL_MICROSERVICE_RESERVA}/reserva`;
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
    console.log("Conectado al microservicio de reservas:", serverPrimary);
    currentServer = serverPrimary;
  } else {
    console.error("El microservicio de reservas no está disponible.");
    toast.error(
      "El microservicio de reservas no está disponible.",
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

// Función para mostrar alertas usando toast
const mostrarToast = (tipo, mensaje) => {
  if (tipo === "success") {
    toast.success(mensaje, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  } else {
    toast.error(mensaje, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }
};

// Funciones CRUD para reservas

export const obtenerTodasReservas = async () => {
  try {
    const respuesta = await api.get("/");
    return respuesta.data;
  } catch (error) {
    mostrarToast(
      "error",
      error.response?.data?.message || "Error al obtener reservas"
    );
    throw error;
  }
};

export const obtenerReservaPorId = async (id) => {
  try {
    const respuesta = await api.get(`/${id}`);
    return respuesta.data;
  } catch (error) {
    mostrarToast(
      "error",
      error.response?.data?.message || "Error al obtener reserva"
    );
    throw error;
  }
};

export const crearReserva = async (reserva) => {
  try {
    const respuesta = await api.post("/create", reserva);
    mostrarToast("success", "Reserva creada exitosamente");
    return respuesta.data;
  } catch (error) {
    mostrarToast(
      "error",
      error.response?.data?.message || "Error al crear reserva"
    );
    throw error;
  }
};

export const actualizarReserva = async (id, datosReserva) => {
  try {
    const respuesta = await api.put(`/${id}`, datosReserva);
    mostrarToast("success", "Reserva actualizada exitosamente");
    return respuesta.data;
  } catch (error) {
    mostrarToast(
      "error",
      error.response?.data?.message || "Error al actualizar reserva"
    );
    throw error;
  }
};

export const eliminarReserva = async (id) => {
  try {
    const respuesta = await api.delete(`/${id}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Nueva API: Obtener disponibilidad de un médico en función de su especialidad
export const obtenerCalendario = async (medicoId, especialidadId) => {
  try {
    const respuesta = await api.get(
      `/medico/calendario/${medicoId}/${especialidadId}`
    );
    return respuesta.data;
  } catch (error) {
    mostrarToast(
      "error",
      error.response?.data?.message ||
      "Error al obtener la disponibilidad del médico"
    );
    throw error;
  }
};

// Nueva API: Obtener los médicos de una especialidad
export const obtenerMedicosdeEspecialidad = async (especialidadId) => {
  try {
    const respuesta = await api.get(`/medico/especialidad/${especialidadId}`);
    return respuesta.data;
  } catch (error) {
    mostrarToast(
      "error",
      error.response?.data?.message ||
      "Error al obtener los médicos de la especialidad"
    );
    throw error;
  }
};

// Nueva API: Actualizar una consulta
export const actualizarConsulta = async (idconsulta, consulta) => {
  try {
    const respuesta = await api.put(`/consulta/${idconsulta}`, consulta);
    mostrarToast("success", "Consulta actualizada exitosamente");
    return respuesta.data;
  } catch (error) {
    mostrarToast(
      "error",
      error.response?.data?.message || "Error al actualizar la consulta"
    );
    throw error;
  }
};

// Nueva API: Crear una consulta
export const crearConsulta = async (consulta) => {
  try {
    const respuesta = await api.post("/consulta/create", consulta);
    mostrarToast("success", "Consulta creada exitosamente");
    return respuesta.data;
  } catch (error) {
    mostrarToast(
      "error",
      error.response?.data?.message || "Error al crear la consulta"
    );
    throw error;
  }
};

// Nueva API: Calificar consulta
export const calificarConsulta = async (consultaId, calificacion) => {
  try {
    const respuesta = await api.post("/consulta/calificar", {
      consultaId,
      calificacion,
    });
    mostrarToast("success", "Consulta calificada exitosamente");
    return respuesta.data;
  } catch (error) {
    mostrarToast(
      "error",
      error.response?.data?.message || "Error al calificar la consulta"
    );
    throw error;
  }
};


// Nueva API: Confirmar la reserva del médico
export const confirmarReservaMedico = async (
  reservaId,
  estadoConfirmacionMedico
) => {
  try {
    const respuesta = await api.put(`/${reservaId}/confirmacion`, {
      estadoConfirmacionMedico,
    });
    mostrarToast("success", "Reserva confirmada exitosamente");
    return respuesta.data;
  } catch (error) {
    mostrarToast(
      "error",
      error.response?.data?.message || "Error al confirmar la reserva"
    );
    throw error;
  }
};

export default api;
