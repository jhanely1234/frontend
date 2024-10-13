import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import {
  obtenerTodosMedicos,
  obtenerMedicoPorId,
  eliminarMedico
} from "../../api/medicoapi";
import { FiEye, FiTrash, FiFilter, FiX, FiCalendar, FiClock, FiList, FiGrid } from "react-icons/fi";
import { BsPencil } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/auth.hook";
import Select from 'react-select'; // Usado solo si prefieres react-select

Modal.setAppElement("#root");

export default function Component() {
  const [medicos, setMedicos] = useState([]);
  const [viewProfile, setViewProfile] = useState(false);
  const [selectedMedico, setSelectedMedico] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [searchEspecialidades, setSearchEspecialidades] = useState([]); // Array para especialidades múltiples
  const [searchGenero, setSearchGenero] = useState('');
  const [minEdad, setMinEdad] = useState('');
  const [maxEdad, setMaxEdad] = useState('');
  const [especialidadesOptions, setEspecialidadesOptions] = useState([]); // Para opciones del select
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('cards');
  const navigate = useNavigate();
  const {
    auth: { roles },
    isLoading
  } = useAuth();

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const data = await obtenerTodosMedicos();
        setMedicos(data.medicos);

        // Extraer todas las especialidades únicas para las opciones del select múltiple
        const especialidadesSet = new Set();
        data.medicos.forEach((medico) => {
          medico.especialidades.forEach((especialidad) => {
            especialidadesSet.add(especialidad);
          });
        });
        setEspecialidadesOptions([...especialidadesSet].map(especialidad => ({ value: especialidad, label: especialidad })));
      } catch (error) {
        console.error("Error fetching medicos:", error);
      }
    };
    fetchMedicos();
  }, []);

  const handleViewProfile = async (id) => {
    try {
      const response = await obtenerMedicoPorId(id);
      setSelectedMedico(response.medico);
      setViewProfile(true);
    } catch (error) {
      console.error("Error fetching medico:", error);
    }
  };

  const handleEditProfile = (id) => {
    navigate(`/medico/editar/${id}`);
  };

  const handleDeleteMedico = async (id) => {
    try {
      await eliminarMedico(id);
      setMedicos(medicos.filter((medico) => medico._id !== id));
    } catch (error) {
      console.error("Error deleting medico:", error);
    }
  };

  const resetFilters = () => {
    setSearchName('');
    setSearchEspecialidades([]);
    setSearchGenero('');
    setMinEdad('');
    setMaxEdad('');
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  const canAddMedico = roles.some((role) =>
    ["admin", "recepcionista"].includes(role.name)
  );

  const filteredMedicos = medicos.filter((medico) => {
    // Filtrar si hay especialidades seleccionadas
    const especialidadesFiltradas = searchEspecialidades.length === 0 || searchEspecialidades.some((especialidad) =>
      medico.especialidades.includes(especialidad.value)
    );

    return (
      (searchName === '' || `${medico.name} ${medico.lastname}`.toLowerCase().includes(searchName.toLowerCase())) &&
      especialidadesFiltradas &&
      (searchGenero === '' || (medico.genero && medico.genero.toLowerCase() === searchGenero.toLowerCase())) &&
      (minEdad === '' || medico.edad >= parseInt(minEdad)) &&
      (maxEdad === '' || medico.edad <= parseInt(maxEdad))
    );
  });

  const TableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-6 text-left">Nombre</th>
            <th className="py-3 px-6 text-left">Especialidades</th>
            <th className="py-3 px-6 text-left">Email</th>
            <th className="py-3 px-6 text-left">Teléfono</th>
            <th className="py-3 px-6 text-left">Edad</th>
            <th className="py-3 px-6 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredMedicos.map((medico) => (
            <tr key={medico._id} className="hover:bg-gray-50">
              <td className="py-4 px-6">{medico.name} {medico.lastname}</td>
              <td className="py-4 px-6">{medico.especialidades.join(", ")}</td>
              <td className="py-4 px-6">{medico.email}</td>
              <td className="py-4 px-6">{medico.telefono}</td>
              <td className="py-4 px-6">{medico.edad}</td>
              <td className="py-4 px-6">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewProfile(medico._id)}
                    className="text-blue-600 hover:text-blue-800 transition duration-300"
                    aria-label="Ver perfil"
                  >
                    <FiEye size={20} />
                  </button>
                  <button
                    onClick={() => handleEditProfile(medico._id)}
                    className="text-green-600 hover:text-green-800 transition duration-300"
                    aria-label="Editar perfil"
                  >
                    <BsPencil size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteMedico(medico._id)}
                    className="text-red-600 hover:text-red-800 transition duration-300"
                    aria-label="Eliminar médico"
                  >
                    <FiTrash size={20} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">Directorio de Médicos</h1>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          {canAddMedico && (
            <Link
              to="/medico/nuevo"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md text-sm md:text-base"
            >
              Agregar Nuevo Médico
            </Link>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-300 flex items-center shadow-md text-sm md:text-base"
            >
              <FiFilter className="mr-2" />
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
            <button
              onClick={resetFilters}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 flex items-center shadow-md text-sm md:text-base"
            >
              <FiX className="mr-2" />
              Resetear Filtros
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
              className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-300 flex items-center shadow-md text-sm md:text-base"
            >
              {viewMode === 'cards' ? <FiList className="mr-2" /> : <FiGrid className="mr-2" />}
              {viewMode === 'cards' ? 'Vista de Tabla' : 'Vista de Tarjetas'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Filtros de Búsqueda</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Buscar por nombre"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Usar react-select para múltiples especialidades */}
              <Select
                isMulti
                value={searchEspecialidades}
                onChange={(selectedOptions) => setSearchEspecialidades(selectedOptions)}
                options={especialidadesOptions}
                placeholder="Buscar por especialidad"
                className="w-full"
              />

              <select
                value={searchGenero}
                onChange={(e) => setSearchGenero(e.target.value)}
                className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los géneros</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
              <input
                type="number"
                placeholder="Edad mínima"
                value={minEdad}
                onChange={(e) => setMinEdad(e.target.value)}
                className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Edad máxima"
                value={maxEdad}
                onChange={(e) => setMaxEdad(e.target.value)}
                className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedicos.map((medico) => (
              <div key={medico._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${medico.name} ${medico.lastname}`}
                      alt={`${medico.name} ${medico.lastname}`}
                      className="w-16 h-16 rounded-full mr-4"
                    />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">{medico.name} {medico.lastname}</h2>
                      <p className="text-sm text-gray-600">{medico.especialidades.join(", ")}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600"><span className="font-medium">Email:</span> {medico.email}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Teléfono:</span> {medico.telefono}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Edad:</span> {medico.edad} años</p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleViewProfile(medico._id)}
                      className="text-blue-600 hover:text-blue-800 transition duration-300"
                      aria-label="Ver perfil"
                    >
                      <FiEye size={20} />
                    </button>
                    <button
                      onClick={() => handleEditProfile(medico._id)}
                      className="text-green-600 hover:text-green-800 transition duration-300"
                      aria-label="Editar perfil"
                    >
                      <BsPencil size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteMedico(medico._id)}
                      className="text-red-600 hover:text-red-800 transition duration-300"
                      aria-label="Eliminar médico"
                    >
                      <FiTrash size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <TableView />
        )}
      </div>

      <Modal
        isOpen={viewProfile}
        onRequestClose={() => setViewProfile(false)}
        contentLabel="Ver Perfil"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75"
      >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-6 bg-gray-100 border-b">
            <h2 className="text-3xl font-bold text-gray-800">Perfil del Médico</h2>
            <button
              onClick={() => setViewProfile(false)}
              className="text-gray-500 hover:text-gray-700 transition duration-150 ease-in-out"
            >
              <FiX size={24} />
            </button>
          </div>
          {selectedMedico && (
            <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="flex flex-col md:flex-row gap-6">

                <div className="md:w-1/3">
                  <img
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${selectedMedico.name} ${selectedMedico.lastname}`}
                    alt={`${selectedMedico.name} ${selectedMedico.lastname}`}
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    Información Personal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p className="text-gray-700">
                      <span className="font-medium">Nombre:</span> {selectedMedico.name} {selectedMedico.lastname}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Email:</span> {selectedMedico.email}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Teléfono:</span> {selectedMedico.telefono}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">CI:</span> {selectedMedico.ci}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Género:</span> {selectedMedico.genero}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Fecha de Nacimiento:</span> {new Date(selectedMedico.fechaNacimiento).toLocaleDateString()}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Edad:</span> {selectedMedico.edad} años
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Especialidades</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedMedico.especialidades.map((especialidad, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {especialidad}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Disponibilidad</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedMedico.disponibilidades.map((disp, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg shadow">
                      <h4 className="font-semibold text-gray-700 mb-2">{disp.dia}</h4>
                      <p className="text-gray-600 flex items-center">
                        <FiClock className="mr-2" />
                        {disp.inicio} - {disp.fin}
                      </p>
                      <p className="text-gray-600 flex items-center">
                        <FiCalendar className="mr-2" />
                        Turno: {disp.turno}
                      </p>
                      <p className="text-gray-600 mt-2">
                        <span className="font-medium">Especialidad:</span> {disp.especialidad}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}
