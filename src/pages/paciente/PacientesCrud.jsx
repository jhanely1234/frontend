import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  crearPaciente,
  actualizarPaciente,
  obtenerPacientePorId
} from "../../api/pacienteapi";

const PacientesCrud = () => {
  const [paciente, setPaciente] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    ci: "",
    genero: "",
    fechaNacimiento: "",
    telefono: "",
    telefono_tutor: "",
    nombre_tutor: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [edad, setEdad] = useState(0);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      const fetchPaciente = async () => {
        try {
          const data = await obtenerPacientePorId(id);
          setPaciente(data);
          calcularEdad(data.fechaNacimiento);
        } catch (error) {
          console.error("Error fetching paciente:", error);
        }
      };
      fetchPaciente();
    }
  }, [id]);

  const calcularEdad = (fechaNacimiento) => {
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    setEdad(age);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaciente({ ...paciente, [name]: value });

    if (name === "fechaNacimiento") {
      calcularEdad(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await actualizarPaciente(id, paciente);
      } else {
        await crearPaciente(paciente);
      }
      navigate("/paciente");
    } catch (error) {
      console.error("Error saving paciente:", error);
    }
  };

  // Calcula la fecha máxima permitida para que la fecha de nacimiento no sea mayor a la fecha actual
  const calculateMaxDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {isEditing ? "Editar Paciente" : "Agregar Nuevo Paciente"}
      </h1>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg shadow-md"
      >
        <label className="block">
          Nombre:
          <input
            type="text"
            name="name"
            value={paciente.name}
            onChange={handleChange}
            placeholder="Ingrese el nombre del paciente"
            className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </label>
        <label className="block">
          Apellido:
          <input
            type="text"
            name="lastname"
            value={paciente.lastname}
            onChange={handleChange}
            placeholder="Ingrese el apellido del paciente"
            className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </label>
        <label className="block">
          Email:
          <input
            type="email"
            name="email"
            value={paciente.email}
            onChange={handleChange}
            placeholder="Ingrese el email del paciente"
            className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </label>
        {!isEditing && (
          <label className="block">
            Contraseña:
            <input
              type="password"
              name="password"
              value={paciente.password}
              onChange={handleChange}
              placeholder="Ingrese una contraseña"
              className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </label>
        )}
        <label className="block">
          CI:
          <input
            type="text"
            name="ci"
            value={paciente.ci}
            onChange={handleChange}
            placeholder="Ingrese el CI del paciente"
            className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </label>
        <label className="block">
          Genero:
          <select
            name="genero"
            value={paciente.genero}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="" disabled>
              Seleccione el sexo
            </option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
        </label>
        <label className="block">
          Fecha de Nacimiento:
          <input
            type="date"
            name="fechaNacimiento"
            value={paciente.fechaNacimiento.split("T")[0]}
            onChange={handleChange}
            max={calculateMaxDate()}
            placeholder="Seleccione la fecha de nacimiento"
            className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </label>
        <label className="block">
          Teléfono:
          <input
            type="text"
            name="telefono"
            value={paciente.telefono}
            onChange={handleChange}
            placeholder="Ingrese el teléfono del paciente"
            className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </label>
        {edad < 18 && (
          <>
            <label className="block">
              Teléfono del Tutor:
              <input
                type="text"
                name="telefono_tutor"
                value={paciente.telefono_tutor}
                onChange={handleChange}
                placeholder="Ingrese el teléfono del tutor"
                className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>
            <label className="block">
              Nombre del Tutor:
              <input
                type="text"
                name="nombre_tutor"
                value={paciente.nombre_tutor}
                onChange={handleChange}
                placeholder="Ingrese el nombre del tutor"
                className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>
          </>
        )}
        <div className="mt-4 col-span-full">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default PacientesCrud;
