import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import axiosClient from "../../services/axios.service";

export default function PasswordRecoveryPage() {
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

  const SecurityTips = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 text-teal-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-sm">Use contraseñas fuertes y únicas</span>
      </div>
      <div className="flex items-center space-x-3 text-teal-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span className="text-sm">Active la autenticación de dos factores</span>
      </div>
      <div className="flex items-center space-x-3 text-teal-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
        <span className="text-sm">Verifique la autenticidad de los correos electrónicos</span>
      </div>
      <div className="flex items-center space-x-3 text-teal-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span className="text-sm">No comparta sus credenciales con nadie</span>
      </div>
    </div>
  );

  if (!tokenValid) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 relative">
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url('https://i.ibb.co/dDvFjJw/1.png')` }}></div>
      <div className="flex flex-col md:flex-row items-center justify-center w-full p-4 relative z-10">
        <div className="bg-white bg-opacity-90 rounded-lg shadow-xl w-full max-w-md p-4 sm:p-6 md:p-8 m-4 border-4 border-teal-600">
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <img
              src="/logo_mediconsulta_original.png"
              alt="Logo MediConsulta"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-teal-900"
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-teal-800 mb-4 sm:mb-6 text-center">
            Restablecer Contraseña
          </h2>
          <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirmar Contraseña
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                placeholder="Confirme su nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150 ease-in-out"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                )}
                {isLoading ? "Verificando los datos..." : "Restablecer Contraseña"}
              </button>
            </div>
          </form>
          <div className="mt-4">
            <button
              onClick={() => navigate("/auth/login")}
              className="w-full flex justify-center py-2 px-4 border border-teal-600 rounded-md shadow-sm text-sm font-medium text-teal-600 bg-white hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150 ease-in-out"
            >
              Volver al inicio de sesión
            </button>
          </div>
          <p className="mt-4 text-center text-sm text-gray-600">
            ¿Necesita ayuda adicional?{" "}
            <a
              href="#"
              className="font-medium text-teal-600 hover:text-teal-500"
            >
              Contacte a soporte
            </a>
          </p>
        </div>
        <div className="hidden md:block w-full max-w-md p-4 sm:p-6 md:p-8 m-4">
          <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-4 sm:p-6 mb-6 border-2 border-teal-600">
            <h3 className="text-lg  sm:text-xl font-semibold text-teal-800 mb-4">
              Consejos de Seguridad
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Proteja su cuenta siguiendo estas recomendaciones:
            </p>
            <SecurityTips />
          </div>
          <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-4 sm:p-6 border-2 border-teal-600">
            <h3 className="text-lg font-semibold text-teal-800 mb-4">
              Proceso de Recuperación
            </h3>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
              <li>Ingrese su correo electrónico registrado</li>
              <li>Recibirá un enlace de restablecimiento por correo</li>
              <li>Haga clic en el enlace para crear una nueva contraseña</li>
              <li>Inicie sesión con su nueva contraseña</li>
            </ol>
            <p className="mt-4 text-sm text-gray-600">
              Si no recibe el correo, revise su carpeta de spam o contacte a
              soporte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}