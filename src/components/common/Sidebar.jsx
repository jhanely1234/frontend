import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/auth.hook";
import {
  FaUsers,
  FaStethoscope,
  FaCalendarCheck,
  FaFileAlt,
  FaList,
  FaPlus,
  FaChartBar,
  FaSignOutAlt,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { auth = {}, setAuth, setIsLoading } = useAuth();
  const roles = auth.roles || [];
  const handleNavigation = () => {
    navigate("/");
  };
  const isAdmin = roles.some((role) => role.name === "admin");
  const isPaciente = roles.some((role) => role.name === "paciente");
  const isMedico = roles.some((role) => role.name === "medico");
  const isRecepcionista = roles.some((role) => role.name === "recepcionista");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, [location]);

  if (!isAdmin && !isPaciente && !isMedico && !isRecepcionista) {
    return <Navigate to="/" />;
  }

  const handleSubmenuToggle = (menu) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  const handleLogout = () => {
    setAuth({});
    setIsLoading(false);
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
      <div
        className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      ></div>
      <aside
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white w-64 overflow-y-auto transition-transform duration-300 ease-in-out transform z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:h-screen`}
      >
        <Link to="/">
          <div className="h-16 bg-gray-900 flex items-center justify-center cursor-pointer">
            <h1 className="text-xl font-bold">Medical Dashboard</h1>
          </div>
        </Link>
        <nav className="mt-5">
          <ul className="space-y-2 px-4">
            {(isAdmin || isRecepcionista) && (
              <>
                <li>
                  <button
                    className="flex items-center justify-between w-full p-2 rounded hover:bg-gray-700"
                    onClick={() => handleSubmenuToggle("pacientes")}
                  >
                    <span className="flex items-center">
                      <FaUsers className="mr-2" />
                      Pacientes
                    </span>
                    <span
                      className={`transform transition-transform ${
                        openSubmenu === "pacientes" ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                  {openSubmenu === "pacientes" && (
                    <ul className="pl-4 mt-2 space-y-1">
                      <li>
                        <Link
                          to="/paciente"
                          className="flex items-center p-2 rounded hover:bg-gray-700"
                        >
                          <FaList className="mr-2" />
                          Listar Pacientes
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/paciente/nuevo"
                          className="flex items-center p-2 rounded hover:bg-gray-700"
                        >
                          <FaPlus className="mr-2" />
                          Agregar Paciente
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
                <li>
                  <button
                    className="flex items-center justify-between w-full p-2 rounded hover:bg-gray-700"
                    onClick={() => handleSubmenuToggle("medicos")}
                  >
                    <span className="flex items-center">
                      <FaStethoscope className="mr-2" />
                      Médicos
                    </span>
                    <span
                      className={`transform transition-transform ${
                        openSubmenu === "medicos" ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                  {openSubmenu === "medicos" && (
                    <ul className="pl-4 mt-2 space-y-1">
                      <li>
                        <Link
                          to="/medico"
                          className="flex items-center p-2 rounded hover:bg-gray-700"
                        >
                          <FaList className="mr-2" />
                          Listar Médicos
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/medico/nuevo"
                          className="flex items-center p-2 rounded hover:bg-gray-700"
                        >
                          <FaPlus className="mr-2" />
                          Agregar Médico
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
                <li>
                  <button
                    className="flex items-center justify-between w-full p-2 rounded hover:bg-gray-700"
                    onClick={() => handleSubmenuToggle("reservas")}
                  >
                    <span className="flex items-center">
                      <FaCalendarCheck className="mr-2" />
                      Reservas
                    </span>
                    <span
                      className={`transform transition-transform ${
                        openSubmenu === "reservas" ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                  {openSubmenu === "reservas" && (
                    <ul className="pl-4 mt-2 space-y-1">
                      <li>
                        <Link
                          to="/reservas"
                          className="flex items-center p-2 rounded hover:bg-gray-700"
                        >
                          <FaList className="mr-2" />
                          Ver Reservas
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/reservas/nuevo"
                          className="flex items-center p-2 rounded hover:bg-gray-700"
                        >
                          <FaPlus className="mr-2" />
                          Agregar Reserva
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
                <li>
                  <button
                    className="flex items-center justify-between w-full p-2 rounded hover:bg-gray-700"
                    onClick={() => handleSubmenuToggle("reportes")}
                  >
                    <span className="flex items-center">
                      <FaFileAlt className="mr-2" />
                      Reportes
                    </span>
                    <span
                      className={`transform transition-transform ${
                        openSubmenu === "reportes" ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                  {openSubmenu === "reportes" && (
                    <ul className="pl-4 mt-2 space-y-1">
                      <li>
                        <Link
                          to="/reportes/reportes"
                          className="flex items-center p-2 rounded hover:bg-gray-700"
                        >
                          <FaChartBar className="mr-2" />
                          Generar Reportes
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/reportes/resumen"
                          className="flex items-center p-2 rounded hover:bg-gray-700"
                        >
                          <FaChartBar className="mr-2" />
                          Reporte Resumen
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              </>
            )}

            {isPaciente && (
              <>
                <li>
                  <Link
                    to="/reservas"
                    className="flex items-center p-2 rounded hover:bg-gray-700"
                  >
                    <FaCalendarCheck className="mr-2" />
                    Reservar Cita
                  </Link>
                </li>
              </>
            )}

            {isMedico && (
              <>
                <li>
                  <Link
                    to="/paciente"
                    className="flex items-center p-2 rounded hover:bg-gray-700"
                  >
                    <FaUsers className="mr-2" />
                    Pacientes
                  </Link>
                </li>
                <li>
                  <Link
                    to="/reservas"
                    className="flex items-center p-2 rounded hover:bg-gray-700"
                  >
                    <FaCalendarCheck className="mr-2" />
                    Reservas
                  </Link>
                </li>
              </>
            )}

            <li>
              <button
                onClick={handleLogout}
                className="flex items-center w-full p-2 rounded hover:bg-gray-700"
              >
                <FaSignOutAlt className="mr-2" />
                Salir
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
