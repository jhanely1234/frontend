import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { crearConsulta } from "../../api/historialapi";
import {
  FaHeartbeat,
  FaLungs,
  FaThermometer,
  FaWeight,
  FaRulerVertical,
  FaSpinner
} from "react-icons/fa";

const CrearConsulta = () => {
  const { id } = useParams();
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
  const navigate = useNavigate();

  const handleSignosVitalesChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setSignosVitales({
        ...signosVitales,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const nuevaConsulta = {
        citaMedicaId: id,
        motivo_consulta: motivoConsulta,
        signos_vitales: [signosVitales],
        examen_fisico: examenFisico,
        diagnostico: diagnostico,
        conducta: conducta,
        receta: receta
      };

      await crearConsulta(nuevaConsulta);
      navigate("/reservas");
    } catch (error) {
      console.error("Error al crear la consulta:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-r from-purple-100 to-pink-100 shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold mb-8 text-center text-purple-800">
        Crear Consulta
      </h1>
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
            <div>
              <label
                htmlFor="Fc"
                className="flex items-center text-lg font-medium text-purple-700 mb-2"
              >
                <FaHeartbeat className="mr-2 text-red-500" /> Frecuencia
                Cardiaca (Fc)
              </label>
              <input
                id="Fc"
                name="Fc"
                type="number"
                value={signosVitales.Fc}
                onChange={handleSignosVitalesChange}
                className="w-full p-3 border-2 border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                min="0"
                placeholder="Latidos por minuto"
              />
            </div>
            <div>
              <label
                htmlFor="Fr"
                className="flex items-center text-lg font-medium text-purple-700 mb-2"
              >
                <FaLungs className="mr-2 text-blue-500" /> Frecuencia
                Respiratoria (Fr)
              </label>
              <input
                id="Fr"
                name="Fr"
                type="number"
                value={signosVitales.Fr}
                onChange={handleSignosVitalesChange}
                className="w-full p-3 border-2 border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                min="0"
                placeholder="Respiraciones por minuto"
              />
            </div>
            <div>
              <label
                htmlFor="Temperatura"
                className="flex items-center text-lg font-medium text-purple-700 mb-2"
              >
                <FaThermometer className="mr-2 text-yellow-500" /> Temperatura
                en ºC
              </label>
              <input
                id="Temperatura"
                name="Temperatura"
                type="number"
                value={signosVitales.Temperatura}
                onChange={handleSignosVitalesChange}
                className="w-full p-3 border-2 border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                min="0"
                step="0.1"
                placeholder="Temperatura en grados Celsius"
              />
            </div>
            <div>
              <label
                htmlFor="peso"
                className="flex items-center text-lg font-medium text-purple-700 mb-2"
              >
                <FaWeight className="mr-2 text-green-500" /> Peso en Kg.
              </label>
              <input
                id="peso"
                name="peso"
                type="number"
                value={signosVitales.peso}
                onChange={handleSignosVitalesChange}
                className="w-full p-3 border-2 border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                min="0"
                step="0.1"
                placeholder="Peso en kilogramos"
              />
            </div>
            <div>
              <label
                htmlFor="talla"
                className="flex items-center text-lg font-medium text-purple-700 mb-2"
              >
                <FaRulerVertical className="mr-2 text-indigo-500" /> Talla en
                Cm.
              </label>
              <input
                id="talla"
                name="talla"
                type="number"
                value={signosVitales.talla}
                onChange={handleSignosVitalesChange}
                className="w-full p-3 border-2 border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                min="0"
                step="0.1"
                placeholder="Altura en centímetros"
              />
            </div>
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
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:from-purple-600 hover:to-pink-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            {isLoading ? (
              <FaSpinner className="animate-spin mx-auto h-6 w-6" />
            ) : (
              "Crear Consulta"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearConsulta;
