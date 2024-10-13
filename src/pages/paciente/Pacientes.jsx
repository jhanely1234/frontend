import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Edit, Trash2, BookOpen, Search, User, CreditCard, Calendar, Phone, Users, Plus, X, Filter, ChevronDown, ChevronUp, RefreshCw, List, Grid } from "lucide-react";
import { obtenerTodosPacientes, obtenerPacientePorId, eliminarPaciente } from "../../api/pacienteapi";
import useAuth from "../../hooks/auth.hook";

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [viewProfile, setViewProfile] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [filters, setFilters] = useState({
    name: "",
    ci: "",
    sexo: "",
    minEdad: "",
    maxEdad: ""
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('cards');
  const navigate = useNavigate();
  const { auth: { roles } } = useAuth();

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const data = await obtenerTodosPacientes();
        setPacientes(data);
      } catch (error) {
        console.error("Error fetching pacientes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPacientes();
  }, []);

  const handleViewProfile = async (id) => {
    try {
      const paciente = await obtenerPacientePorId(id);
      setSelectedPaciente(paciente);
      setViewProfile(true);
    } catch (error) {
      console.error("Error fetching paciente:", error);
    }
  };

  const handleEditProfile = (id) => {
    navigate(`/paciente/editar/${id}`);
  };

  const handleDeletePaciente = async (id) => {
    try {
      await eliminarPaciente(id);
      setPacientes(pacientes.filter((paciente) => paciente._id !== id));
    } catch (error) {
      console.error("Error deleting paciente:", error);
    }
  };

  const handleViewHistorial = (pacienteId) => {
    navigate(`/paciente/historial/${pacienteId}`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      name: "",
      ci: "",
      sexo: "",
      minEdad: "",
      maxEdad: ""
    });
  };

  const canAddPatient = roles.some((role) => ["admin", "recepcionista"].includes(role.name));
  const canEditPatient = roles.some((role) => ["admin", "recepcionista"].includes(role.name));

  const filteredPacientes = pacientes.filter((paciente) => {
    return (
      (filters.name === "" || `${paciente.name} ${paciente.lastname}`.toLowerCase().includes(filters.name.toLowerCase())) &&
      (filters.ci === "" || (paciente.ci && paciente.ci.toString().includes(filters.ci))) &&
      (filters.sexo === "" || paciente.genero.toLowerCase() === filters.sexo.toLowerCase()) &&
      (filters.minEdad === "" || paciente.edad >= parseInt(filters.minEdad)) &&
      (filters.maxEdad === "" || paciente.edad <= parseInt(filters.maxEdad))
    );
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">Lista de Pacientes</h1>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          {canAddPatient && (
            <Link
              to="/paciente/nuevo"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md text-sm md:text-base flex items-center"
            >
              <Plus className="mr-2" size={20} />
              Agregar Nuevo Paciente
            </Link>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-300 flex items-center shadow-md text-sm md:text-base"
            >
              <Filter className="mr-2" size={20} />
              {isFilterOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
            <button
              onClick={clearFilters}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 flex items-center shadow-md text-sm md:text-base"
            >
              <RefreshCw className="mr-2" size={20} />
              Borrar Filtros
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
              className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-300 flex items-center shadow-md text-sm md:text-base"
            >
              {viewMode === 'cards' ? <List className="mr-2" size={20} /> : <Grid className="mr-2" size={20} />}
              {viewMode === 'cards' ? 'Vista de Tabla' : 'Vista de Tarjetas'}
            </button>
          </div>
        </div>

        {isFilterOpen && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Filtros de Búsqueda</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre"
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <input
                type="text"
                placeholder="Buscar por CI"
                name="ci"
                value={filters.ci}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                name="sexo"
                value={filters.sexo}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los sexos</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
              <input
                type="number"
                placeholder="Edad mínima"
                name="minEdad"
                value={filters.minEdad}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Edad máxima"
                name="maxEdad"
                value={filters.maxEdad}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPacientes.map((paciente) => (
              <div key={paciente._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${paciente.name} ${paciente.lastname}`}
                      alt={`${paciente.name} ${paciente.lastname}`}
                      className="w-16 h-16 rounded-full mr-4"
                    />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">{paciente.name} {paciente.lastname}</h2>
                      <p className="text-sm text-gray-600">{paciente.email}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600"><span className="font-medium">CI:</span> {paciente.ci}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Teléfono:</span> {paciente.telefono}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Edad:</span> {paciente.edad} años</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Sexo:</span> {paciente.genero}</p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleViewProfile(paciente._id)}
                      className="text-blue-600 hover:text-blue-800 transition duration-300"
                      aria-label="Ver perfil"
                    >
                      <Eye size={20} />
                    </button>
                    {canEditPatient && (
                      <button
                        onClick={() => handleEditProfile(paciente._id)}
                        className="text-green-600 hover:text-green-800 transition duration-300"
                        aria-label="Editar perfil"
                      >
                        <Edit size={20} />
                      </button>
                    )}
                    {canAddPatient && (
                      <button
                        onClick={() => handleDeletePaciente(paciente._id)}
                        className="text-red-600 hover:text-red-800 transition duration-300"
                        aria-label="Eliminar paciente"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => handleViewHistorial(paciente._id)}
                      className="text-purple-600 hover:text-purple-800 transition duration-300"
                      aria-label="Ver historial"
                    >
                      <BookOpen size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-6 text-left">Nombre</th>
                  <th className="py-3 px-6 text-left">Email</th>
                  <th className="py-3 px-6 text-left">CI</th>
                  <th className="py-3 px-6 text-left">Teléfono</th>
                  <th className="py-3 px-6 text-left">Edad</th>
                  <th className="py-3 px-6 text-left">Sexo</th>
                  <th className="py-3 px-6 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPacientes.map((paciente) => (
                  <tr key={paciente._id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">{paciente.name} {paciente.lastname}</td>
                    <td className="py-4 px-6">{paciente.email}</td>
                    <td className="py-4 px-6">{paciente.ci}</td>
                    <td className="py-4 px-6">{paciente.telefono}</td>
                    <td className="py-4 px-6">{paciente.edad}</td>
                    <td className="py-4 px-6">{paciente.genero}</td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewProfile(paciente._id)}
                          className="text-blue-600 hover:text-blue-800 transition duration-300"
                          aria-label="Ver perfil"
                        >
                          <Eye size={20} />
                        </button>
                        {canEditPatient && (
                          <button
                            onClick={() => handleEditProfile(paciente._id)}
                            className="text-green-600 hover:text-green-800 transition duration-300"
                            aria-label="Editar perfil"
                          >
                            <Edit size={20} />
                          </button>
                        )}
                        {canAddPatient && (
                          <button
                            onClick={() => handleDeletePaciente(paciente._id)}
                            className="text-red-600 hover:text-red-800 transition duration-300"
                            aria-label="Eliminar paciente"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                        <button
                          onClick={() => handleViewHistorial(paciente._id)}
                          className="text-purple-600 hover:text-purple-800 transition  duration-300"
                          aria-label="Ver historial"
                        >
                          <BookOpen size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewProfile && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Perfil del Paciente
                    </h3>
                    <div className="mt-2">
                      {selectedPaciente && (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4 mb-4">
                            <User className="text-blue-600" size={48} />
                            <div>
                              <h3 className="text-lg font-bold text-gray-800">{selectedPaciente.name} {selectedPaciente.lastname}</h3>
                              <p className="text-gray-600">{selectedPaciente.email}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center">
                              <Phone className="text-gray-400 mr-2" size={20} />
                              <span>{selectedPaciente.telefono}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="text-gray-400 mr-2" size={20} />
                              <span>{selectedPaciente.genero}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="text-gray-400 mr-2" size={20} />
                              <span>{new Date(selectedPaciente.fechaNacimiento).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <CreditCard className="text-gray-400 mr-2" size={20} />
                              <span>{selectedPaciente.ci}</span>
                            </div>
                          </div>
                          {selectedPaciente.telefono_tutor && (
                            <div className="flex items-center mt-2">
                              <Phone className="text-gray-400 mr-2" size={20} />
                              <span>Teléfono del tutor: {selectedPaciente.telefono_tutor}</span>
                            </div>
                          )}
                          {selectedPaciente.nombre_tutor && (
                            <div className="flex items-center mt-2">
                              <User className="text-gray-400 mr-2" size={20} />
                              <span>Nombre del tutor: {selectedPaciente.nombre_tutor}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setViewProfile(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}