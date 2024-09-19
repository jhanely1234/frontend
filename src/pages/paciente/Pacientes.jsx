'use client'

import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, Edit, Trash2, BookOpen, Search, User, CreditCard, Calendar, Phone, Users, Plus, X, Filter, ChevronDown, ChevronUp, RefreshCw } from "lucide-react"
import { obtenerTodosPacientes, obtenerPacientePorId, eliminarPaciente } from "../../api/pacienteapi"
import useAuth from "../../hooks/auth.hook"

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([])
  const [viewProfile, setViewProfile] = useState(false)
  const [selectedPaciente, setSelectedPaciente] = useState(null)
  const [filters, setFilters] = useState({
    name: "",
    ci: "",
    sexo: "",
    minEdad: "",
    maxEdad: ""
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const navigate = useNavigate()
  const { auth: { roles } } = useAuth()

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const data = await obtenerTodosPacientes()
        setPacientes(data)
      } catch (error) {
        console.error("Error fetching pacientes:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPacientes()

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleViewProfile = async (id) => {
    try {
      const paciente = await obtenerPacientePorId(id)
      setSelectedPaciente(paciente)
      setViewProfile(true)
    } catch (error) {
      console.error("Error fetching paciente:", error)
    }
  }

  const handleEditProfile = (id) => {
    navigate(`/paciente/editar/${id}`)
  }

  const handleDeletePaciente = async (id) => {
    try {
      await eliminarPaciente(id)
      setPacientes(pacientes.filter((paciente) => paciente._id !== id))
    } catch (error) {
      console.error("Error deleting paciente:", error)
    }
  }

  const handleViewHistorial = (pacienteId) => {
    navigate(`/paciente/historial/${pacienteId}`)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const clearFilters = () => {
    setFilters({
      name: "",
      ci: "",
      sexo: "",
      minEdad: "",
      maxEdad: ""
    })
  }

  const canAddPatient = roles.some((role) => ["admin", "recepcionista"].includes(role.name))
  const canEditPatient = roles.some((role) => ["admin", "recepcionista"].includes(role.name))

  const filteredPacientes = pacientes.filter((paciente) => {
    return (
      (filters.name === "" || `${paciente.name} ${paciente.lastname}`.toLowerCase().includes(filters.name.toLowerCase())) &&
      (filters.ci === "" || (paciente.ci && paciente.ci.toString().includes(filters.ci))) &&
      (filters.sexo === "" || paciente.genero.toLowerCase() === filters.sexo.toLowerCase()) &&
      (filters.minEdad === "" || paciente.edad >= parseInt(filters.minEdad)) &&
      (filters.maxEdad === "" || paciente.edad <= parseInt(filters.maxEdad))
    )
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Lista de Pacientes</h1>

      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        {canAddPatient && (
          <Link to="/paciente/nuevo" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition duration-300 shadow-md">
            <Plus className="mr-2" size={20} />
            Agregar Nuevo Paciente
          </Link>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center transition duration-300"
          >
            <Filter className="mr-2" size={20} />
            Filtros
            {isFilterOpen ? <ChevronUp className="ml-2" size={20} /> : <ChevronDown className="ml-2" size={20} />}
          </button>
          <button
            onClick={clearFilters}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center transition duration-300"
          >
            <RefreshCw className="mr-2" size={20} />
            Borrar Filtros
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
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

      {!isMobile ? (
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sexo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPacientes.map((paciente) => (
                <tr key={paciente._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{paciente.name} {paciente.lastname}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{paciente.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{paciente.ci}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{paciente.edad}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{paciente.telefono}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{paciente.genero}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleViewProfile(paciente._id)} className="text-blue-600 hover:text-blue-900 mr-2">
                      <Eye size={20} />
                    </button>
                    {canEditPatient && (
                      <button onClick={() => handleEditProfile(paciente._id)} className="text-green-600 hover:text-green-900 mr-2">
                        <Edit size={20} />
                      </button>
                    )}
                    {canAddPatient && (
                      <button onClick={() => handleDeletePaciente(paciente._id)} className="text-red-600 hover:text-red-900 mr-2">
                        <Trash2 size={20} />
                      </button>
                    )}
                    <button onClick={() => handleViewHistorial(paciente._id)} className="text-purple-600 hover:text-purple-900">
                      <BookOpen size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPacientes.map((paciente) => (
            <div key={paciente._id} className="bg-white shadow-md rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{paciente.name} {paciente.lastname}</h3>
                  <p className="text-sm text-gray-600">{paciente.email}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleViewProfile(paciente._id)} className="text-blue-600">
                    <Eye size={20} />
                  </button>
                  {canEditPatient && (
                    <button onClick={() => handleEditProfile(paciente._id)} className="text-green-600">
                      <Edit size={20} />
                    </button>
                  )}
                  {canAddPatient && (
                    <button onClick={() => handleDeletePaciente(paciente._id)} className="text-red-600">
                      <Trash2 size={20} />
                    </button>
                  )}
                  <button onClick={() => handleViewHistorial(paciente._id)} className="text-purple-600">
                    <BookOpen size={20} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-semibold">CI:</span> {paciente.ci}</div>
                <div><span className="font-semibold">Edad:</span> {paciente.edad}</div>
                <div><span className="font-semibold">Teléfono:</span> {paciente.telefono}</div>
                <div><span className="font-semibold">Sexo:</span> {paciente.sexo}</div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                              <span>{selectedPaciente.sexo}</span>
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
  )
}