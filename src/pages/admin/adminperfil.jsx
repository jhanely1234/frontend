import React, { useContext } from "react";
import AuthContext from "../../providers/auth.provider"; // Ajusta la ruta según tu estructura

const PerfilMedico = () => {
  const { auth, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-lg font-semibold text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!auth || !auth._id) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-lg font-semibold text-gray-600">
          No se ha encontrado la información del perfil.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Perfil del Médico</h1>
      <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-blue-700 mb-4">Información Personal</h2>
        <div className="space-y-3">
          <p className="text-gray-800">
            <strong className="font-medium text-blue-700">Nombre:</strong> {auth.name}
          </p>
          <p className="text-gray-800">
            <strong className="font-medium text-blue-700">Apellido:</strong> {auth.lastname}
          </p>
          <p className="text-gray-800">
            <strong className="font-medium text-blue-700">Email:</strong> {auth.email}
          </p>
          <p className="text-gray-800">
            <strong className="font-medium text-blue-700">Fecha de Nacimiento:</strong> {auth.fechaNacimiento}
          </p>
          <p className="text-gray-800">
            <strong className="font-medium text-blue-700">Género:</strong> {auth.sexo}
          </p>
          <p className="text-gray-800">
            <strong className="font-medium text-blue-700">Teléfono:</strong> {auth.telefono}
          </p>
          <p className="text-gray-800">
            <strong className="font-medium text-blue-700">CI:</strong> {auth.ci}
          </p>
          <p className="text-gray-800">
            <strong className="font-medium text-blue-700">Edad:</strong> {auth.edad} años
          </p>
          <p className="text-gray-800">
            <strong className="font-medium text-blue-700">Especialidades:</strong> {auth.especialidades.map(e => e.name).join(", ")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PerfilMedico;
