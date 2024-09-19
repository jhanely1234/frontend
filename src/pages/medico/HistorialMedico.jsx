import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { obtenerHistorialPorPaciente } from "../../api/historialapi";
import { obtenerPacientePorId } from "../../api/pacienteapi";
import { PDFDownloadLink } from '@react-pdf/renderer';
import HistorialMedicoPDF from './HistorialMedicoPDF';

const HistorialMedico = () => {
  const { pacienteId } = useParams();
  const [historial, setHistorial] = useState(null);
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredConsultas, setFilteredConsultas] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  const Button = ({ children, ...props }) => (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      {...props}
    >
      {children}
    </button>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historialData, pacienteData] = await Promise.all([
          obtenerHistorialPorPaciente(pacienteId),
          obtenerPacientePorId(pacienteId)
        ]);
        setHistorial(historialData);
        setPaciente(pacienteData);
        setFilteredConsultas(sortConsultasByDate(historialData.consultas));
      } catch (error) {
        setError("Error al cargar los datos");
        Swal.fire("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pacienteId]);

  const sortConsultasByDate = (consultas) => {
    return [...consultas].sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
  };

  const filterConsultas = () => {
    if (!historial) return [];
    
    let filtered = historial.consultas;

    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(consulta => {
        const consultaDate = new Date(consulta.fechaHora);
        return consultaDate >= new Date(dateRange.start) && consultaDate <= new Date(dateRange.end);
      });
    }

    if (selectedSpecialty) {
      filtered = filtered.filter(consulta => 
        consulta.citaMedica.especialidad_solicitada.name === selectedSpecialty
      );
    }

    return sortConsultasByDate(filtered);
  };

  useEffect(() => {
    setFilteredConsultas(filterConsultas());
  }, [dateRange, selectedSpecialty, historial]);

  if (loading) {
    return <div className="text-center text-gray-500">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!historial || !paciente) {
    return (
      <div className="text-center text-gray-500">
        No se encontró el historial médico o los datos del paciente.
      </div>
    );
  }

  const specialties = [...new Set(historial.consultas.map(consulta => consulta.citaMedica.especialidad_solicitada.name))];

  return (
    <div className="min-h-screen bg-blue-50 p-4 md:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-800 text-center">
          Historial Médico
        </h1>
        <div className="mb-6 text-center">
          <PDFDownloadLink 
            document={<HistorialMedicoPDF paciente={paciente} historial={historial} />} 
            fileName="historial_medico.pdf"
          >
            {({ blob, url, loading, error }) =>
              loading ? 'Generando PDF...' : (
                <Button>
                  Descargar PDF
                </Button>
              )
            }
          </PDFDownloadLink>
        </div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b-2 pb-2">
          Información del Paciente
        </h2>
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-2">
              <label className="block text-gray-800 font-bold mb-1">Nombre:</label>
              <p className="bg-blue-100 text-gray-800 p-2 rounded">{paciente.name} {paciente.lastname}</p>
            </div>
            <div className="mb-2">
              <label className="block text-gray-800 font-bold mb-1">Email:</label>
              <p className="bg-blue-100 text-gray-800 p-2 rounded">{paciente.email}</p>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b-2 pb-2">
          Consultas
        </h2>
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-800 font-bold mb-1">Fecha Inicio:</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-800 font-bold mb-1">Fecha Fin:</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-800 font-bold mb-1">Especialidad:</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Todas las especialidades</option>
                {specialties.map((specialty, index) => (
                  <option key={index} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {filteredConsultas.length === 0 ? (
          <p className="text-gray-500">No hay consultas registradas.</p>
        ) : (
          <ul>
            {filteredConsultas.map((consulta, index) => (
              <li
                key={index}
                className="mb-8 p-6 border-2 border-blue-200 rounded-lg bg-blue-50 shadow-sm"
              >
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Consulta {index + 1} - {new Date(consulta.fechaHora).toLocaleDateString()}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-800 font-bold mb-2">Médico:</label>
                    <p className="bg-blue-200 text-gray-800 p-2 rounded">
                      {consulta.citaMedica.medico.name} {consulta.citaMedica.medico.lastname}
                    </p>
                  </div>
                  <div>
                    <label className="block text-gray-800 font-bold mb-2">Especialidad:</label>
                    <p className="bg-blue-200 text-gray-800 p-2 rounded">
                      {consulta.citaMedica.especialidad_solicitada.name}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-800 font-bold mb-2">Motivo de Consulta:</label>
                    <p className="bg-blue-200 text-gray-800 p-2 rounded">{consulta.motivo_consulta || 'No especificado'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-800 font-bold mb-2">Signos Vitales:</label>
                    {consulta.signos_vitales.length === 0 ? (
                      <p className="text-gray-500">No se registraron signos vitales.</p>
                    ) : (
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {consulta.signos_vitales.map((signos, index) => (
                          <li key={index} className="bg-blue-200 p-2 rounded">
                            <p>
                              <strong>Frecuencia Cardíaca (Fc):</strong> {signos.Fc} bpm
                            </p>
                            <p>
                              <strong>Frecuencia Respiratoria (Fr):</strong> {signos.Fr} /min
                            </p>
                            <p>
                              <strong>Temperatura:</strong> {signos.Temperatura} °C
                            </p>
                            <p>
                              <strong>Peso:</strong> {signos.peso}
                            </p>
                            <p>
                              <strong>Talla:</strong> {signos.talla}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-800 font-bold mb-2">Examen Físico:</label>
                    <p className="bg-blue-200 text-gray-800 p-2 rounded">{consulta.examen_fisico || 'No especificado'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-800 font-bold mb-2">Diagnóstico:</label>
                    <p className="bg-blue-200 text-gray-800 p-2 rounded">{consulta.diagnostico || 'No especificado'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-800 font-bold mb-2">Tratamiento:</label>
                    <p className="bg-blue-200 text-gray-800 p-2 rounded">{consulta.receta || 'No especificado'}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HistorialMedico;