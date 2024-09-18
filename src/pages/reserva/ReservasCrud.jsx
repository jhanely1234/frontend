"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import "moment/locale/es";
import {
  Modal,
  Button,
  Select,
  Form,
  message,
  Spin,
  Steps,
  DatePicker
} from "antd";
import {
  crearReserva,
  actualizarReserva,
  obtenerReservaPorId,
  obtenerTodasReservas,
  reservarDiaLibre
} from "../../api/reservaapi";
import { obtenerTodasEspecialidades } from "../../api/especialidadesapi";
import { obtenerTodosMedicos } from "../../api/medicoapi";
import { obtenerTodosPacientes } from "../../api/pacienteapi";
import useAuth from "../../hooks/auth.hook";

const { Option } = Select;
const { Step } = Steps;

export default function ReservasCrud() {
  const {
    auth: { _id, roles }
  } = useAuth();

  const isPaciente = roles.includes("paciente");
  const isMedico = roles.includes("medico");

  const [reserva, setReserva] = useState({
    pacienteId: isPaciente ? _id : "",
    medicoId: isMedico ? _id : "",
    especialidadId: "",
    fechaReserva: "",
    horaInicio: ""
  });
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [medicosFiltrados, setMedicosFiltrados] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [disponibilidadMedico, setDisponibilidadMedico] = useState([]);
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    moment.locale("es");
    fetchInitialData();
  }, [id, isMedico, _id]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [especialidadesData, medicosData, pacientesData] =
        await Promise.all([
          obtenerTodasEspecialidades(),
          obtenerTodosMedicos(),
          obtenerTodosPacientes()
        ]);

      setEspecialidades(especialidadesData);
      setMedicos(medicosData);
      setPacientes(pacientesData);

      if (id) {
        setIsEditing(true);
        const reservaData = await obtenerReservaPorId(id);
        setReserva({
          pacienteId: reservaData.paciente._id,
          medicoId: reservaData.medico._id,
          especialidadId: reservaData.especialidad_solicitada._id,
          fechaReserva: reservaData.fechaReserva,
          horaInicio: reservaData.horaInicio
        });

        await handleEspecialidadChange(reservaData.especialidad_solicitada._id);
        await handleMedicoChange(reservaData.medico._id);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      message.error("Error al cargar los datos iniciales");
    } finally {
      setLoading(false);
    }
  };

  const handleEspecialidadChange = async (especialidadId) => {
    setLoading(true);
    setReserva({ ...reserva, especialidadId, medicoId: "" });
    const medicosFiltrados = medicos.filter((medico) =>
      medico.especialidades.some((esp) => esp._id === especialidadId)
    );
    setMedicosFiltrados(medicosFiltrados);
    setDisponibilidadMedico([]);
    setHorasDisponibles([]);
    setLoading(false);
    setCurrentStep(1);
  };

  const handleMedicoChange = async (medicoId) => {
    setLoading(true);
    setReserva({ ...reserva, medicoId });

    try {
      // Ajustamos el timeout a 10 segundos para evitar el problema de timeout
      const disponibilidad = await reservarDiaLibre(
        medicoId,
        reserva.especialidadId,
        { timeout: 20000 }
      );

      if (disponibilidad && disponibilidad.length > 0) {
        console.log("Disponibilidad del médico:", disponibilidad);
        setDisponibilidadMedico(disponibilidad);
        setCurrentStep(2);
      } else {
        message.warning("No hay disponibilidad para el médico seleccionado");
        setDisponibilidadMedico([]);
      }
    } catch (error) {
      console.error("Error al obtener la disponibilidad del médico:", error);
      message.error("Error al obtener la disponibilidad del médico");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    const selectedDate = date.format("YYYY-MM-DD");
    const diaSeleccionado = disponibilidadMedico.find(
      (dia) => dia.fecha === selectedDate
    );

    if (diaSeleccionado) {
      const horasLibres = diaSeleccionado.horas.filter(
        (hora) => hora.estado === "LIBRE"
      );
      console.log("Horas libres para la fecha seleccionada:", horasLibres);
      setHorasDisponibles(horasLibres);
      setReserva({ ...reserva, fechaReserva: selectedDate, horaInicio: "" });
    } else {
      setHorasDisponibles([]);
      message.warning("No hay disponibilidad para la fecha seleccionada");
    }
  };

  const handleHourChange = (hora) => {
    setReserva({ ...reserva, horaInicio: hora });
    setCurrentStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await actualizarReserva(id, reserva);
        message.success("Reserva actualizada con éxito");
      } else {
        await crearReserva(reserva);
        message.success("Reserva creada con éxito");
      }
      navigate("/reservas");
    } catch (error) {
      console.error("Error al guardar la reserva:", error);
      message.error("Error al guardar la reserva");
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current) => {
    const fechasDisponibles = disponibilidadMedico.map((dia) => dia.fecha);
    return !fechasDisponibles.includes(current.format("YYYY-MM-DD"));
  };

  const dateRender = (current) => {
    const dateString = current.format("YYYY-MM-DD");
    const diaDisponibilidad = disponibilidadMedico.find(
      (dia) => dia.fecha === dateString
    );

    if (!diaDisponibilidad) {
      return (
        <div
          className="ant-picker-cell-inner"
          style={{ backgroundColor: "#dc3545", color: "white" }}
        >
          {current.date()}
        </div>
      );
    }

    const horasLibres = diaDisponibilidad.horas.filter(
      (hora) => hora.estado === "LIBRE"
    );
    const horasOcupadas = diaDisponibilidad.horas.filter(
      (hora) => hora.estado === "OCUPADO"
    );

    if (horasLibres.length === 0) {
      return (
        <div
          className="ant-picker-cell-inner"
          style={{ backgroundColor: "#FFCDD2", color: "white" }}
        >
          {current.date()}
        </div>
      );
    } else if (horasOcupadas.length > 0) {
      return (
        <div
          className="ant-picker-cell-inner"
          style={{ backgroundColor: "#ffc107", color: "black" }}
        >
          {current.date()}
        </div>
      );
    } else {
      return (
        <div
          className="ant-picker-cell-inner"
          style={{ backgroundColor: "#28a745", color: "white" }}
        >
          {current.date()}
        </div>
      );
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            {!isPaciente && (
              <div>
                <label
                  htmlFor="pacienteId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Paciente:
                </label>
                <Select
                  id="pacienteId"
                  value={reserva.pacienteId}
                  onChange={(value) =>
                    setReserva({ ...reserva, pacienteId: value })
                  }
                  className="mt-1 block w-full"
                  placeholder="Seleccione un paciente"
                >
                  {pacientes.map((paciente) => (
                    <Option key={paciente._id} value={paciente._id}>
                      {paciente.name} {paciente.lastname}
                    </Option>
                  ))}
                </Select>
              </div>
            )}
            <div>
              <label
                htmlFor="especialidadId"
                className="block text-sm font-medium text-gray-700"
              >
                Especialidad:
              </label>
              <Select
                id="especialidadId"
                value={reserva.especialidadId}
                onChange={handleEspecialidadChange}
                className="mt-1 block w-full"
                placeholder="Seleccione una especialidad"
              >
                {especialidades.map((especialidad) => (
                  <Option key={especialidad._id} value={especialidad._id}>
                    {especialidad.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <label
              htmlFor="medicoId"
              className="block text-sm font-medium text-gray-700"
            >
              Médico:
            </label>
            <Select
              id="medicoId"
              value={reserva.medicoId}
              onChange={handleMedicoChange}
              className="mt-1 block w-full"
              placeholder="Seleccione un médico"
            >
              {medicosFiltrados.map((medico) => (
                <Option key={medico._id} value={medico._id}>
                  Dr. {medico.name} {medico.lastname}
                </Option>
              ))}
            </Select>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="fechaReserva"
                className="block text-sm font-medium text-gray-700"
              >
                Fecha de Reserva:
              </label>
              <DatePicker
                id="fechaReserva"
                onChange={handleDateChange}
                className="mt-1 block w-full"
                disabledDate={disabledDate}
                dateRender={dateRender}
              />
            </div>
            {horasDisponibles.length > 0 && (
              <div>
                <label
                  htmlFor="horaInicio"
                  className="block text-sm font-medium text-gray-700"
                >
                  Hora de Inicio:
                </label>
                <Select
                  id="horaInicio"
                  value={reserva.horaInicio}
                  onChange={handleHourChange}
                  className="mt-1 block w-full"
                  placeholder="Seleccione una hora"
                >
                  {horasDisponibles.map((hora) => (
                    <Option key={hora.hora} value={hora.hora}>
                      {hora.hora}
                    </Option>
                  ))}
                </Select>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              Resumen de la Reserva
            </h3>
            {!isPaciente && (
              <p>
                <strong>Paciente:</strong>{" "}
                {pacientes.find((p) => p._id === reserva.pacienteId)?.name}{" "}
                {pacientes.find((p) => p._id === reserva.pacienteId)?.lastname}
              </p>
            )}
            <p>
              <strong>Especialidad:</strong>{" "}
              {
                especialidades.find((e) => e._id === reserva.especialidadId)
                  ?.name
              }
            </p>
            <p>
              <strong>Médico:</strong>{" "}
              {medicos.find((m) => m._id === reserva.medicoId)?.name}{" "}
              {medicos.find((m) => m._id === reserva.medicoId)?.lastname}
            </p>
            <p>
              <strong>Fecha:</strong>{" "}
              {moment(reserva.fechaReserva).format("DD/MM/YYYY")}
            </p>
            <p>
              <strong>Hora:</strong> {reserva.horaInicio}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Spin spinning={loading}>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <Steps current={currentStep} className="mb-8">
            <Step title="Paciente y Especialidad" />
            <Step title="Médico" />
            <Step title="Fecha y Hora" />
            <Step title="Confirmar" />
          </Steps>

          {renderStepContent(currentStep)}

          <div className="mt-8 flex justify-between">
            {currentStep > 0 && (
              <Button onClick={() => setCurrentStep(currentStep - 1)}>
                Anterior
              </Button>
            )}
            {currentStep < 3 && (
              <Button
                type="primary"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={
                  (currentStep === 0 &&
                    (!reserva.pacienteId || !reserva.especialidadId)) ||
                  (currentStep === 1 && !reserva.medicoId) ||
                  (currentStep === 2 &&
                    (!reserva.fechaReserva || !reserva.horaInicio))
                }
              >
                Siguiente
              </Button>
            )}
            {currentStep === 3 && (
              <Button type="primary" htmlType="submit">
                {isEditing ? "Actualizar Reserva" : "Crear Reserva"}
              </Button>
            )}
          </div>
        </form>
      </Spin>
    </div>
  );
}
