import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import {
  obtenerTodasReservas,
  obtenerReservaPorId,
  actualizarReserva,
  eliminarReserva
} from "../../api/reservaapi";
import { obtenerHistorialPorReservaId } from "../../api/historialapi";
import {
  FiEye,
  FiTrash,
  FiCheckCircle,
  FiXCircle,
  FiFileText,
  FiFilter,
  FiPlus
} from "react-icons/fi";
import { BsPencil } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/auth.hook";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

Modal.setAppElement("#root");

const Reservas = () => {
  const [reservas, setReservas] = useState([]);
  const [viewProfile, setViewProfile] = useState(false);
  const [viewReceta, setViewReceta] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [consultaDetalles, setConsultaDetalles] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const {
    auth: { roles, _id },
    isLoading
  } = useAuth();

  const [filterPaciente, setFilterPaciente] = useState("");
  const [filterMedico, setFilterMedico] = useState("");
  const [filterEspecialidad, setFilterEspecialidad] = useState("");
  const [filterFechaReserva, setFilterFechaReserva] = useState("");
  const [filterEstado, setFilterEstado] = useState("");

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        let data = await obtenerTodasReservas();

        if (roles.some((role) => role.name === "admin")) {
          data = data.filter(
            (reserva) =>
              (!filterPaciente ||
                `${reserva.paciente.name} ${reserva.paciente.lastname}`
                  .toLowerCase()
                  .includes(filterPaciente.toLowerCase())) &&
              (!filterMedico ||
                `${reserva.medico.name} ${reserva.medico.lastname}`
                  .toLowerCase()
                  .includes(filterMedico.toLowerCase())) &&
              (!filterEspecialidad ||
                reserva.especialidad_solicitada.name
                  .toLowerCase()
                  .includes(filterEspecialidad.toLowerCase())) &&
              (!filterFechaReserva ||
                reserva.fechaReserva.split("T")[0] === filterFechaReserva) &&
              (!filterEstado || reserva.estado === filterEstado)
          );
          setReservas(data);
        } else if (roles.some((role) => role.name === "medico")) {
          data = data.filter(
            (reserva) =>
              reserva.medico._id === _id &&
              (!filterPaciente ||
                `${reserva.paciente.name} ${reserva.paciente.lastname}`
                  .toLowerCase()
                  .includes(filterPaciente.toLowerCase())) &&
              (!filterEspecialidad ||
                reserva.especialidad_solicitada.name
                  .toLowerCase()
                  .includes(filterEspecialidad.toLowerCase())) &&
              (!filterFechaReserva ||
                reserva.fechaReserva.split("T")[0] === filterFechaReserva) &&
              (!filterEstado || reserva.estado === filterEstado)
          );
          setReservas(data);
        } else if (roles.some((role) => role.name === "paciente")) {
          data = data.filter(
            (reserva) =>
              reserva.paciente._id === _id &&
              (!filterMedico ||
                `${reserva.medico.name} ${reserva.medico.lastname}`
                  .toLowerCase()
                  .includes(filterMedico.toLowerCase())) &&
              (!filterEspecialidad ||
                reserva.especialidad_solicitada.name
                  .toLowerCase()
                  .includes(filterEspecialidad.toLowerCase())) &&
              (!filterFechaReserva ||
                reserva.fechaReserva.split("T")[0] === filterFechaReserva) &&
              (!filterEstado || reserva.estado === filterEstado)
          );
          setReservas(data);
        } else {
          setReservas([]);
        }
      } catch (error) {
        console.error("Error fetching reservas:", error);
      }
    };
    fetchReservas();
  }, [
    roles,
    _id,
    filterPaciente,
    filterMedico,
    filterEspecialidad,
    filterFechaReserva,
    filterEstado
  ]);

  const handleViewProfile = async (id) => {
    try {
      const reserva = await obtenerReservaPorId(id);
      setSelectedReserva(reserva);
      const historial = await obtenerHistorialPorReservaId(id);
      setConsultaDetalles(historial.consultas[0]);
      setViewProfile(true);
    } catch (error) {
      console.error("Error fetching reserva or historial:", error);
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
    try {
      await eliminarReserva(id);
      setReservas(reservas.filter((reserva) => reserva._id !== id));
    } catch (error) {
      console.error("Error deleting reserva:", error);
    }
  };

  const handleUpdateEstado = async (id, nuevoEstado) => {
    try {
      await actualizarReserva(id, { estado: nuevoEstado });
      setReservas(
        reservas.map((reserva) =>
          reserva._id === id ? { ...reserva, estado: nuevoEstado } : reserva
        )
      );
      console.log("Estado actualizado:", nuevoEstado);
      return nuevoEstado;
    } catch (error) {
      console.error("Error updating reserva:", error);
    }
  };

  const handleAtenderReserva = async (id) => {
    try {
      const estado = await handleUpdateEstado(id, "atendido");
      console.log("Estado actualizado:", estado);
      if (estado === "atendido") {
        navigate(`/medico/consultas/crear/${id}`);
      } else {
        console.warn(
          "La reserva no se pudo marcar como atendida o no es el estado correcto."
        );
      }
    } catch (error) {
      console.error("Error al atender la reserva:", error);
    }
  };

  const handleConfirmCancel = async (id) => {
    const confirmCancel = window.confirm("¿ESTÁ SEGURO QUE DESEA CANCELAR?");
    if (confirmCancel) {
      await handleUpdateEstado(id, "cancelado");
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

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );

  const canAddReserva = roles.some((role) =>
    ["admin", "recepcionista", "medico", "paciente"].includes(role.name)
  );

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-purple-800">
        Lista de Reservas
      </h1>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        {canAddReserva && (
          <Link
            to="/reservas/nuevo"
            className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center text-sm"
          >
            <FiPlus className="mr-2" />
            Nueva Reserva
          </Link>
        )}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-indigo-500 text-white px-4 py-2 rounded-full hover:bg-indigo-600 transition duration-300 ease-in-out transform hover:scale-105 flex items-center text-sm"
        >
          <FiFilter className="mr-2" />
          {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="Filtrar por paciente"
            value={filterPaciente}
            onChange={(e) => setFilterPaciente(e.target.value)}
            className="w-full px-4 py-2 rounded-full border-2 border-purple-300 focus:border-purple-500 focus:outline-none transition duration-300"
          />
          <input
            type="text"
            placeholder="Filtrar por médico"
            value={filterMedico}
            onChange={(e) => setFilterMedico(e.target.value)}
            className="w-full px-4 py-2 rounded-full border-2 border-purple-300 focus:border-purple-500 focus:outline-none transition duration-300"
          />
          <input
            type="text"
            placeholder="Filtrar por especialidad"
            value={filterEspecialidad}
            onChange={(e) => setFilterEspecialidad(e.target.value)}
            className="w-full px-4 py-2 rounded-full border-2 border-purple-300 focus:border-purple-500 focus:outline-none transition duration-300"
          />
          <input
            type="date"
            value={filterFechaReserva}
            onChange={(e) => setFilterFechaReserva(e.target.value)}
            className="w-full px-4 py-2 rounded-full border-2 border-purple-300 focus:border-purple-500 focus:outline-none transition duration-300"
          />
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="w-full px-4 py-2 rounded-full border-2 border-purple-300 focus:border-purple-500 focus:outline-none transition duration-300"
          >
            <option value="">Filtrar por estado</option>
            <option value="pendiente">Pendiente</option>
            <option value="atendido">Atendido</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      )}

      <div className="space-y-4">
        {reservas.map((reserva) => (
          <div
            key={reserva._id}
            className="bg-white rounded-lg shadow-md p-4 transition duration-300 hover:shadow-lg"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-lg font-semibold text-purple-800">
                  {reserva.paciente.name} {reserva.paciente.lastname}
                </h2>
                <p className="text-sm text-gray-600">
                  {reserva.medico.name} {reserva.medico.lastname}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  reserva.estado === "atendido"
                    ? "bg-green-100 text-green-800"
                    : reserva.estado === "cancelado"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {reserva.estado}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              {reserva.especialidad_solicitada.name}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              {reserva.fechaReserva.split("T")[0]} - {reserva.horaInicio}
            </p>
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => handleViewProfile(reserva._id)}
                className="text-blue-600 hover:text-blue-800 transition duration-300"
              >
                <FiEye className="w-5 h-5" />
              </button>
              {roles.some((role) => role.name === "paciente") && (
                <button
                  onClick={() => handleViewReceta(reserva._id)}
                  className="text-yellow-600 hover:text-yellow-800 transition duration-300"
                >
                  <FiFileText className="w-5 h-5" />
                </button>
              )}
              {roles.some(
                (role) => role.name === "admin" || role.name === "recepcionista"
              ) && (
                <>
                  <button
                    onClick={() => handleEditProfile(reserva._id)}
                    className="text-green-600 hover:text-green-800 transition duration-300"
                  >
                    <BsPencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteReserva(reserva._id)}
                    className="text-red-600 hover:text-red-800 transition duration-300"
                  >
                    <FiTrash className="w-5 h-5" />
                  </button>
                </>
              )}
              {roles.some(
                (role) => role.name === "medico" || role.name === "admin"
              ) && (
                <button
                  onClick={() => handleAtenderReserva(reserva._id)}
                  className="text-green-600 hover:text-green-800 transition duration-300"
                >
                  <FiCheckCircle className="w-5 h-5" />
                </button>
              )}
              {(roles.some((role) => role.name === "medico") ||
                roles.some((role) => role.name === "paciente") ||
                roles.some((role) => role.name === "admin")) && (
                <button
                  onClick={() => handleConfirmCancel(reserva._id)}
                  className="text-red-600 hover:text-red-800 transition duration-300"
                >
                  <FiXCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={viewProfile}
        onRequestClose={() => setViewProfile(false)}
        contentLabel="Ver Perfil"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75"
      >
        <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out">
          <h2 className="text-2xl font-bold mb-4 text-purple-800">
            Detalles de la Reserva
          </h2>
          {selectedReserva && consultaDetalles && (
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
                <span className="font-semibold">Especialidad:</span>{" "}
                {consultaDetalles.citaMedica.especialidad_solicitada.name}
              </p>
              <p>
                <span className="font-semibold">Motivo de la Consulta:</span>{" "}
                {consultaDetalles.motivo_consulta}
              </p>
              <p>
                <span className="font-semibold">Receta:</span>{" "}
                {consultaDetalles.receta}
              </p>
              <p>
                <span className="font-semibold">Fecha de la Reserva:</span>{" "}
                {consultaDetalles.citaMedica.fechaReserva.split("T")[0]}
              </p>
              <p>
                <span className="font-semibold">Hora Inicio:</span>{" "}
                {consultaDetalles.citaMedica.horaInicio}
              </p>
              <p>
                <span className="font-semibold">Hora Fin:</span>{" "}
                {consultaDetalles.citaMedica.horaFin}
              </p>
              <p>
                <span className="font-semibold">Estado:</span>{" "}
                {consultaDetalles.citaMedica.estado}
              </p>
            </div>
          )}
          <button
            onClick={() => setViewProfile(false)}
            className="mt-6 bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105 w-full"
          >
            Cerrar
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={viewReceta}
        onRequestClose={() => setViewReceta(false)}
        contentLabel="Ver Receta"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75"
      >
        <div
          id="receta-content"
          className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out"
        >
          <h2 className="text-2xl font-bold mb-4 text-purple-800">
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
                {consultaDetalles.citaMedica.fechaReserva.split("T")[0]}{" "}
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
              className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 w-full"
            >
              Descargar PDF
            </button>
            <button
              onClick={handleDownloadPNG}
              className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition duration-300 ease-in-out transform hover:scale-105 w-full"
            >
              Descargar PNG
            </button>
            <button
              onClick={() => setViewReceta(false)}
              className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105 w-full"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reservas;
