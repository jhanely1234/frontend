import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/auth.hook";
import axiosClient from "../../services/axios.service";
import {
  FaSearch,
  FaBell,
  FaUser,
  FaBars,
  FaChevronDown,
  FaTimes,
  FaSpinner,
  FaEnvelope,
  FaIdCard,
  FaUserTag,
  FaPencilAlt,
  FaSave,
  FaExclamationTriangle
} from "react-icons/fa";
import logo from "../../assets/logo/logo_mediconsulta_original.png";

export default function TopHeader({ toggleSidebar }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const {
    auth: { _id },
    setAuth,
    setIsLoading: setAuthLoading
  } = useAuth();

  const handleLogout = () => {
    setAuth({});
    setAuthLoading(false);
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const openModal = async () => {
    setIsModalOpen(true);
    setIsDropdownOpen(false);
    if (!profileData) {
      await fetchProfileData();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditedData({});
  };

  const fetchProfileData = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No se encontró el token de autenticación");
      setIsLoading(false);
      return;
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    };

    try {
      const { data } = await axiosClient.get("/auth/me", config);
      setProfileData(data);
      setEditedData(data);
    } catch (error) {
      setError("Error al cargar los datos del perfil");
      console.error("Error fetching profile data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No se encontró el token de autenticación");
      setIsLoading(false);
      return;
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    };

    try {
      const { data } = await axiosClient.put(
        "/auth/update-profile",
        editedData,
        config
      );
      setProfileData(data);
      setIsEditing(false);
    } catch (error) {
      setError("Error al actualizar los datos del perfil");
      console.error("Error updating profile data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="bg-white shadow-md py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">

            <img src={logo} alt="Logo" className="h-8 w-auto" />
          </div>
          <div className="flex items-center space-x-4">
            {_id ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  <FaUser className="h-6 w-6" />
                  <span className="hidden md:inline">Mi Perfil</span>
                  <FaChevronDown className="h-4 w-4" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <button
                      onClick={openModal}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Ver Perfil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-x-2">
                <Link
                  to="/auth/login"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/auth/registro"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Mi Perfil</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition duration-150 ease-in-out"
                aria-label="Close modal"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <FaSpinner className="animate-spin h-8 w-8 text-purple-500" />
                </div>
              ) : error ? (
                <div className="text-red-500 flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  {error}
                </div>
              ) : profileData ? (
                <>
                  <div className="flex items-center space-x-4 bg-gray-100 p-4 rounded-lg">
                    <FaUser className="h-12 w-12 text-gray-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {isEditing ? (
                          <input
                            type="text"
                            name="name"
                            value={editedData.name}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        ) : (
                          profileData.name
                        )}
                      </h3>
                      <p className="text-gray-600">
                        {profileData.roles.map((role) => role.name).join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <FaEnvelope className="text-gray-500" />
                      <span className="font-medium">Email:</span>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={editedData.email}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <span>{profileData.email}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaIdCard className="text-gray-500" />
                      <span className="font-medium">ID:</span>
                      <span>{profileData._id}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaUserTag className="text-gray-500" />
                      <span className="font-medium">Roles:</span>
                      <span>
                        {profileData.roles.map((role) => role.name).join(", ")}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150 ease-in-out flex items-center"
                        >
                          <FaSave className="mr-2" />
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditedData(profileData);
                          }}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition duration-150 ease-in-out"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleEdit}
                        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition duration-150 ease-in-out flex items-center"
                      >
                        <FaPencilAlt className="mr-2" />
                        Editar
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-gray-500">
                  No se encontraron datos del perfil.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
