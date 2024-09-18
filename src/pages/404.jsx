import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate(-1); // Navegar a la página anterior
    }, 3000); // 3000 milisegundos = 3 segundos

    return () => clearTimeout(timeout); // Limpiar el temporizador al desmontar el componente
  }, [navigate]);

  return (
    <div className="flex bg-white shadow-lg rounded-lg">
      <div className="icon bg-yellow-600 flex justify-center items-center py-4 px-6 rounded-tr-3xl rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 bg-white rounded-full text-yellow-600 p-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div className="flex flex-col p-4 rounded-tr-lg rounded-br-lg">
        <h2 className="font-semibold text-yellow-600">Advertencia</h2>
        <p className="text-gray-700">NO EXISTE ESTA PAGINA</p>
      </div>
    </div>
  );
};

export default NotFoundPage;
