import React, { useState, useEffect } from 'react';
import { obtenerTodasEspecialidades } from '../../api/especialidadesapi';
import { obtenerMedicosPorEspecialidadCompleto } from '../../api/medicoapi';
import { Star, Calendar, Phone, Mail, X, User, Award, Clock, MapPin, Stethoscope, Heart, Brain, Bone, Eye, } from 'lucide-react';

export default function UpdatedHospitalWelcome() {
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [selectedEspecialidad, setSelectedEspecialidad] = useState(null);
  const [loadingMedicos, setLoadingMedicos] = useState(false);
  const [selectedMedico, setSelectedMedico] = useState(null);

  const hospitalInfo = {
    name: "Clinica MediConsulta",
    founded: 2019,
    mission: "Brindar atención médica de calidad con compasión y excelencia.",
  };

  const especialidadIcons = {
    "Cardiologia": Heart,
    "Neurologia": Brain,
    "Traumatologia": Bone,
    "Oftalmologia": Eye,
    "Odontologia": Stethoscope,
    "default": Stethoscope
  };

  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const response = await obtenerTodasEspecialidades();
        setEspecialidades(response.especialidades);
      } catch (error) {
        console.error('Error al obtener las especialidades:', error);
      }
    };
    fetchEspecialidades();
  }, []);

  const handleEspecialidadClick = async (especialidad) => {
    setSelectedEspecialidad(especialidad);
    setLoadingMedicos(true);
    try {
      const response = await obtenerMedicosPorEspecialidadCompleto(especialidad._id);
      setMedicos(response.medicos);
    } catch (error) {
      console.error('Error al obtener los médicos:', error);
    } finally {
      setLoadingMedicos(false);
    }
  };

  const renderDisponibilidad = (disponibilidades, especialidad) => {
    const turnosAgrupados = {};

    disponibilidades.forEach((disp) => {
      const key = `${disp.inicio}-${disp.fin}-${disp.turno}`;
      if (!turnosAgrupados[key]) {
        turnosAgrupados[key] = [];
      }
      turnosAgrupados[key].push(disp.dia);
    });

    return Object.keys(turnosAgrupados).map((key, index) => {
      const [inicio, fin, turno] = key.split('-');
      const dias = turnosAgrupados[key];
      return (
        <li key={index} className="mb-2 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0" />
          <span className="font-medium">{dias.length > 1 ? `${dias[0]} - ${dias[dias.length - 1]}` : dias[0]}</span>
          <span className="ml-2">{inicio} - {fin}</span>
          <span className="ml-2 text-blue-600 font-medium">({turno})</span>
        </li>
      );
    });
  };

  const renderCalificacion = (calificacion) => {
    if (calificacion === 'No calificado') {
      return <span className="text-gray-500">Sin calificación</span>;
    }

    const estrellas = parseFloat(calificacion);
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${i < estrellas ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-2 text-gray-700">{calificacion}</span>
      </div>
    );
  };

  return (
    <div className="font-sans bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-8">
      <main className="max-w-6xl mx-auto">
        <section className="text-center mb-16 flex flex-col items-center">
          <img
            src="/public/logo_mediconsulta_original.png"
            alt="Logo de Clinica MediConsulta"
            className="w-32 h-32 mb-4"
          />
          <h1 className="text-4xl font-bold text-blue-800 mb-4">
            {hospitalInfo.name}
          </h1>
          <p className="text-xl text-indigo-700 max-w-3xl mx-auto">
            Desde {hospitalInfo.founded}, estamos comprometidos con {hospitalInfo.mission}
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-blue-800 mb-8 text-center">
            Nuestras Especialidades
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {especialidades.length > 0 ? (
              especialidades.map((especialidad) => {
                const IconComponent = especialidadIcons[especialidad.name] || especialidadIcons.default;
                return (
                  <div
                    key={especialidad._id}
                    onClick={() => handleEspecialidadClick(especialidad)}
                    className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 hover:bg-blue-50 flex flex-col items-center"
                  >
                    <IconComponent className="w-12 h-12 text-blue-600 mb-4" />
                    <span className="text-lg font-semibold text-blue-700 text-center">
                      {especialidad.name}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="col-span-full text-center text-gray-500">Cargando especialidades...</p>
            )}
          </div>
        </section>

        {selectedEspecialidad && (
          <section className="mb-16">
            <h3 className="text-3xl font-bold text-blue-800 mb-8 text-center">
              Médicos de {selectedEspecialidad.name}
            </h3>
            {loadingMedicos ? (
              <p className="text-center text-gray-500">Cargando médicos...</p>
            ) : medicos.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {medicos.map((medico) => (
                  <div
                    key={medico.id}
                    onClick={() => setSelectedMedico(medico)}
                    className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 hover:bg-blue-50 flex flex-col items-center"
                  >
                    <User className="w-16 h-16 text-blue-600 mb-4" />
                    <h4 className="text-xl font-bold text-blue-800 mb-2 text-center">
                      {medico.nombre}
                    </h4>
                    <div className="text-center">
                      {renderCalificacion(medico.calificacion)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No hay médicos disponibles para esta especialidad.</p>
            )}
          </section>
        )}

        <section className="mb-16">
          <h3 className="text-3xl font-bold text-blue-800 mb-8 text-center">
            Nuestra Ubicación
          </h3>
          <div className="rounded-xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1003.2181956110715!2d-66.28254633017828!3d-17.39314331968396!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93e30b77af10fe31%3A0x481967dab56c2581!2sJP49%2BP73%2C%20Quillacollo!5e0!3m2!1ses-419!2sbo!4v1726806139378!5m2!1ses-419!2sbo"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>
      </main>

      {selectedMedico && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-2xl font-bold text-blue-800 flex items-center">
                <User className="w-8 h-8 mr-2 text-blue-600" />
                {selectedMedico.nombre}
              </h4>
              <button
                onClick={() => setSelectedMedico(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="flex items-center text-gray-700">
                <Mail className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0" />
                <span className="font-medium">Email:</span>
                <span className="ml-2 break-all">{selectedMedico.email}</span>
              </p>
              <p className="flex items-center text-gray-700">
                <Phone className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0" />
                <span className="font-medium">Teléfono:</span>
                <span className="ml-2">{selectedMedico.telefono}</span>
              </p>
              <div>
                <span className="font-medium text-gray-700 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-blue-500" />
                  Especialidades:
                </span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedMedico.especialidades.map((esp, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
                      <Stethoscope className="w-4 h-4 mr-1" />
                      {esp}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-blue-500" />
                  Calificación:
                </span>
                <div className="mt-1">
                  {renderCalificacion(selectedMedico.calificacion)}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-500" />
                  Disponibilidades:
                </span>
                <ul className="mt-2 space-y-2">
                  {renderDisponibilidad(selectedMedico.disponibilidades, selectedEspecialidad.name)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}