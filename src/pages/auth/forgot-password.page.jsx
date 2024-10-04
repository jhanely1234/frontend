import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { validateEmail } from "../../helpers/validator.helper";
import axiosClient from "../../services/axios.service";
import { Shield, Key, Mail, AlertCircle, Loader } from "lucide-react";

const PasswordRecoveryPage = () => {
  const [email, setEmail] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      setIsLoading(false);
      return toast.error("El correo electrónico es obligatorio");
    }

    if (!validateEmail(email)) {
      setIsLoading(false);
      return toast.error("El correo electrónico no es válido");
    }

    try {
      const { data } = await axiosClient.post("/auth/forgot-password", {
        email
      });
      if (data.response === "success") {
        setIsCodeSent(true);
        toast.success("Correo de restablecimiento de contraseña enviado");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al enviar correo de restablecimiento de contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  const SecurityTips = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 text-blue-600">
        <Shield className="h-6 w-6" />
        <span className="text-sm font-medium">
          Use contraseñas fuertes y únicas
        </span>
      </div>
      <div className="flex items-center space-x-3 text-green-600">
        <Key className="h-6 w-6" />
        <span className="text-sm font-medium">
          Active la autenticación de dos factores
        </span>
      </div>
      <div className="flex items-center space-x-3 text-yellow-600">
        <Mail className="h-6 w-6" />
        <span className="text-sm font-medium">
          Verifique la autenticidad de los correos electrónicos
        </span>
      </div>
      <div className="flex items-center space-x-3 text-red-600">
        <AlertCircle className="h-6 w-6" />
        <span className="text-sm font-medium">
          No comparta sus credenciales con nadie
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cyan-400 to-blue-500">
      <div className="flex flex-col md:flex-row items-center justify-center w-full p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 m-4 border-4 border-blue-200">
          <div className="flex items-center justify-center mb-8">
            <img
              src="/public/logo_mediconsulta_original.png"
              alt="Logo MediConsulta"
              className="w-20 h-20 rounded-full border-4 border-blue-500"
            />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Recuperar Acceso
          </h2>
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                          focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Ingrese su correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
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
                  "Restablecer contraseña"
                )}
              </button>
            </div>
          </form>
          <div className="mt-4">
            <button
              onClick={() => navigate("/auth/login")}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              Volver
            </button>
          </div>
          <p className="mt-4 text-center text-sm text-gray-600">
            ¿Necesita ayuda adicional?{" "}
            <a
              href="#"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Contacte a soporte
            </a>
          </p>
        </div>
        <div className="hidden md:block w-full max-w-md p-8 m-4">
          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg shadow-lg p-6 mb-6 border-2 border-blue-300">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Consejos de Seguridad
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Proteja su cuenta siguiendo estas recomendaciones:
            </p>
            <SecurityTips />
          </div>
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg shadow-lg p-6 border-2 border-yellow-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
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
};

export default PasswordRecoveryPage;
