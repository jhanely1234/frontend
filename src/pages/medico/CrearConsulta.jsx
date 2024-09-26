import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { crearConsulta, actualizarConsulta, crearReserva, obtenerCalendario, obtenerReservaPorId } from "../../api/reservaapi";
import {
  FaHeartbeat,
  FaLungs,
  FaThermometer,
  FaWeight,
  FaRulerVertical,
  FaSpinner,
  FaClock,
  FaExclamationTriangle,
  FaInfoCircle
} from "react-icons/fa";
import { DatePicker, Select, Modal, Button, message } from "antd";
import moment from "moment";
import "moment/locale/es";
import locale from 'antd/es/date-picker/locale/es_ES';

const { Option } = Select;

const CrearConsulta = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultaId, setConsultaId] = useState(null);
  const [motivoConsulta, setMotivoConsulta] = useState("");
  const [signosVitales, setSignosVitales] = useState({
    Fc: "",
    Fr: "",
    Temperatura: "",
    peso: "",
    talla: ""
  });
  const [examenFisico, setExamenFisico] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [conducta, setConducta] = useState("");
  const [receta, setReceta] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reserva, setReserva] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState({});
  const [horainicio, sethoraInicio] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showModalReconsulta, setShowModalReconsulta] = useState(false);
  const [reconsulta, setReconsulta] = useState(false);
  const [fechaReconsulta, setFechaReconsulta] = useState("");
  const [horaReconsulta, setHoraReconsulta] = useState("");
  const [calendario, setCalendario] = useState([]);
  const [horasDisponibles, setHorasDisponibles] = useState([]);

  useEffect(() => {
    const fetchReservaAndCreateConsulta = async () => {
      setIsLoading(true);
      try {
        const response = await obtenerReservaPorId(id);
        if (response.response === "success") {
          setReserva(response.cita);
          const endTime = new Date(`${response.cita.fechaReserva.split('T')[0]}T${response.cita.horaFin}:00`);
          setTimeLeft(endTime - new Date());

          const nuevaConsulta = await crearConsulta({ citaMedica: id });
          if (nuevaConsulta.response === "success" && nuevaConsulta.consulta) {
            setConsultaId(nuevaConsulta.consulta._id);
            sethoraInicio(nuevaConsulta.consulta.horaInicio);
          } else {
            throw new Error("Error al crear la consulta inicial");
          }
        } else {
          throw new Error("Formato de respuesta inválido");
        }
      } catch (error) {
        console.error("Error:", error);
        setError("Error al cargar los detalles de la reserva o crear la consulta. Por favor, intente de nuevo.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchReservaAndCreateConsulta();
    }
  }, [id]);

  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSignosVitalesChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setSignosVitales(prev => ({
        ...prev,
        [name]: value
      }));
      validateAndSuggest(name, numValue);
    }
  };

  const validateAndSuggest = (name, value) => {
    let newSuggestions = { ...suggestions };
    switch (name) {
      case "Fc":
        if (value > 100) newSuggestions.Fc = "Frecuencia cardíaca elevada. Considere taquicardia.";
        else if (value < 60) newSuggestions.Fc = "Frecuencia cardíaca baja. Considere bradicardia.";
        else delete newSuggestions.Fc;
        break;
      case "Fr":
        if (value > 20) newSuggestions.Fr = "Frecuencia respiratoria elevada. Considere taquipnea.";
        else if (value < 12) newSuggestions.Fr = "Frecuencia respiratoria baja. Considere bradipnea.";
        else delete newSuggestions.Fr;
        break;
      case "Temperatura":
        if (value > 37.5) newSuggestions.Temperatura = "Temperatura elevada. Considere fiebre.";
        else if (value < 35.5) newSuggestions.Temperatura = "Temperatura baja. Considere hipotermia.";
        else delete newSuggestions.Temperatura;
        break;
      case "peso":
        if (value > 300) newSuggestions.peso = "Peso extremadamente alto. Verifique el valor ingresado.";
        else delete newSuggestions.peso;
        break;
      case "talla":
        if (value > 250) newSuggestions.talla = "Altura extremadamente alta. Verifique el valor ingresado.";
        else delete newSuggestions.talla;
        break;
    }
    setSuggestions(newSuggestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const consultaActualizada = {
        motivo_consulta: motivoConsulta,
        signos_vitales: [{
          Fc: signosVitales.Fc,
          Fr: signosVitales.Fr,
          Temperatura: signosVitales.Temperatura,
          peso: `${signosVitales.peso}kg`,
          talla: `${signosVitales.talla}cm`
        }],
        examen_fisico: examenFisico,
        diagnostico: diagnostico,
        conducta: conducta,
        receta: receta
      };

      const response = await actualizarConsulta(consultaId, consultaActualizada);
      if (response.response === "success") {
        setShowModal(true);
      } else {
        throw new Error("Error al actualizar la consulta");
      }
    } catch (error) {
      console.error("Error al actualizar la consulta:", error);
      setError("Error al actualizar la consulta. Por favor, intente de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCalendario = async () => {
    if (reserva) {
      try {
        const response = await obtenerCalendario(reserva.medico._id, reserva.especialidad_solicitada._id);
        if (response.response === "success") {
          setCalendario(response.calendario);
        } else {
          message.error("Error al obtener la disponibilidad del médico");
        }
      } catch (error) {
        console.error("Error fetching calendar:", error);
      }
    }
  };

  useEffect(() => {
    if (showModalReconsulta && reserva) {
      fetchCalendario();
    }
  }, [showModalReconsulta, reserva]);

  const handleDateChange = (date) => {
    const selectedDate = date.format("YYYY-MM-DD");
    const disponibilidadesDia = calendario.find((dia) => dia.fecha === selectedDate);

    if (disponibilidadesDia) {
      const intervalosLibres = disponibilidadesDia.intervalos.filter(
        (intervalo) => intervalo.estado === "LIBRE"
      );
      setHorasDisponibles(intervalosLibres);
      setFechaReconsulta(selectedDate);
      setHoraReconsulta(""); // Resetear la hora cuando se selecciona una nueva fecha
    } else {
      setHorasDisponibles([]);
      message.warning("No hay disponibilidad para la fecha seleccionada");
    }
  };

  const handleHourChange = (hora) => {
    setHoraReconsulta(hora);
  };

  const handleCrearReconsulta = async () => {
    try {
      const nuevaReserva = {
        pacienteId: reserva.paciente._id,
        medicoId: reserva.medico._id,
        especialidadId: reserva.especialidad_solicitada._id,
        fechaReserva: fechaReconsulta,
        horaInicio: horaReconsulta,
      };

      const nuevaConsulta = await crearReserva(nuevaReserva);
      if (nuevaConsulta.response === "success") {
        navigate("/reservas");
      } else {
        throw new Error("Error al crear la reconsulta");
      }
    } catch (error) {
      console.error("Error al crear la reconsulta:", error);
      setError("Error al crear la reconsulta. Por favor, intente de nuevo.");
    }
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-100 text-red-700 rounded-lg shadow-lg">
        <FaExclamationTriangle className="mx-auto mb-4 h-12 w-12" />
        <p className="text-center text-lg font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-r from-purple-100 to-pink-100 shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold mb-8 text-center text-purple-800">
        Crear Consulta
      </h1>
      {reserva && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-2">Detalles de la Reserva</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>Paciente:</strong> {reserva.paciente.name} {reserva.paciente.lastname}</p>
            <p><strong>Fecha:</strong> {new Date(reserva.fechaReserva).toLocaleDateString()}</p>
            <p><strong>Hora:</strong> {reserva.horaInicio}-{reserva.horaFin}</p>
            <p><strong>Especialidad:</strong> {reserva.especialidad_solicitada.name}</p>
            <p><strong>Hora Inicio:</strong> {horainicio}</p>
          </div>
          <div className="mt-4 flex items-center justify-center bg-yellow-100 p-2 rounded-md">
            <FaClock className="text-yellow-500 mr-2" />
            <span className="font-bold">Tiempo restante: {formatTime(timeLeft)}</span>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <label
            htmlFor="motivoConsulta"
            className="block text-lg font-semibold text-purple-700 mb-2"
          >
            Motivo de la Consulta
          </label>
          <textarea
            id="motivoConsulta"
            value={motivoConsulta}
            onChange={(e) => setMotivoConsulta(e.target.value)}
            className="w-full p-3 border-2 border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={4}
            required
            placeholder="Describa el motivo de la consulta"
          ></textarea>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-purple-800 mb-4">
            Signos Vitales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Fc", label: "Frecuencia Cardiaca", icon: FaHeartbeat, unit: "lpm", color: "text-red-500" },
              { name: "Fr", label: "Frecuencia Respiratoria", icon: FaLungs, unit: "rpm", color: "text-blue-500" },
              { name: "Temperatura", label: "Temperatura", icon: FaThermometer, unit: "°C", color: "text-yellow-500" },
              { name: "peso", label: "Peso", icon: FaWeight, unit: "kg", color: "text-green-500" },
              { name: "talla", label: "Talla", icon: FaRulerVertical, unit: "cm", color: "text-indigo-500" }
            ].map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="flex items-center text-lg font-medium text-purple-700 mb-2"
                >
                  <field.icon className={`mr-2 ${field.color}`} /> {field.label}
                </label>
                <div className="relative">
                  <input
                    id={field.name}
                    name={field.name}
                    type="number"
                    value={signosVitales[field.name]}
                    onChange={handleSignosVitalesChange}
                    className="w-full p-3 pr-12 border-2 border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    min="0"
                    step={field.name === "Temperatura" || field.name === "peso" || field.name === "talla" ? "0.1" : "1"}
                    placeholder={`Ingrese ${field.label.toLowerCase()}`}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {field.unit}
                  </span>
                </div>
                {suggestions[field.name] && (
                  <p className="mt-1 text-sm text-yellow-600 flex items-center">
                    <FaInfoCircle className="mr-1" /> {suggestions[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {["examenFisico", "diagnostico", "conducta", "receta"].map((field) => (
          <div key={field} className="bg-white p-6 rounded-lg shadow-md">
            <label
              htmlFor={field}
              className="block text-lg font-semibold text-purple-700 mb-2"
            >
              {field.charAt(0).toUpperCase() +
                field
                  .slice(1)
                  .replace(/([A-Z])/g, " $1")
                  .trim()}
            </label>
            <textarea
              id={field}
              value={eval(field)}
              onChange={(e) =>
                eval(`set${field.charAt(0).toUpperCase() + field.slice(1)}`)(
                  e.target.value
                )
              }
              className="w-full p-3 border-2 border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
              required
              placeholder={`Ingrese ${field
                .replace(/([A-Z])/g, " $1")
                .toLowerCase()}`}
            ></textarea>
          </div>
        ))}

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:from-purple-600 hover:to-pink-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {isLoading ? (
              <FaSpinner className="animate-spin mx-auto h-6 w-6" />
            ) : (
              "Finalizar Consulta"
            )}
          </button>
        </div>
      </form>

      {/* Modal para la pregunta de reconsulta */}
      {showModal && (
        <Modal
          visible={showModal}
          title="¿Desea realizar una reconsulta?"
          onCancel={() => setShowModal(false)}
          footer={[
            <Button
              key="no"
              type="default"
              onClick={() => navigate("/reservas")}
            >
              No
            </Button>,
            <Button
              key="yes"
              type="primary"
              onClick={() => setShowModalReconsulta(true)}
            >
              Sí
            </Button>,
          ]}
        >
          <p>¿Desea realizar una reconsulta?</p>
        </Modal>
      )}

      {/* Modal para la reconsulta */}
      {showModalReconsulta && (
        <Modal
          visible={showModalReconsulta}
          title="Reconsulta"
          onCancel={() => setShowModalReconsulta(false)}
          onOk={handleCrearReconsulta}
          okText="Confirmar"
          cancelText="Cancelar"
        >
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={reconsulta}
                onChange={(e) => setReconsulta(e.target.checked)}
              />
              <span className="ml-2">Sí, deseo una reconsulta</span>
            </label>
          </div>

          {reconsulta && (
            <>
              <h2 className="text-xl font-bold mb-4">Seleccione fecha y hora para la reconsulta:</h2>
              <div className="mb-4">
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
                        className={`ant-picker-cell-inner ${tieneDisponibilidad ? "bg-green-500" : "bg-red-500"
                          } text-white`}
                      >
                        {current.date()}
                      </div>
                    );
                  }}
                  locale={locale}
                />
              </div>
              {horasDisponibles.length > 0 && (
                <div>
                  <Select
                    value={horaReconsulta}
                    onChange={handleHourChange}
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
            </>
          )}
        </Modal>
      )}
    </div>
  );
};

export default CrearConsulta;
