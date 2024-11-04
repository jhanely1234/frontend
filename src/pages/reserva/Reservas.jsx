import React, { useEffect, useState, useMemo } from "react";
import {
  obtenerTodasReservas,
  obtenerReservaPorId,
  actualizarReserva,
  eliminarReserva,
  confirmarReservaMedico,
  crearReserva,
  obtenerCalendario,
  calificarConsulta
} from "../../api/reservaapi";
import { obtenerHistorialPorReservaId } from "../../api/historialapi";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/auth.hook";
import { Modal, DatePicker, Select, Rate, message } from "antd";
import Fuse from "fuse.js";
import moment from "moment";
import locale from "antd/es/date-picker/locale/es_ES";
import { PDFViewer } from "@react-pdf/renderer";
import PrescriptionPDF from "./RecetaPDF";

import { confirmAlert } from "react-confirm-alert"; // Importa react-confirm-alert
import "react-confirm-alert/src/react-confirm-alert.css"; // Importa los estilos de confirmación
import { toast } from "react-toastify"; // Importa react-toastify

const { Option } = Select;

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [viewProfile, setViewProfile] = useState(false);
  const [viewReceta, setViewReceta] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [consultaDetalles, setConsultaDetalles] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReprogramModal, setShowReprogramModal] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [nuevaFechaReserva, setNuevaFechaReserva] = useState(null);
  const [nuevaHoraInicio, setNuevaHoraInicio] = useState(null);
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [calendario, setCalendario] = useState([]);
  const [reservaAReprogramar, setReservaAReprogramar] = useState(null);
  const [calificacion, setCalificacion] = useState(null);
  const [showCalificarModal, setShowCalificarModal] = useState(false);
  const [consultaId, setConsultaId] = useState(null);
  const [filtroFecha, setFiltroFecha] = useState("todas");
  const [fechaEspecifica, setFechaEspecifica] = useState(null);
  const navigate = useNavigate();
  const {
    auth: { roles, _id },
    isLoading: authLoading
  } = useAuth();

  const [filters, setFilters] = useState({
    paciente: "",
    medico: "",
    especialidad: "",
    fechaReserva: "",
    estado: ""
  });

  const fechaActual = moment().format("YYYY-MM-DD");

  useEffect(() => {
    fetchReservas();
  }, [roles, _id]);

  const fetchReservas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerTodasReservas();
      if (data.response === "success" && Array.isArray(data.citas)) {
        let filteredReservas = data.citas;

        if (roles.some((role) => role.name === "paciente")) {
          filteredReservas = filteredReservas.filter(
            (reserva) => reserva.paciente._id === _id
          );
        } else if (roles.some((role) => role.name === "medico")) {
          filteredReservas = filteredReservas.filter(
            (reserva) => reserva.medico._id === _id
          );
        }

        setReservas(filteredReservas);
      } else {
        throw new Error("Formato de respuesta inválido");
      }
    } catch (error) {
      console.error("Error fetching reservas:", error);
      setError("Error al cargar las reservas. Por favor, intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const fuse = useMemo(() => {
    return new Fuse(reservas, {
      keys: [
        "paciente.name",
        "paciente.lastname",
        "medico.name",
        "medico.lastname",
        "especialidad_solicitada.name"
      ],
      threshold: 0.3,
      includeScore: true
    });
  }, [reservas]);

  const filteredReservas = useMemo(() => {
    let result = reservas;

    if (filters.paciente || filters.medico || filters.especialidad) {
      const searchResults = fuse.search(
        filters.paciente || filters.medico || filters.especialidad
      );
      result = searchResults.map((result) => result.item);
    }

    result = result.filter(
      (reserva) =>
        (!filters.fechaReserva ||
          reserva.fechaReserva.split("T")[0] === filters.fechaReserva) &&
        (!filters.estado || reserva.estado_reserva === filters.estado)
    );

    if (roles.some((role) => role.name === "medico")) {
      switch (filtroFecha) {
        case "hoy":
          result = result.filter(
            (reserva) => reserva.fechaReserva.split("T")[0] === fechaActual
          );
          break;
        case "manana":
          const manana = moment().add(1, "days").format("YYYY-MM-DD");
          result = result.filter(
            (reserva) => reserva.fechaReserva.split("T")[0] === manana
          );
          break;
        case "proximos3dias":
          const tresDiasDespues = moment().add(3, "days").format("YYYY-MM-DD");
          result = result.filter((reserva) =>
            moment(reserva.fechaReserva.split("T")[0]).isBetween(
              fechaActual,
              tresDiasDespues,
              null,
              "[]"
            )
          );
          break;
        case "proximos7dias":
          const sieteDiasDespues = moment().add(7, "days").format("YYYY-MM-DD");
          result = result.filter((reserva) =>
            moment(reserva.fechaReserva.split("T")[0]).isBetween(
              fechaActual,
              sieteDiasDespues,
              null,
              "[]"
            )
          );
          break;
        case "fechaEspecifica":
          if (fechaEspecifica) {
            result = result.filter(
              (reserva) =>
                reserva.fechaReserva.split("T")[0] ===
                fechaEspecifica.format("YYYY-MM-DD")
            );
          }
          break;
        default:
          // No aplicar filtro adicional
          break;
      }
    }

    return result;
  }, [
    reservas,
    filters,
    fuse,
    filtroFecha,
    fechaEspecifica,
    fechaActual,
    roles
  ]);

  const handleFiltroFechaChange = (value) => {
    setFiltroFecha(value);
    if (value !== "fechaEspecifica") {
      setFechaEspecifica(null);
    }
  };

  const handleFechaEspecificaChange = (date) => {
    setFechaEspecifica(date);
    setFiltroFecha("fechaEspecifica");
  };

  const handleViewProfile = async (id) => {
    try {
      const response = await obtenerReservaPorId(id);
      if (response.response === "success" && response.cita) {
        setSelectedReserva(response.cita);
        setViewProfile(true);
      } else {
        throw new Error("Formato de respuesta inválido");
      }
    } catch (error) {
      console.error("Error fetching reserva:", error);
      setError(
        "Error al cargar los detalles de la reserva. Por favor, intente de nuevo."
      );
    }
  };

  const handleViewReceta = async (id) => {
    try {
      const response = await obtenerHistorialPorReservaId(id);
      if (response.response === "success" && response.consulta) {
        setConsultaDetalles(response.consulta);
        setViewReceta(true);
      } else {
        throw new Error("Formato de respuesta inválido");
      }
    } catch (error) {
      console.error("Error fetching historial:", error);
      setError(
        "Error al cargar los detalles de la consulta. Por favor, intente de nuevo."
      );
    }
  };

  const handleEditProfile = (id) => {
    navigate(`/reservas/editar/${id}`);
  };

  const handleDeleteReserva = async (id) => {
    confirmAlert({
      title: "Confirmar eliminación",
      message: "¿Está seguro que desea eliminar esta reserva?",
      buttons: [
        {
          label: "Sí",
          onClick: async () => {
            try {
              await eliminarReserva(id);
              setReservas(reservas.filter((reserva) => reserva._id !== id));
              toast.success("Reserva eliminada correctamente", {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
              });
            } catch (error) {
              console.error("Error al eliminar la reserva:", error);
              toast.error(
                error.response?.data?.message ||
                  "Ocurrió un error al eliminar la reserva.",
                {
                  position: "bottom-right",
                  autoClose: 5000,
                  hideProgressBar: true,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true
                }
              );
            }
          }
        },
        {
          label: "No",
          onClick: () => {
            toast.info("Eliminación cancelada", {
              position: "bottom-right",
              autoClose: 3000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true
            });
          }
        }
      ]
    });
  };

  const handleUpdateEstado = async (id, nuevoEstado) => {
    try {
      await actualizarReserva(id, { estado_reserva: nuevoEstado });
      await fetchReservas();
    } catch (error) {
      console.error("Error updating reserva:", error);
    }
  };

  const handleAtenderReserva = async (id, reserva) => {
    const fechaActual = moment();
    const fechaReserva = moment(reserva.fechaReserva);
    const horaInicioReserva = moment(reserva.horaInicio, "HH:mm");
    const horaFinReserva = moment(reserva.horaFin, "HH:mm");

    const fechaCoincide = fechaActual.isSame(fechaReserva, "day");
    const horaCoincide = fechaActual.isBetween(
      horaInicioReserva,
      horaFinReserva,
      null,
      "[)"
    );

    if (!fechaCoincide || !horaCoincide) {
      confirmAlert({
        title: "Atención fuera de horario",
        message:
          "Está intentando atender fuera de la fecha u hora de la reserva. ¿Desea continuar?",
        buttons: [
          {
            label: "Sí",
            onClick: () => navigate(`/medico/consultas/crear/${id}`)
          },
          {
            label: "No",
            onClick: () => {
              toast.info("Atención cancelada", {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
              });
            }
          }
        ]
      });
    } else {
      navigate(`/medico/consultas/crear/${id}`);
    }
  };

  const handleconfirmarReservaMedico = async (
    reservaId,
    estadoConfirmacionMedico
  ) => {
    try {
      const response = await confirmarReservaMedico(
        reservaId,
        estadoConfirmacionMedico
      );
      if (response.response === "success") {
        setReservas((prevReservas) =>
          prevReservas.map((reserva) =>
            reserva._id === reservaId
              ? {
                  ...reserva,
                  estadoConfirmacionMedico,
                  estado_reserva:
                    estadoConfirmacionMedico === "confirmado"
                      ? "pendiente"
                      : "cancelado"
                }
              : reserva
          )
        );

        if (estadoConfirmacionMedico === "cancelado") {
          const reserva = reservas.find((r) => r._id === reservaId);
          setReservaAReprogramar(reserva);
          await fetchCalendario(
            reserva.medico._id,
            reserva.especialidad_solicitada._id
          );
          setShowReprogramModal(true);
        }

        message.success(
          `Reserva ${
            estadoConfirmacionMedico === "confirmado"
              ? "confirmada"
              : "cancelada"
          } con éxito`
        );
      } else {
        throw new Error(response.message || "Error al procesar la reserva");
      }
    } catch (error) {
      console.error("Error al confirmar o cancelar la reserva:", error);
      message.error(error.message || "Error al procesar la reserva");
    }
  };

  const fetchCalendario = async (medicoId, especialidadId) => {
    try {
      const response = await obtenerCalendario(medicoId, especialidadId);
      if (response.response === "success") {
        setCalendario(response.calendario);
      } else {
        message.error("Error al obtener la disponibilidad del médico");
      }
    } catch (error) {
      console.error("Error fetching calendar:", error);
      message.error("Error al obtener el calendario");
    }
  };

  const handleDateChange = (date) => {
    const selectedDate = date.format("YYYY-MM-DD");
    setNuevaFechaReserva(selectedDate);

    const disponibilidadesDia = calendario.find(
      (dia) => dia.fecha === selectedDate
    );
    if (disponibilidadesDia) {
      const intervalosLibres = disponibilidadesDia.intervalos.filter(
        (intervalo) => intervalo.estado === "LIBRE"
      );
      setHorasDisponibles(intervalosLibres);
    } else {
      setHorasDisponibles([]);
      message.warning("No hay disponibilidad para la fecha seleccionada");
    }
  };

  const handleReprogramarReserva = async () => {
    if (!motivoCancelacion || !nuevaFechaReserva || !nuevaHoraInicio) {
      message.error("Por favor, complete todos los campos.");
      return;
    }

    try {
      const nuevaReserva = {
        pacienteId: reservaAReprogramar.paciente._id,
        medicoId: reservaAReprogramar.medico._id,
        especialidadId: reservaAReprogramar.especialidad_solicitada._id,
        fechaReserva: nuevaFechaReserva,
        horaInicio: nuevaHoraInicio,
        motivoCancelacion
      };

      await crearReserva(nuevaReserva);
      setShowReprogramModal(false);
      await fetchReservas();
      message.success("La cita ha sido reprogramada con éxito.");
    } catch (error) {
      console.error("Error al reprogramar la reserva:", error);
      message.error("Error al reprogramar la reserva.");
    }
  };

  const handleOpenCalificarModal = (consultaId) => {
    setConsultaId(consultaId);
    setShowCalificarModal(true);
  };

  const handleCalificar = async () => {
    if (!calificacion || calificacion < 1 || calificacion > 5) {
      toast.error("Por favor, selecciona una calificación entre 1 y 5", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      return;
    }

    try {
      await calificarConsulta(consultaId, calificacion);
      setShowCalificarModal(false);
      await fetchReservas();
      toast.success("Consulta calificada con éxito", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } catch (error) {
      console.error("Error al calificar:", error);
      toast.error("Error al calificar la consulta", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32  border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={fetchReservas}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  const canAddReserva = roles.some((role) =>
    ["admin", "recepcionista", "medico", "paciente"].includes(role.name)
  );

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">
        Lista de Reservas
      </h1>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        {canAddReserva && (
          <Link
            to="/reservas/nuevo"
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300 ease-in-out flex items-center text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Nueva Reserva
          </Link>
        )}
        {roles.some((role) => role.name === "medico") && (
          <div className="flex items-center space-x-2">
            <Select
              value={filtroFecha}
              onChange={handleFiltroFechaChange}
              className="w-48"
            >
              <Option value="todas">Todas las reservas</Option>
              <Option value="hoy">Reservas de hoy</Option>
              <Option value="manana">Reservas de mañana</Option>
              <Option value="proximos3dias">Próximos 3 días</Option>
              <Option value="proximos7dias">Próximos 7 días</Option>
              <Option value="fechaEspecifica">Fecha específica</Option>
            </Select>
            {filtroFecha === "fechaEspecifica" && (
              <DatePicker
                value={fechaEspecifica}
                onChange={handleFechaEspecificaChange}
                className="w-40"
              />
            )}
          </div>
        )}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full hover:bg-gray-300 transition duration-300 ease-in-out flex items-center text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
              clipRule="evenodd"
            />
          </svg>
          {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Buscar por paciente o médico"
            value={filters.paciente || filters.medico}
            onChange={(e) =>
              setFilters({
                ...filters,
                paciente: e.target.value,
                medico: e.target.value
              })
            }
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Filtrar por especialidad"
            value={filters.especialidad}
            onChange={(e) =>
              setFilters({ ...filters, especialidad: e.target.value })
            }
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filters.estado}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Filtrar por estado</option>
            <option value="pendiente">Pendiente</option>
            <option value="atendido">Atendido</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReservas.map((reserva) => (
          <div
            key={reserva._id}
            className="bg-white rounded-lg shadow-md p-4 transition duration-300 hover:shadow-lg"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-lg font-semibold text-blue-800">
                  {reserva.paciente.name} {reserva.paciente.lastname}
                </h2>
                <p className="text-sm text-gray-600">
                  {reserva.medico.name} {reserva.medico.lastname}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  reserva.estado_reserva === "atendido"
                    ? "bg-green-100 text-green-800"
                    : reserva.estado_reserva === "cancelado"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {reserva.estado_reserva}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              {reserva.especialidad_solicitada.name}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              {new Date(reserva.fechaReserva).toLocaleDateString()} -{" "}
              {reserva.horaInicio}
            </p>

            {roles.some((role) => role.name === "paciente") &&
              reserva.estado_reserva === "atendido" &&
              reserva.consulta &&
              reserva.consulta.calificacion === 0 && (
                <div className="mt-2">
                  <button
                    onClick={() =>
                      handleOpenCalificarModal(reserva.consulta._id)
                    }
                    className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300 ease-in-out w-full"
                  >
                    Calificar Consulta
                  </button>
                </div>
              )}

            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => handleViewProfile(reserva._id)}
                className="text-blue-600 hover:text-blue-800 transition duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {roles.some((role) => role.name === "paciente") && (
                <button
                  onClick={() => handleViewReceta(reserva._id)}
                  className="text-yellow-600 hover:text-yellow-800 transition duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
              {reserva.estado_reserva !== "atendido" && (
                <>
                  {roles.some(
                    (role) =>
                      role.name === "admin" || role.name === "recepcionista"
                  ) && (
                    <>
                      <button
                        onClick={() => handleEditProfile(reserva._id)}
                        className="text-green-600 hover:text-green-800 transition duration-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteReserva(reserva._id)}
                        className="text-red-600 hover:text-red-800 transition duration-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </>
                  )}

                  {roles.some((role) => role.name === "medico") && (
                    <>
                      {reserva.estadoConfirmacionMedico === "pendiente" && (
                        <>
                          <button
                            onClick={() =>
                              handleconfirmarReservaMedico(
                                reserva._id,
                                "confirmado"
                              )
                            }
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition duration-300 mr-2"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() =>
                              handleconfirmarReservaMedico(
                                reserva._id,
                                "cancelado"
                              )
                            }
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-300"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                      {reserva.estadoConfirmacionMedico === "confirmado" && (
                        <button
                          onClick={() =>
                            handleAtenderReserva(reserva._id, reserva)
                          }
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition duration-300"
                        >
                          Atender
                        </button>
                      )}
                      {reserva.estadoConfirmacionMedico === "cancelado" && (
                        <span className="text-red-500">Cancelado</span>
                      )}
                    </>
                  )}

                  {roles.some((role) => role.name === "paciente") && (
                    <>
                      {reserva.estado_reserva !== "cancelado" && (
                        <button
                          onClick={() =>
                            handleconfirmarReservaMedico(
                              reserva._id,
                              "cancelado"
                            )
                          }
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-300"
                        >
                          Cancelar
                        </button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        title="Calificar Consulta"
        visible={showCalificarModal}
        onCancel={() => setShowCalificarModal(false)}
        onOk={handleCalificar}
      >
        <p>Selecciona una calificación (1 a 5 estrellas):</p>
        <Rate
          value={calificacion}
          onChange={(value) => setCalificacion(value)}
          allowClear={false}
          count={5}
        />
      </Modal>

      {viewProfile && selectedReserva && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-blue-800">
              Detalles de la Reserva
            </h2>
            <div className="space-y-3">
              <p>
                <span className="font-semibold">Paciente:</span>{" "}
                {selectedReserva.paciente.name}{" "}
                {selectedReserva.paciente.lastname}
              </p>
              <p>
                <span className="font-semibold">Médico:</span>{" "}
                {selectedReserva.medico.name} {selectedReserva.medico.lastname}
              </p>
              <p>
                <span className="font-semibold">Especialidad:</span>{" "}
                {selectedReserva.especialidad_solicitada.name}
              </p>
              <p>
                <span className="font-semibold">Fecha de la Reserva:</span>{" "}
                {new Date(selectedReserva.fechaReserva).toLocaleDateString()}
              </p>
              <p>
                <span className="font-semibold">Hora Inicio:</span>{" "}
                {selectedReserva.horaInicio}
              </p>
              <p>
                <span className="font-semibold">Hora Fin:</span>{" "}
                {selectedReserva.horaFin}
              </p>
              <p>
                <span className="font-semibold">Estado:</span>{" "}
                {selectedReserva.estado_reserva}
              </p>
              <p>
                <span className="font-semibold">Confirmación Paciente:</span>{" "}
                {selectedReserva.estadoConfirmacionPaciente}
              </p>
              <p>
                <span className="font-semibold">Confirmación Médico:</span>{" "}
                {selectedReserva.estadoConfirmacionMedico}
              </p>
              <p>
                <span className="font-semibold">Fecha de Creación:</span>{" "}
                {new Date(selectedReserva.createdAt).toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">Última Actualización:</span>{" "}
                {new Date(selectedReserva.updatedAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setViewProfile(false)}
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300 ease-in-out w-full"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {viewReceta && consultaDetalles && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl h-5/6">
            <h2 className="text-2xl font-bold mb-4 text-blue-800">
              Receta Médica
            </h2>
            <PDFViewer width="100%" height="100%">
              <PrescriptionPDF
                doctorName={`${consultaDetalles.medico.name} ${consultaDetalles.medico.lastname}`}
                doctorCredentials={consultaDetalles.especialidad}
                patientName={consultaDetalles.paciente.nombre}
                patientAge={consultaDetalles.paciente.edad}
                patientPhone={consultaDetalles.paciente.telefono.toString()}
                date={new Date(
                  consultaDetalles.fechaConsulta
                ).toLocaleDateString()}
                weight={consultaDetalles.signos_vitales[0]?.peso || "N/A"}
                height={consultaDetalles.signos_vitales[0]?.talla || "N/A"}
                fc={consultaDetalles.signos_vitales[0]?.Fc || "N/A"}
                fr={consultaDetalles.signos_vitales[0]?.Fr || "N/A"}
                temp={consultaDetalles.signos_vitales[0]?.Temperatura || "N/A"}
                logoUrl="/logo_mediconsulta_original.png"
                prescriptionText={consultaDetalles.receta}
                diagnosis={consultaDetalles.diagnostico}
                physicalExam={consultaDetalles.examen_fisico}
                consultReason={consultaDetalles.motivo_consulta}
              />
            </PDFViewer>
            <div className="mt-6 space-y-2">
              <button
                onClick={() => setViewReceta(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300 ease-in-out w-full"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        visible={showReprogramModal}
        title="Reprogramar Reserva"
        onCancel={() => setShowReprogramModal(false)}
        onOk={handleReprogramarReserva}
        okText="Confirmar"
        cancelText="Cancelar"
      >
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">
            Motivo de Cancelación:
          </label>
          <input
            type="text"
            value={motivoCancelacion}
            onChange={(e) => setMotivoCancelacion(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese el motivo"
          />
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold mb-4">
            Seleccione nueva fecha y hora:
          </h2>
          <DatePicker
            onChange={handleDateChange}
            disabledDate={(current) => {
              const today = moment().startOf("day");
              return current && current < today;
            }}
            dateRender={(current) => {
              const dateString = current.format("YYYY-MM-DD");
              const disponibilidadesDia = calendario.find(
                (dia) => dia.fecha === dateString
              );

              const tieneDisponibilidad = disponibilidadesDia?.intervalos.some(
                (intervalo) => intervalo.estado === "LIBRE"
              );

              return (
                <div
                  className={`ant-picker-cell-inner ${
                    tieneDisponibilidad ? "bg-green-500" : "bg-red-500"
                  } text-white`}
                >
                  {current.date()}
                </div>
              );
            }}
            locale={locale}
            className="w-full"
          />
        </div>

        {horasDisponibles.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              Seleccione Nueva Hora:
            </label>
            <Select
              value={nuevaHoraInicio}
              onChange={(value) => setNuevaHoraInicio(value)}
              placeholder="Seleccione una hora"
              className="w-full"
            >
              {horasDisponibles.map((intervalo) => (
                <Option key={intervalo.inicio} value={intervalo.inicio}>
                  {intervalo.inicio}
                </Option>
              ))}
            </Select>
          </div>
        )}
      </Modal>
    </div>
  );
}
