import React, { useEffect, useState, useMemo } from "react";
import {
  obtenerTodasReservas,
  obtenerReservaPorId,
  actualizarReserva,
  eliminarReserva,
  confirmarReservaMedico,
} from "../../api/reservaapi";
import { obtenerHistorialPorReservaId } from "../../api/historialapi";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/auth.hook";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Fuse from "fuse.js";

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [viewProfile, setViewProfile] = useState(false);
  const [viewReceta, setViewReceta] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [consultaDetalles, setConsultaDetalles] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

    if (filters.paciente || filters.medico || filters.especialidad) {
      const searchResults = fuse.search(
        filters.paciente || filters.medico || filters.especialidad
      );
      result = searchResults.map((result) => result.item);
    }

    return Array.isArray(result)
      ? result.filter(
          (reserva) =>
            (!filters.fechaReserva ||
              reserva.fechaReserva.split("T")[0] === filters.fechaReserva) &&
            (!filters.estado || reserva.estado_reserva === filters.estado)
        )
      : [];
  }, [reservas, filters, fuse]);

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
      const historial = await obtenerHistorialPorReservaId(id);
      setConsultaDetalles(historial.consultas[0]);
      setViewReceta(true);
    } catch (error) {
      console.error("Error fetching historial:", error);
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

  const handleAtenderReserva = async (id) => {
    navigate(`/medico/consultas/crear/${id}`);
  };

  const handleconfirmarReservaMedico = async (
    reservaId,
    estadoConfirmacionMedico
  ) => {
    console.log("Reserva a confirmar:", reservaId, estadoConfirmacionMedico);
    try {
      const response = await confirmarReservaMedico(reservaId,
        estadoConfirmacionMedico,
      );
      if (response.response === "success") {
        alert(response.message);
        await fetchReservas();
      } else {
        throw new Error(response.message || "Error al procesar la reserva");
      }
      console.log("Reserva confirmada correctamente:", response);
    } catch (error) {
      console.error("Error al confirmar o cancelar la reserva:", error);
      alert(error.message || "Error al procesar la reserva");
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const element = document.getElementById("receta-content");

    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      doc.addImage(imgData, "PNG", 10, 10);
      doc.save("receta.pdf");
    });
  };

  const handleDownloadPNG = () => {
    const element = document.getElementById("receta-content");

    html2canvas(element).then((canvas) => {
      const link = document.createElement("a");
      link.download = "receta.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
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
                          onClick={() => handleAtenderReserva(reserva._id)}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition duration-300"
                        >
                          Atender
                        </button>
                      )}
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
                </>
              )}
            </div>
          </div>
        ))}
      </div>

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
                <span className="font-semibold">Urgencia:</span>{" "}
                {selectedReserva.urgencia ? "Sí" : "No"}
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

      {viewReceta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div
            id="receta-content"
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-4 text-blue-800">
              Detalles de la Receta
            </h2>
            {consultaDetalles && (
              <div className="space-y-3">
                <p>
                  <span className="font-semibold">Paciente:</span>{" "}
                  {consultaDetalles.citaMedica.paciente.name}{" "}
                  {consultaDetalles.citaMedica.paciente.lastname}
                </p>
                <p>
                  <span className="font-semibold">Médico:</span>{" "}
                  {consultaDetalles.citaMedica.medico.name}{" "}
                  {consultaDetalles.citaMedica.medico.lastname}
                </p>
                <p>
                  <span className="font-semibold">Fecha y hora:</span>{" "}
                  {new Date(
                    consultaDetalles.citaMedica.fechaReserva
                  ).toLocaleDateString()}{" "}
                  {consultaDetalles.citaMedica.horaInicio}
                </p>
                <p>
                  <span className="font-semibold">Motivo:</span>{" "}
                  {consultaDetalles.motivo_consulta}
                </p>
                <p>
                  <span className="font-semibold">Diagnostico:</span>{" "}
                  {consultaDetalles.diagnostico}
                </p>
                <p>
                  <span className="font-semibold">Conducta:</span>{" "}
                  {consultaDetalles.conducta}
                </p>
                <p>
                  <span className="font-semibold">Especialidad:</span>{" "}
                  {consultaDetalles.citaMedica.especialidad_solicitada.name}
                </p>
                <p>
                  <span className="font-semibold">Receta:</span>{" "}
                  {consultaDetalles.receta}
                </p>
              </div>
            )}
            <div className="mt-6 space-y-2">
              <button
                onClick={handleDownloadPDF}
                className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition duration-300 ease-in-out w-full flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Descargar PDF
              </button>
              <button
                onClick={handleDownloadPNG}
                className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition duration-300 ease-in-out w-full flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Descargar PNG
              </button>
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
    </div>
  );
}
