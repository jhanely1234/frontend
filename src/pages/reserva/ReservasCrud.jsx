'use client'

import React, { useState, useEffect, useMemo } from "react";
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
  DatePicker,
  Tooltip,
  Input,
  Pagination,
  Switch
} from "antd";
import {
  crearReserva,
  actualizarReserva,
  obtenerReservaPorId,
  obtenerTodasReservas
} from "../../api/reservaapi";
import { obtenerTodasEspecialidades } from "../../api/especialidadesapi";
import { obtenerMedicosdeEspecialidad } from "../../api/reservaapi";
import { obtenerTodosPacientes } from "../../api/pacienteapi";
import { obtenerCalendario } from "../../api/reservaapi";
import useAuth from "../../hooks/auth.hook";
import { CalendarOutlined, ClockCircleOutlined, UserOutlined, MedicineBoxOutlined, SearchOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import locale from 'antd/es/date-picker/locale/es_ES';
import Fuse from 'fuse.js';

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
  const [pacientes, setPacientes] = useState([]);
  const [filteredPacientes, setFilteredPacientes] = useState([]);
  const [calendario, setCalendario] = useState([]);
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    moment.locale("es");
    fetchInitialData();
  }, [id, isMedico, _id]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [especialidadesData, pacientesData] = await Promise.all([
        obtenerTodasEspecialidades(),
        obtenerTodosPacientes()
      ]);

      setEspecialidades(especialidadesData.especialidades);
      setPacientes(pacientesData);
      setFilteredPacientes(pacientesData);

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
    try {
      const response = await obtenerMedicosdeEspecialidad(especialidadId);
      setMedicos(response.medicos);
    } catch (error) {
      console.error("Error fetching medicos:", error);
      message.error("Error al obtener los médicos de la especialidad");
    } finally {
      setLoading(false);
      setCurrentStep(1);
    }
  };

  const handleMedicoChange = async (medicoId) => {
    setLoading(true);
    setReserva({ ...reserva, medicoId });

    try {
      const response = await obtenerCalendario(medicoId, reserva.especialidadId);
      if (response.response === "success" && response.calendario) {
        setCalendario(response.calendario);
        setCurrentStep(2);
      } else {
        message.warning("No hay disponibilidad para el médico seleccionado");
        setCalendario([]);
      }
    } catch (error) {
      console.error("Error al obtener el calendario del médico:", error);
      message.error("Error al obtener la disponibilidad del médico");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    const selectedDate = date.format("YYYY-MM-DD");
    const diaSeleccionado = calendario.find(
      (dia) => dia.fecha === selectedDate
    );

    if (diaSeleccionado) {
      const intervalosLibres = diaSeleccionado.intervalos.filter(
        (intervalo) => intervalo.estado === "LIBRE"
      );
      setHorasDisponibles(intervalosLibres);
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
      const reservaData = {
        pacienteId: reserva.pacienteId,
        medicoId: reserva.medicoId,
        especialidadId: reserva.especialidadId,
        fechaReserva: reserva.fechaReserva,
        horaInicio: reserva.horaInicio
      };

      if (isEditing) {
        await actualizarReserva(id, reservaData);
        message.success("Reserva actualizada con éxito");
      } else {
        await crearReserva(reservaData);
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
    const fechasDisponibles = calendario.map((dia) => dia.fecha);
    return !fechasDisponibles.includes(current.format("YYYY-MM-DD"));
  };

  const dateRender = (current) => {
    const dateString = current.format("YYYY-MM-DD");
    const diaCalendario = calendario.find(
      (dia) => dia.fecha === dateString
    );

    if (!diaCalendario) {
      return (
        <Tooltip title="No disponible">
          <div
            className="ant-picker-cell-inner"
            style={{ backgroundColor: "#dc3545", color: "white" }}
          >
            {current.date()}
          </div>
        </Tooltip>
      );
    }

    const intervalosLibres = diaCalendario.intervalos.filter(
      (intervalo) => intervalo.estado === "LIBRE"
    );
    const intervalosOcupados = diaCalendario.intervalos.filter(
      (intervalo) => intervalo.estado === "OCUPADO"
    );

    if (intervalosLibres.length === 0) {
      return (
        <Tooltip title="Completamente ocupado">
          <div
            className="ant-picker-cell-inner"
            style={{ backgroundColor: "#FFCDD2", color: "black" }}
          >
            {current.date()}
          </div>
        </Tooltip>
      );
    } else if (intervalosOcupados.length > 0) {
      return (
        <Tooltip title="Parcialmente disponible">
          <div
            className="ant-picker-cell-inner"
            style={{ backgroundColor: "#ffc107", color: "black" }}
          >
            {current.date()}
          </div>
        </Tooltip>
      );
    } else {
      return (
        <Tooltip title="Totalmente disponible">
          <div
            className="ant-picker-cell-inner"
            style={{ backgroundColor: "#28a745", color: "white" }}
          >
            {current.date()}
          </div>
        </Tooltip>
      );
    }
  };

  const fuse = useMemo(() => {
    return new Fuse(pacientes, {
      keys: ['name', 'lastname'],
      threshold: 0.3,
    });
  }, [pacientes]);

  const handleSearchChange = (e) => {
    const { value } = e.target;
    setSearchTerm(value);
    if (value.trim() === '') {
      setFilteredPacientes(pacientes);
    } else {
      const results = fuse.search(value);
      setFilteredPacientes(results.map(result => result.item));
    }
    setCurrentPage(1);
  };

  const paginatedPacientes = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPacientes.slice(startIndex, startIndex + pageSize);
  }, [filteredPacientes, currentPage, pageSize]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // You would typically update your global styles here
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            {!isPaciente && (
              <div>
                <label
                  htmlFor="pacienteSearch"
                  className="block text-sm font-medium mb-1"
                >
                  Buscar Paciente:
                </label>
                <Input
                  id="pacienteSearch"
                  placeholder="Buscar por nombre o apellido"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  prefix={<SearchOutlined />}
                  className="mb-4"
                />
                <Select
                  id="pacienteId"
                  value={reserva.pacienteId}
                  onChange={(value) =>
                    setReserva({ ...reserva, pacienteId: value })
                  }
                  className="w-full"
                  placeholder="Seleccione un paciente"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {paginatedPacientes.map((paciente) => (
                    <Option key={paciente._id} value={paciente._id}>
                      {paciente.name} {paciente.lastname}
                    </Option>
                  ))}
                </Select>
                <Pagination
                  current={currentPage}
                  total={filteredPacientes.length}
                  pageSize={pageSize}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger
                  onShowSizeChange={(current, size) => setPageSize(size)}
                  className="mt-4"
                />
              </div>
            )}
            <div>
              <label
                htmlFor="especialidadId"
                className="block text-sm font-medium mb-1"
              >
                Especialidad:
              </label>
              <Select
                id="especialidadId"
                value={reserva.especialidadId}
                onChange={handleEspecialidadChange}
                className="w-full"
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
              className="block text-sm font-medium mb-1"
            >
              Médico:
            </label>
            <Select
              id="medicoId"
              value={reserva.medicoId}
              onChange={handleMedicoChange}
              className="w-full"
              placeholder="Seleccione un médico"
            >
              {medicos.map((medico) => (
                <Option key={medico.id} value={medico.id}>
                  Dr. {medico.nombre}
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
                className="block text-sm font-medium mb-1"
              >
                Fecha de Reserva:
              </label>
              <DatePicker
                id="fechaReserva"
                onChange={handleDateChange}
                className="w-full"
                disabledDate={disabledDate}
                dateRender={dateRender}
                locale={locale}
              />
              <div className="mt-4 p-4 rounded-lg bg-opacity-50 backdrop-filter backdrop-blur-lg">
                <h4 className="text-sm font-medium mb-2">Guía de colores:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="inline-block w-4 h-4 mr-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm">Verde: Día totalmente disponible</span>
                  </li>
                  <li className="flex items-center">
                    <span className="inline-block w-4 h-4 mr-2 bg-yellow-500 rounded-full"></span>
                    <span className="text-sm">Amarillo: Día parcialmente disponible</span>
                  </li>
                  <li className="flex items-center">
                    <span className="inline-block w-4 h-4 mr-2 bg-red-300 rounded-full"></span>
                    <span className="text-sm">Rojo claro: Día completamente ocupado</span>
                  </li>
                  <li className="flex items-center">
                    <span className="inline-block w-4 h-4 mr-2 bg-red-600 rounded-full"></span>
                    <span className="text-sm">Rojo oscuro: Día no disponible</span>
                  </li>
                </ul>
              </div>
            </div>
            {horasDisponibles.length > 0 && (
              <div>
                <label
                  htmlFor="horaInicio"
                  className="block text-sm font-medium mb-1"
                >
                  Hora de Inicio:
                </label>
                <Select
                  id="horaInicio"
                  value={reserva.horaInicio}
                  onChange={handleHourChange}
                  className="w-full"
                  placeholder="Seleccione una hora"
                >
                  {horasDisponibles.map((intervalo) => (
                    <Option key={intervalo.inicio} value={intervalo.inicio}>
                      {intervalo.inicio}
                    </Option>
                  ))}
                </Select>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 p-6 rounded-lg bg-opacity-50 backdrop-filter backdrop-blur-lg">
            <h3 className="text-xl font-semibold mb-4">
              Resumen de la Reserva
            </h3>
            {!isPaciente && (
              <p className="flex items-center">
                <UserOutlined className="mr-2" />
                <strong className="mr-2">Paciente:</strong>
                {pacientes.find((p) => p._id === reserva.pacienteId)?.name}{" "}
                {pacientes.find((p) => p._id === reserva.pacienteId)?.lastname}
              </p>
            )}
            <p className="flex items-center">
              <MedicineBoxOutlined className="mr-2" />
              <strong className="mr-2">Especialidad:</strong>
              {especialidades.find((e) => e._id === reserva.especialidadId)?.name}
            </p>
            <p className="flex items-center">
              <UserOutlined className="mr-2" />
              <strong className="mr-2">Médico:</strong>
              {medicos.find((m) => m.id === reserva.medicoId)?.nombre}
            </p>
            <p className="flex items-center">
              <CalendarOutlined className="mr-2" />
              <strong className="mr-2">Fecha:</strong>
              {moment(reserva.fechaReserva).format("DD/MM/YYYY")}
            </p>
            <p className="flex items-center">
              <ClockCircleOutlined className="mr-2" />
              <strong className="mr-2">Hora:</strong>
              {reserva.horaInicio}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen p-4 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Spin spinning={loading}>
        <div className="max-w-3xl mx-auto bg-opacity-80 backdrop-filter backdrop-blur-lg p-8 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">
              {isEditing ? "Editar Reserva" : "Nueva Reserva"}
            </h1>
            <Switch
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
              checked={isDarkMode}
              onChange={toggleDarkMode}
            />
          </div>
          <Steps current={currentStep} className="mb-8">
            <Step title="Paciente y Especialidad" />
            <Step title="Médico" />
            <Step title="Fecha y Hora" />
            <Step title="Confirmar" />
          </Steps>
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderStepContent(currentStep)}
            <div className="flex justify-between mt-8">
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
                <Button type="primary" htmlType="submit" className="w-full">
                  {isEditing ? "Actualizar Reserva" : "Crear Reserva"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </Spin>
    </div>
  );
}