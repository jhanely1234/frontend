import useAuth from "../../hooks/auth.hook";
import DashboardPage from "../admin/dashboard.page";
import UpdatedHospitalWelcome from "./dashboardall";
import { useState, useEffect } from "react";
import { Calendar, Activity } from 'lucide-react';

const HomePage = () => {
  const {
    auth: { _id, roles, name },
    isLoading
  } = useAuth();

  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [notifications, setNotifications] = useState(0);
  const [healthTip, setHealthTip] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const notificationTimer = setInterval(() => {
      setNotifications(prev => (prev + 1) % 5);
    }, 10000);

    const tips = [
      "Bebe 8 vasos de agua al día",
      "Haz 30 minutos de ejercicio diario",
      "Duerme 7-8 horas cada noche",
      "Come 5 porciones de frutas y verduras al día",
      "Practica la meditación para reducir el estrés"
    ];
    const tipTimer = setInterval(() => {
      setHealthTip(tips[Math.floor(Math.random() * tips.length)]);
    }, 10000);

    return () => {
      clearInterval(notificationTimer);
      clearInterval(tipTimer);
    };
  }, []);

  const formatDateTime = (date) => {
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-r from-teal-100 to-teal-200">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal-800 animate-pulse">
        🏥 Cargando...
      </h1>
    </div>
  );

  const isAdmin = roles.some((role) => role.name === "admin");
  const isRecepcionista = roles.some((role) => role.name === "recepcionista");
  const isMedico = roles.some((role) => role.name === "medico");
  const isPaciente = roles.some((role) => role.name === "paciente");

  if (!_id) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-r from-red-100 to-red-200">
        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-800 shadow-lg p-6 sm:p-8 bg-white rounded-lg">
          🚫 No se ha iniciado sesión
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-teal-50 to-teal-100 p-2 sm:p-4 md:p-6 flex flex-col">
      <div className="flex-grow w-full max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-3 sm:p-4 md:p-6 h-full flex flex-col">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-teal-800 mb-2 sm:mb-4 animate-fade-in">
            👋 Bienvenido, {name}!
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-green-100 p-2 sm:p-3 rounded-lg w-full">
              <div className="flex items-center mb-1 sm:mb-0">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2" />
                <span className="text-xs sm:text-sm font-semibold">Consejo de Salud</span>
              </div>
              <p className="text-teal-600 animate-fade-in text-xs sm:text-sm">{healthTip}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-yellow-100 p-2 sm:p-3 rounded-lg w-full">
              <div className="flex items-center mb-1 sm:mb-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 mr-2" />
                <span className="text-xs sm:text-sm font-semibold">Fecha y Hora</span>
              </div>
              <span className="text-yellow-600 text-xs sm:text-sm">{formatDateTime(currentDateTime)}</span>
            </div>
          </div>
          <div className="flex-grow overflow-auto">
            {isAdmin && (
              <div className="mb-3 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-teal-700 mb-2 sm:mb-4">🖥️ Panel de Administrador</h2>
                <DashboardPage />
              </div>
            )}
            {isRecepcionista && (
              <div className="mb-3 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-teal-700 mb-2 sm:mb-4">📋 Panel de Recepcionista</h2>
                <DashboardPage />
              </div>
            )}
            {isMedico && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-teal-700 mb-2 sm:mb-4">👨‍⚕️ Panel de Médico</h2>
                <UpdatedHospitalWelcome />
              </div>
            )}
            {isPaciente && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-teal-700 mb-2 sm:mb-4">🧑‍🤝‍🧑 Panel de Paciente</h2>
                <UpdatedHospitalWelcome />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;