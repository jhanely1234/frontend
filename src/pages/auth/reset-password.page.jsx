import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import axiosClient from "../../services/axios.service";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { Loader } from "lucide-react";

const PasswordRecoveryPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");
    if (token) {
      setTokenValid(true);
    } else {
      toast.error("No se encontró el token en la URL");
      navigate("/auth/login");
    }
  }, [location.search, navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Las contraseñas no coinciden");
    }
    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get("token");
      if (!token) {
        toast.error("No se encontró el token en la URL");
        return;
      }

      const { data } = await axiosClient.post("/auth/reset-password", {
        token,
        password
      });
      if (data.response === "success") {
        toast.success("Contraseña restablecida exitosamente");
        navigate("/auth/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al restablecer la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenValid) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cyan-400 to-blue-500">
      <div className="flex flex-col md:flex-row items-center justify-center w-full p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 m-4 border-4 border-blue-200">
          <div className="flex items-center justify-center mb-8">
            <img
              src="/public/logo_mediconsulta_original.png"
              alt="Logo SaludTotal"
              className="w-20 h-20 rounded-full border-4 border-blue-500"
            />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Restablecer Contraseña
          </h2>
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Nueva Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                            focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Ingrese su nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-gray-500" />
                  ) : (
                    <FaEye className="text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirmar Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                            focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Confirme su nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="animate-spin mr-2" />
                ) : (
                  <FaLock className="mr-2" />
                )}
                {isLoading
                  ? "Verificando los datos..."
                  : "Restablecer Contraseña"}
              </button>
            </div>
          </form>
          <div className="mt-4">
            <button
              onClick={() => navigate("/auth/login")}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              Volver al Inicio de Sesión
            </button>
          </div>
        </div>
        <div className="hidden md:block w-full max-w-md p-8 m-4">
          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg shadow-lg p-6 mb-6 border-2 border-blue-300">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Seguridad de su Cuenta
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Asegúrese de elegir una contraseña fuerte y única para proteger su
              cuenta. Recomendamos:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600">
              <li>Al menos 8 caracteres</li>
              <li>Combinación de letras mayúsculas y minúsculas</li>
              <li>Incluir números y símbolos</li>
              <li>Evitar información personal fácil de adivinar</li>
            </ul>
          </div>
          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg shadow-lg p-6 border-2 border-green-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              ¿Necesita Ayuda?
            </h3>
            <p className="text-sm text-gray-600">
              Si tiene problemas para restablecer su contraseña, no dude en
              contactar a nuestro equipo de soporte. Estamos aquí para ayudarle.
            </p>
            <button className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out">
              Contactar Soporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordRecoveryPage;
