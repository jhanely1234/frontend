import React, { useContext, useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit2,
  Menu,
  X
} from "lucide-react";
import AuthContext from "../../providers/auth.provider";

export default function PerfilMedico() {
  const { auth, isLoading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("General");
  const [progress, setProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setProgress(Math.floor(Math.random() * 101));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Cargando...
      </div>
    );
  }

  if (!auth || !auth._id) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        No se ha encontrado la información del perfil.
      </div>
    );
  }

  const tabs = [
    "General",
    "Tareas",
    "Calendario",
    "Mi drive",
    "Noticias",
    "E-learning"
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-blue-600 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src="/logo.png" alt="Logo" className="h-8 w-8 mr-2" />
              <h1 className="text-xl font-semibold truncate">{`${auth.name} ${auth.lastname}`}</h1>
            </div>
            <div className="flex items-center">
              <button
                className="sm:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <div className="hidden sm:flex space-x-2">
                <button className="px-3 py-1 bg-blue-500 hover:bg-blue-400 rounded-md text-sm">
                  EXTENSIONES
                </button>
                <button className="px-3 py-1 bg-blue-500 hover:bg-blue-400 rounded-md text-sm">
                  CONTRASEÑAS
                </button>
                <button className="px-3 py-1 bg-blue-500 hover:bg-blue-400 rounded-md text-sm">
                  SEGURIDAD
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="sm:hidden bg-blue-500 px-4 py-2">
          <button className="block w-full text-left px-3 py-2 text-white hover:bg-blue-600 rounded-md text-sm mb-1">
            EXTENSIONES
          </button>
          <button className="block w-full text-left px-3 py-2 text-white hover:bg-blue-600 rounded-md text-sm mb-1">
            CONTRASEÑAS
          </button>
          <button className="block w-full text-left px-3 py-2 text-white hover:bg-blue-600 rounded-md text-sm">
            SEGURIDAD
          </button>
        </div>
      )}

      <nav className="bg-white shadow-sm mt-1 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`px-3 py-4 text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row items-center">
              <img
                src="https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg?w=740&t=st=1689338333~exp=1689338933~hmac=605d2a2d6e876d2e8f3cad6f9c9c3c8d3e1c2a6b2f2f2f2f2f2f2f2f2f2f2f2"
                alt="Profile"
                className="w-32 h-32 rounded-full mb-4 sm:mb-0 sm:mr-6 object-cover"
              />
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-semibold">{`${auth.name} ${auth.lastname}`}</h2>
                <p className="text-gray-500 text-sm">
                  {auth.especialidades[0]?.name ||
                    "Especialidad no especificada"}
                </p>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      Progreso general
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Información de contacto
                </h3>
                <button className="text-blue-600 hover:text-blue-800">
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Nombre</p>
                  <p className="text-sm font-medium">{auth.name}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Apellido</p>
                  <p className="text-sm font-medium">{auth.lastname}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">
                    Correo electrónico
                  </p>
                  <p className="text-sm font-medium break-words">
                    {auth.email}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">
                    Fecha de nacimiento
                  </p>
                  <p className="text-sm font-medium">
                    {auth.fechaNacimiento.split("T")[0]}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Teléfono</p>
                  <p className="text-sm font-medium">{auth.telefono}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Género</p>
                  <p className="text-sm font-medium">{auth.sexo}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Información adicional
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Especialidades</p>
                  <p className="text-sm font-medium">
                    {auth.especialidades.map((e) => e.name).join(", ")}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Roles</p>
                  <p className="text-sm font-medium">
                    {auth.roles.map((r) => r.name).join(", ")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
  