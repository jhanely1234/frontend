import React, { useEffect, useState, useMemo } from "react";
import {
  obtenerTodasReservas,
  obtenerReservaPorId,
  actualizarReserva,
  eliminarReserva,
  confirmarReservaMedico,
  crearReserva,
  obtenerCalendario,
  calificarConsulta,
} from "../../api/reservaapi";
import { obtenerHistorialPorReservaId } from "../../api/historialapi";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/auth.hook";
import { Modal, DatePicker, Select, Rate } from "antd";
import Fuse from "fuse.js";
import moment from "moment";
import locale from "antd/es/date-picker/locale/es_ES";
import { PDFViewer } from "@react-pdf/renderer";
import PrescriptionPDF from "./RecetaPDF";

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
  const [filtroHoyActivado, setFiltroHoyActivado] = useState(false); // Estado para controlar el filtro de hoy
  const navigate = useNavigate();
  const {
    auth: { roles, _id },
    isLoading: authLoading,
  } = useAuth();

  const [filters, setFilters] = useState({
    paciente: "",
    medico: "",
    especialidad: "",
    fechaReserva: "",
    estado: "",
  });

  // Obtener la fecha actual desde el dispositivo
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
        "especialidad_solicitada.name",
      ],
      threshold: 0.3,
      includeScore: true,
    });
  }, [reservas]);

  const filteredReservas = useMemo(() => {
    let result = reservas;

    // Aplicar búsqueda por paciente, médico y especialidad con Fuse.js
    if (filters.paciente || filters.medico || filters.especialidad) {
      const searchResults = fuse.search(
        filters.paciente || filters.medico || filters.especialidad
      );
      result = searchResults.map((result) => result.item);
    }

    // Aplicar filtro de fecha y estado
    result = result.filter(
      (reserva) =>
        (!filters.fechaReserva ||
          reserva.fechaReserva.split("T")[0] === filters.fechaReserva) &&
        (!filters.estado || reserva.estado_reserva === filters.estado)
    );

    // Aplicar filtro de reservas de hoy si está activado
    if (filtroHoyActivado) {
      result = result.filter(
        (reserva) => reserva.fechaReserva.split("T")[0] === fechaActual
      );
    }

    return result;
  }, [reservas, filters, fuse, filtroHoyActivado, fechaActual]);

  const handleToggleFiltroHoy = () => {
    setFiltroHoyActivado(!filtroHoyActivado); // Alternar entre activar y desactivar el filtro
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
    if (window.confirm("¿Está seguro que desea eliminar esta reserva?")) {
      try {
        await eliminarReserva(id);
        setReservas(reservas.filter((reserva) => reserva._id !== id));
      } catch (error) {
        console.error("Error deleting reserva:", error);
      }
    }
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
    const fechaActual = moment(); // Obtener la fecha y hora actual
    const fechaReserva = moment(reserva.fechaReserva); // Fecha de la reserva
    const horaInicioReserva = moment(reserva.horaInicio, "HH:mm"); // Hora de inicio de la reserva
    const horaFinReserva = moment(reserva.horaFin, "HH:mm"); // Hora de fin de la reserva

    // Verificar si la fecha actual coincide con la fecha de la reserva
    const fechaCoincide = fechaActual.isSame(fechaReserva, 'day');

    // Verificar si la hora actual está dentro del rango de horas de la reserva
    const horaCoincide =
      fechaActual.isBetween(horaInicioReserva, horaFinReserva, null, '[)');

    if (!fechaCoincide || !horaCoincide) {
      // Mostrar advertencia si la fecha u hora no coinciden
      const continuar = window.confirm(
        "Está intentando atender fuera de la fecha u hora de la reserva. ¿Desea continuar?"
      );
      if (!continuar) {
        return; // Cancelar la acción si el usuario elige "No"
      }
    }

    // Si todo está correcto o el usuario eligió continuar, proceder a la atención
    navigate(`/medico/consultas/crear/${id}`);
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
        await fetchReservas();
        if (estadoConfirmacionMedico === "cancelado") {
          setShowReprogramModal(true);
          setReservaAReprogramar(
            reservas.find((reserva) => reserva._id === reservaId)
          );
        }
      } else {
        throw new Error(response.message || "Error al procesar la reserva");
      }
    } catch (error) {
      console.error("Error al confirmar o cancelar la reserva:", error);
      alert(error.message || "Error al procesar la reserva");
    }
  };

  const handleDateChange = async (date) => {
    const selectedDate = date.format("YYYY-MM-DD");
    setNuevaFechaReserva(selectedDate);

    try {
      const response = await obtenerCalendario(
        reservaAReprogramar.medico._id,
        reservaAReprogramar.especialidad_solicitada._id
      );
      const disponibilidadesDia = response.calendario.find(
        (dia) => dia.fecha === selectedDate
      );
      if (disponibilidadesDia) {
        const intervalosLibres = disponibilidadesDia.intervalos.filter(
          (intervalo) => intervalo.estado === "LIBRE"
        );
        setHorasDisponibles(intervalosLibres);
      } else {
        setHorasDisponibles([]);
      }
    } catch (error) {
      console.error("Error fetching calendar:", error);
    }
  };

  const handleReprogramarReserva = async () => {
    if (!motivoCancelacion || !nuevaFechaReserva || !nuevaHoraInicio) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    try {
      const nuevaReserva = {
        pacienteId: reservaAReprogramar.paciente._id,
        medicoId: reservaAReprogramar.medico._id,
        especialidadId: reservaAReprogramar.especialidad_solicitada._id,
        fechaReserva: nuevaFechaReserva,
        horaInicio: nuevaHoraInicio,
        motivoCancelacion,
      };

      await crearReserva(nuevaReserva);
      setShowReprogramModal(false);
      await fetchReservas();
      alert("La cita ha sido reprogramada con éxito.");
    } catch (error) {
      console.error("Error al reprogramar la reserva:", error);
      alert("Error al reprogramar la reserva.");
    }
  };

  const handleOpenCalificarModal = (consultaId) => {
    setConsultaId(consultaId);
    setShowCalificarModal(true);
  };

  const handleCalificar = async () => {
    if (!calificacion || calificacion < 1 || calificacion > 5) {
      alert("Por favor, selecciona una calificación entre 1 y 5");
      return;
    }

    try {
      await calificarConsulta(consultaId, calificacion);
      setShowCalificarModal(false);
      await fetchReservas();
    } catch (error) {
      console.error("Error al calificar:", error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
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

      {/* Botón para alternar el filtro de reservas del día */}
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
        <button
          onClick={handleToggleFiltroHoy}
          className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300 ease-in-out flex items-center text-sm"
        >
          {filtroHoyActivado ? "Quitar Filtro" : "Ver Reservas de Hoy"}
        </button>
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
          {/* Inputs de filtro */}
          <input
            type="text"
            placeholder="Buscar por paciente o médico"
            value={filters.paciente || filters.medico}
            onChange={(e) =>
              setFilters({
                ...filters,
                paciente: e.target.value,
                medico: e.target.value,
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
          <input
            type="date"
            value={filters.fechaReserva}
            onChange={(e) =>
              setFilters({ ...filters, fechaReserva: e.target.value })
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

      {/* Mostrar las reservas filtradas */}
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
                className={`px-2 py-1 text-xs font-semibold rounded-full ${reserva.estado_reserva === "atendido"
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
              {new Date(reserva.fechaReserva)
                .toISOString()
                .split("T")[0]
                .split("-")
                .reverse()
                .join("/")}{" "}
              - {reserva.horaInicio}
            </p>

            {/* Mostrar opción de calificar solo si existe consulta y su calificación es 0 */}
            {roles.some((role) => role.name === "paciente") &&
              reserva.estado_reserva === "atendido" &&
              reserva.consulta &&
              reserva.consulta.calificacion === 0 && (
                <div className="mt-2">
                  <button
                    onClick={() => handleOpenCalificarModal(reserva.consulta._id)}
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

                  {/* Mostrar opción de confirmar y cancelar para médico */}
                  {roles.some((role) => role.name === "medico") && (
                    <>
                      {reserva.estadoConfirmacionMedico === "pendiente" && (
                        <button
                          onClick={() =>
                            handleconfirmarReservaMedico(
                              reserva._id,
                              "confirmado"
                            )
                          }
                          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition duration-300"
                        >
                          Confirmar
                        </button>
                      )}
                      {reserva.estadoConfirmacionMedico === "confirmado" && (
                        <button
                          onClick={() => handleAtenderReserva(reserva._id, reserva)}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition duration-300"
                        >
                          Atender
                        </button>
                      )}
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

                  {/* Mostrar opción de cancelar para paciente */}
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

      {/* Modal de Calificación */}
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
                {new Date(selectedReserva.fechaReserva)
                  .toISOString()
                  .split("T")[0]
                  .split("-")
                  .reverse()
                  .join("/")}
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
                logoUrl="/public/logo_mediconsulta_original.png"
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

      {showReprogramModal && (
        <Modal
          visible={showReprogramModal}
          title="Reprogramar Reserva"
          onCancel={() => setShowReprogramModal(false)}
          onOk={handleReprogramarReserva}
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
            <label className="block text-sm font-semibold mb-2">
              Seleccione Nueva Fecha:
            </label>
            <DatePicker
              onChange={handleDateChange}
              disabledDate={(current) => {
                const today = moment().startOf("day");
                return current && current < today;
              }}
              locale={locale}
              dateRender={(current) => {
                const isAvailable = calendario.some(
                  (dia) => dia.fecha === current.format("YYYY-MM-DD")
                );
                const isUnavailable = !isAvailable;
                const style = {
                  border: `1px solid ${isUnavailable ? "red" : "green"}`,
                  borderRadius: "50%",
                };
                return (
                  <div className="ant-picker-cell-inner" style={style}>
                    {current.date()}
                  </div>
                );
              }}
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
      )}
    </div>
  );
}
