import React, { useState, useRef, useEffect } from "react";
import { FaUser, FaChevronDown, FaTimes, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/auth.hook";
import axiosClient from "../../services/axios.service";
import { obtenerMedicoPorId2 } from "../../api/medicoapi"; // Usar tu API para obtener datos de médicos
import DoctorEditModal from "./DoctorEditModal"; // Modal para médicos
import BasicEditModal from "./BasicEditModal"; // Modal básico para otros roles

export default function TopHeader({ toggleSidebar }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { auth: { _id }, setAuth, setIsLoading: setAuthLoading } = useAuth();

  const handleLogout = () => {
    localStorage.clear();
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    });
    setAuth({});
    setAuthLoading(false);
    navigate("/auth/login");
  };

  const openModal = async () => {
    setIsModalOpen(true);
    setIsDropdownOpen(false);
    await fetchProfileData(); // Cargar los datos del perfil al abrir el modal
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const fetchProfileData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const { data } = await axiosClient.get("/auth/me", config);
      setProfileData(data);
    } catch (error) {
      console.error("Error al obtener datos del perfil:", error);
    } finally {
      setIsLoading(false);
    }
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
            {/* Logo y otros elementos */}
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
                {/* Links de iniciar sesión y registro */}
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

            {/* Mostrar modal según el rol */}
            {profileData ? (
              profileData.roles.some((role) => role.name === "medico") ? (
                <DoctorEditModal closeModal={closeModal} user={profileData} />
              ) : (
                <BasicEditModal closeModal={closeModal} user={profileData} />
              )
            ) : (
              <div className="flex justify-center items-center py-8">
                {isLoading ? (
                  <FaSpinner className="animate-spin h-8 w-8 text-purple-500" />
                ) : (
                  <p className="text-gray-500">No se encontraron datos del perfil.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
