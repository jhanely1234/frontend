import React, { useState, useEffect, useRef } from "react";
import { obtenerResumenReservas } from "../../api/reportesApi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ResumenReservas = () => {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMedico, setSelectedMedico] = useState("");
  const [selectedEspecialidad, setSelectedEspecialidad] = useState("");
  const [selectedPaciente, setSelectedPaciente] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");
  const resumenRef = useRef();

  useEffect(() => {
    const fetchResumen = async () => {
      setLoading(true);
      try {
        const datosResumen = await obtenerResumenReservas();
        setResumen(datosResumen);
      } catch (error) {
        setError("Error al cargar el resumen de reservas.");
      } finally {
        setLoading(false);
      }
    };

    fetchResumen();
  }, []);

  const handleDownloadPDF = () => {
    const input = resumenRef.current;
    html2canvas(input, { scale: 3 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("resumen_reservas.pdf");
    });
  };

  const handleMedicoChange = (e) => {
    setSelectedMedico(e.target.value);
  };

  const handleEspecialidadChange = (e) => {
    setSelectedEspecialidad(e.target.value);
  };

  const handlePacienteChange = (e) => {
    setSelectedPaciente(e.target.value);
  };

  const handleEstadoChange = (e) => {
    setSelectedEstado(e.target.value);
  };

  const filteredResumen = resumen
    ? {
        ...resumen,
        reservasPorMedicoYEspecialidad: resumen.reservasPorMedicoYEspecialidad
          .filter((detalle) =>
            selectedMedico === "" || `${detalle.medico.name} ${detalle.medico.lastname}` === selectedMedico
          )
          .filter((detalle) =>
            detalle.especialidades.some(
              (especialidad) =>
                selectedEspecialidad === "" || especialidad.especialidad.name === selectedEspecialidad
            )
          ),
        reservasPorPaciente: resumen.reservasPorMedicoYEspecialidad
          .flatMap((detalle) =>
            detalle.especialidades.map((especialidad) => ({
              ...detalle,
              especialidad,
            }))
          )
          .filter((detalle) =>
            selectedPaciente === "" || `${detalle.paciente.name} ${detalle.paciente.lastname}` === selectedPaciente
          ),
        reservasPorEstado: resumen.reservasPorMedicoYEspecialidad
          .flatMap((detalle) =>
            detalle.especialidades.map((especialidad) => ({
              ...detalle,
              especialidad,
            }))
          )
          .filter((detalle) => selectedEstado === "" || detalle.estado === selectedEstado),
      }
    : null;

  if (loading) return <div className="text-center text-gray-600">Cargando...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-700 mb-6">Resumen de Reservas</h1>
      <button
        onClick={handleDownloadPDF}
        className="mb-4 px-4 py-2 bg-blue-300 text-white rounded shadow hover:bg-blue-400"
      >
        Descargar PDF
      </button>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Filtrar por Médico:</label>
        <select
          value={selectedMedico}
          onChange={handleMedicoChange}
          className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Todos</option>
          {resumen &&
            resumen.reservasPorMedicoYEspecialidad.map((detalle, index) => (
              <option key={index} value={`${detalle.medico.name} ${detalle.medico.lastname}`}>
                {detalle.medico.name} {detalle.medico.lastname}
              </option>
            ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Filtrar por Especialidad:</label>
        <select
          value={selectedEspecialidad}
          onChange={handleEspecialidadChange}
          className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Todas</option>
          {resumen &&
            resumen.reservasPorMedicoYEspecialidad.flatMap((detalle) =>
              detalle.especialidades.map((especialidad) => (
                <option key={especialidad.especialidad._id} value={especialidad.especialidad.name}>
                  {especialidad.especialidad.name}
                </option>
              ))
            )}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Filtrar por Paciente:</label>
        <input
          type="text"
          value={selectedPaciente}
          onChange={handlePacienteChange}
          placeholder="Nombre del paciente"
          className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Filtrar por Estado:</label>
        <select
          value={selectedEstado}
          onChange={handleEstadoChange}
          className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Todos</option>
          <option value="Atendida">Atendida</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Cancelada">Cancelada</option>
        </select>
      </div>

      {filteredResumen && (
        <div ref={resumenRef} className="bg-white shadow-lg rounded-lg p-6">
          <div className="mb-8">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-3 px-6 bg-blue-100 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Información General
                  </th>
                  <th className="py-3 px-6 bg-blue-100 text-left text-sm font-medium text-gray-700 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 px-6 border-b border-gray-200">Total Reservas</td>
                  <td className="py-3 px-6 border-b border-gray-200">{filteredResumen.totalReservas}</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-b border-gray-200">Reservas Atendidas</td>
                  <td className="py-3 px-6 border-b border-gray-200">{filteredResumen.reservasAtendidas}</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-b border-gray-200">Reservas Canceladas</td>
                  <td className="py-3 px-6 border-b border-gray-200">{filteredResumen.reservasCanceladas}</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-b border-gray-200">Reservas Pendientes</td>
                  <td className="py-3 px-6 border-b border-gray-200">{filteredResumen.reservasPendientes}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold text-gray-700 mt-8 mb-4">Reservas por Médico y Especialidad</h2>
          {filteredResumen.reservasPorMedicoYEspecialidad.length > 0 ? (
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-3 px-6 bg-blue-100 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Médico
                  </th>
                  <th className="py-3 px-6 bg-blue-100 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Especialidad
                  </th>
                  <th className="py-3 px-6 bg-blue-100 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Total Reservas
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredResumen.reservasPorMedicoYEspecialidad.map((detalle, index) => (
                  <React.Fragment key={index}>
                    {detalle.especialidades.map((especialidad, i) => (
                      <tr key={i} className="hover:bg-blue-50">
                        {i === 0 && (
                          <td
                            rowSpan={detalle.especialidades.length}
                            className="py-3 px-6 border-b border-gray-200 font-medium text-gray-700"
                          >
                            {detalle.medico.name} {detalle.medico.lastname}
                          </td>
                        )}
                        <td className="py-3 px-6 border-b border-gray-200">{especialidad.especialidad.name}</td>
                        <td className="py-3 px-6 border-b border-gray-200">{especialidad.totalReservas}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600 mt-4">No hay datos disponibles.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumenReservas;
