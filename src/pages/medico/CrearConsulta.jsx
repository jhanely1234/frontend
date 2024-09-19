import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { crearConsulta, actualizarConsulta } from "../../api/reservaapi";
import { obtenerReservaPorId } from "../../api/reservaapi";
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
  const [horainicio,sethoraInicio] = useState("");

  useEffect(() => {
    const fetchReservaAndCreateConsulta = async () => {
      setIsLoading(true);
      try {
        const response = await obtenerReservaPorId(id);
        if (response.response === "success" ) {
          setReserva(response.cita);
          const endTime = new Date(`${response.cita.fechaReserva.split('T')[0]}T${response.cita.horaFin}:00`);
          setTimeLeft(endTime - new Date());

          // Create initial consultation
          const nuevaConsulta = await crearConsulta({ citaMedica: id });
          if (nuevaConsulta.response === "success" && nuevaConsulta.consulta) {
            setConsultaId(nuevaConsulta.consulta._id);
            sethoraInicio(nuevaConsulta.consulta.horaInicio)

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
        navigate("/reservas");
      } else {
        throw new Error("Error al actualizar la consulta");
      }
    } catch (error) {
      console.error("Error al actualizar la consulta:", error);
      setError("Error al actualizar la consulta. Por favor, intente de nuevo.");
      mostrarAlerta("error", "Error al actualizar la consulta");
    } finally {
      setIsLoading(false);
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
              "Actualizar Consulta"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearConsulta;