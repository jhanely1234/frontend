'use client'

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, subYears } from "date-fns";
import {
  crearMedico,
  actualizarMedico,
  obtenerMedicoPorId
} from "../../api/medicoapi";
import {
  obtenerTodasEspecialidades,
  crearEspecialidad
} from "../../api/especialidadesapi";
import Swal from "sweetalert2";
import {
  FiPlus,
  FiTrash,
  FiSave,
  FiCalendar,
  FiPhone,
  FiMail,
  FiLock,
  FiUser,
  FiUsers
} from "react-icons/fi";
import { Dialog, Transition } from "@headlessui/react";

const diasSemana = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado"
];

const turnos = ["mañana", "tarde", "ambos"];

const horariosManana = [
  { value: "08:00", label: "08:00 AM" },
  { value: "09:00", label: "09:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" }
];

const horariosTarde = [
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "01:00 PM" },
  { value: "14:00", label: "02:00 PM" },
  { value: "15:00", label: "03:00 PM" },
  { value: "16:00", label: "04:00 PM" },
  { value: "17:00", label: "05:00 PM" }
];

export default function Component() {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      especialidades: [],
      disponibilidad: [],
      turno: ""
    }
  });
  const [especialidades, setEspecialidades] = useState([]);
  const [newEspecialidad, setNewEspecialidad] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const watchEspecialidades = watch("especialidades");
  const watchTurno = watch("turno");

  useEffect(() => {
    fetchEspecialidades();
    if (id) {
      setIsEditing(true);
      fetchMedico(id);
    }
  }, [id]);

  const fetchEspecialidades = async () => {
    try {
      setIsLoading(true);
      const response = await obtenerTodasEspecialidades();
      if (response.status === "success" && Array.isArray(response.especialidades)) {
        setEspecialidades(
          response.especialidades.map((especialidad) => ({
            value: especialidad._id,
            label: especialidad.name
          }))
        );
      } else {
        throw new Error("Formato de respuesta inesperado");
      }
    } catch (error) {
      console.error("Error fetching especialidades:", error);
      Swal.fire("Error", "No se pudieron cargar las especialidades", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMedico = async (medicoId) => {
    try {
      setIsLoading(true);
      const data = await obtenerMedicoPorId(medicoId);
      Object.keys(data).forEach((key) => {
        if (key === "fechaNacimiento") {
          setValue(key, new Date(data[key]));
        } else if (key === "especialidades") {
          setValue(
            key,
            data[key].map((esp) => ({ value: esp._id, label: esp.name }))
          );
        } else if (key === "turno") {
          setValue("turno", data[key]);
        } else {
          setValue(key, data[key]);
        }
      });
    } catch (error) {
      console.error("Error fetching medico:", error);
      Swal.fire(
        "Error",
        "No se pudo cargar la información del médico",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const medicoData = {
        ...data,
        especialidades: data.especialidades.map((e) => e.value),
        fechaNacimiento: format(data.fechaNacimiento, "yyyy-MM-dd")
      };

      const isMedicoGeneral = data.especialidades.some(
        (esp) => esp.label.toLowerCase() === "medicina general"
      );

      if (isMedicoGeneral) {
        medicoData.turno = data.turno;
        if (data.turno === "ambos") {
          if (data.especialidades.length > 1) {
            Swal.fire("Error", "No se pueden seleccionar otras especialidades cuando Medicina General tiene turno 'ambos'", "error");
            setIsLoading(false);
            return;
          }
          delete medicoData.disponibilidad;
        } else {
          const otrasEspecialidades = data.especialidades.filter(
            (esp) => esp.label.toLowerCase() !== "medicina general"
          );
          if (otrasEspecialidades.length > 0) {
            const horariosPermitidos = data.turno === "mañana" ? horariosTarde : horariosManana;
            medicoData.disponibilidad = data.disponibilidad
              .filter((d) => otrasEspecialidades.some((esp) => esp.value === d.especialidad))
              .filter((d) => horariosPermitidos.some((h) => h.value === d.inicio))
              .map(({ dia, inicio, fin, especialidad }) => ({
                dia,
                inicio,
                fin,
                especialidad
              }));
          } else {
            delete medicoData.disponibilidad;
          }
        }
      } else {
        delete medicoData.turno;
        medicoData.disponibilidad = data.disponibilidad.map(
          ({ dia, inicio, fin, especialidad }) => ({
            dia,
            inicio,
            fin,
            especialidad
          })
        );
      }

      if (isEditing) {
        await actualizarMedico(id, medicoData);
      } else {
        await crearMedico(medicoData);
      }
      navigate("/medico");
    } catch (error) {
      console.error("Error saving medico:", error);
      Swal.fire("Error", "No se pudo guardar la información del médico", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEspecialidad = async () => {
    if (!newEspecialidad) {
      Swal.fire(
        "Error",
        "El nombre de la especialidad no puede estar vacío",
        "error"
      );
      return;
    }
    try {
      setIsLoading(true);
      const createdEspecialidad = await crearEspecialidad({
        name: newEspecialidad
      });
      setEspecialidades([
        ...especialidades,
        { value: createdEspecialidad._id, label: createdEspecialidad.name }
      ]);
      setNewEspecialidad("");
      setIsModalOpen(false);
      Swal.fire("Éxito", "Especialidad creada correctamente", "success");
    } catch (error) {
      console.error("Error creating especialidad:", error);
      Swal.fire("Error", "No se pudo crear la especialidad", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const isMedicoGeneral = watchEspecialidades.some(
    (esp) => esp.label.toLowerCase() === "medicina general"
  );

  const showDisponibilidad = isMedicoGeneral
    ? watchTurno !== "ambos"
    : watchEspecialidades.length > 0;

  const getHorariosDisponibles = () => {
    if (isMedicoGeneral) {
      return watchTurno === "mañana" ? horariosTarde : horariosManana;
    }
    return [...horariosManana, ...horariosTarde];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        {isEditing ? "Editar Médico" : "Agregar Nuevo Médico"}
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-lg space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiUser className="inline-block mr-2" />
              Nombre:
            </label>
            <input
              {...register("name", { required: "El nombre es requerido" })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              placeholder="Ingrese el nombre"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiUser className="inline-block mr-2" />
              Apellido:
            </label>
            <input
              {...register("lastname", {
                required: "El apellido es requerido"
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              placeholder="Ingrese el apellido"
            />
            {errors.lastname && (
              <p className="text-red-500 text-xs mt-1">
                {errors.lastname.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiMail className="inline-block mr-2" />
              Email:
            </label>
            <input
              {...register("email", {
                required: "El email es requerido",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Email inválido"
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              placeholder="ejemplo@correo.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiLock className="inline-block mr-2" />
              Contraseña:
            </label>
            <input
              type="password"
              {...register("password", {
                required: "La contraseña es requerida"
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              placeholder="Ingrese la contraseña"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiUser className="inline-block mr-2" />
              CI:
            </label>
            <input
              type="number"
              {...register("ci", {
                required: "El CI es requerido",
                min: {
                  value: 100000,
                  message: "El CI debe tener al menos 6 dígitos"
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              placeholder="Ingrese el CI (mínimo 6 dígitos)"
            />
            {errors.ci && (
              <p className="text-red-500 text-xs mt-1">{errors.ci.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiUsers className="inline-block mr-2" />
              Género:
            </label>
            <select
              {...register("genero", { required: "El género es requerido" })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            >
              <option value="" disabled>
                Seleccione el género
              </option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
            {errors.genero && (
              <p className="text-red-500 text-xs mt-1">{errors.genero.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiCalendar className="inline-block mr-2" />
              Fecha de Nacimiento:
            </label>
            <Controller
              name="fechaNacimiento"
              control={control}
              rules={{
                required: "La fecha de nacimiento es requerida",
                validate: (value) => {
                  const age = new Date().getFullYear() - value.getFullYear();
                  return age >= 18 || "Debe ser mayor de 18 años";
                }
              }}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  maxDate={subYears(new Date(), 18)}
                  showYearDropdown
                  dateFormatCalendar="MMMM"
                  yearDropdownItemNumber={100}
                  scrollableYearDropdown
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  placeholderText="Seleccione la fecha de nacimiento"
                />
              )}
            />
            {errors.fechaNacimiento && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fechaNacimiento.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiPhone className="inline-block mr-2" />
              Teléfono:
            </label>
            <input
              type="number"
              {...register("telefono", {
                required: "El teléfono es requerido",
                min: {
                  value: 10000000,
                  message: "El teléfono debe tener al menos 8 dígitos"
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              placeholder="Ingrese el teléfono (mínimo 8 dígitos)"
            />
            {errors.telefono && (
              <p className="text-red-500 text-xs mt-1">
                {errors.telefono.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-blue-700">
            Especialidades
          </h2>
          <div className="flex items-center mb-4">
            <Controller
              name="especialidades"
              control={control}
              rules={{
                required: "Debe seleccionar al menos una especialidad",
                validate: (value) => {
                  const isMedicoGeneral = value.some(esp => esp.label.toLowerCase() === "medicina general");
                  if (isMedicoGeneral && watchTurno === "ambos" && value.length > 1) {
                    return "No se pueden seleccionar otras especialidades cuando Medicina General tiene turno 'ambos'";
                  }
                  return true;
                }
              }}
              render={({ field }) => (
                <Select
                  {...field}
                  isMulti
                  options={especialidades}
                  className="flex-grow"
                  classNamePrefix="select"
                  placeholder="Seleccione una o más especialidades"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: "#e2e8f0",
                      "&:hover": {
                        borderColor: "#3b82f6"
                      }
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? "#3b82f6"
                        : state.isFocused
                        ? "#bfdbfe"
                        : "white",
                      color: state.isSelected ? "white" : "#1f2937"
                    })
                  }}
                />
              )}
            />
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="ml-2 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              <FiPlus />
            </button>
          </div>
          {errors.especialidades && (
            <p className="text-red-500 text-xs mt-1">
              {errors.especialidades.message}
            </p>
          )}
        </div>

        {isMedicoGeneral && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Turno para Medicina General:
            </label>
            <select
              {...register("turno", {
                required: "Debe seleccionar un turno para Medicina General"
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            >
              <option value="">Seleccione el turno</option>
              {turnos.map((turno) => (
                <option key={turno} value={turno}>
                  {turno}
                </option>
              ))}
            </select>
            {errors.turno && (
              <p className="text-red-500 text-xs mt-1">
                {errors.turno.message}
              </p>
            )}
          </div>
        )}

        {showDisponibilidad && (
          <div>
            <h2 className="text-xl font-semibold mb-2 text-blue-700">
              Disponibilidad
            </h2>
            <Controller
              name="disponibilidad"
              control={control}
              defaultValue={[]}
              rules={{
                validate: (value) => {
                  if (isMedicoGeneral && watchTurno !== "ambos") {
                    const otrasEspecialidades = watchEspecialidades.filter(
                      (esp) => esp.label.toLowerCase() !== "medicina general"
                    );
                    return otrasEspecialidades.length === 0 || value.length > 0 || 
                      "Debe agregar al menos una disponibilidad para las especialidades adicionales";
                  }
                  return watchEspecialidades.length === 0 || value.length > 0 || 
                    "Debe agregar al menos una disponibilidad";
                }
              }}
              render={({ field }) => (
                <>
                  {field.value.map((item, index) => (
                    <div
                      key={index}
                      className="mb-4 border p-4 rounded-lg bg-blue-50"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-blue-700">
                          Horario {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newDisponibilidad = [...field.value];
                            newDisponibilidad.splice(index, 1);
                            field.onChange(newDisponibilidad);
                          }}
                          className="text-red-500 hover:text-red-700 transition duration-200"
                        >
                          <FiTrash />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Día:
                          </label>
                          <select
                            value={item.dia}
                            onChange={(e) => {
                              const newDisponibilidad = [...field.value];
                              newDisponibilidad[index].dia = e.target.value;
                              field.onChange(newDisponibilidad);
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                          >
                            <option value="">Seleccione un día</option>
                            {diasSemana.map((dia) => (
                              <option key={dia} value={dia}>
                                {dia}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Inicio:
                          </label>
                          <select
                            value={item.inicio}
                            onChange={(e) => {
                              const newDisponibilidad = [...field.value];
                              newDisponibilidad[index].inicio = e.target.value;
                              field.onChange(newDisponibilidad);
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                          >
                            <option value="">Seleccione hora de inicio</option>
                            {getHorariosDisponibles().map((hora) => (
                              <option key={hora.value} value={hora.value}>
                                {hora.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Fin:
                          </label>
                          <select
                            value={item.fin}
                            onChange={(e) => {
                              const newDisponibilidad = [...field.value];
                              newDisponibilidad[index].fin = e.target.value;
                              field.onChange(newDisponibilidad);
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                          >
                            <option value="">Seleccione hora de fin</option>
                            {getHorariosDisponibles().map((hora) => (
                              <option key={hora.value} value={hora.value}>
                                {hora.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Especialidad:
                          </label>
                          <select
                            value={item.especialidad}
                            onChange={(e) => {
                              const newDisponibilidad = [...field.value];
                              newDisponibilidad[index].especialidad =
                                e.target.value;
                              field.onChange(newDisponibilidad);
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                          >
                            <option value="">Seleccione la especialidad</option>
                            {watchEspecialidades
                              ?.filter(
                                (esp) =>
                                  esp.label.toLowerCase() !== "medicina general"
                              )
                              .map((esp) => (
                                <option key={esp.value} value={esp.value}>
                                  {esp.label}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      field.onChange([
                        ...field.value,
                        { dia: "", inicio: "", fin: "", especialidad: "" }
                      ]);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center transition duration-200"
                  >
                    <FiPlus className="mr-2" /> Agregar Disponibilidad
                  </button>
                </>
              )}
            />
            {errors.disponibilidad && (
              <p className="text-red-500 text-xs mt-1">
                {errors.disponibilidad.message}
              </p>
            )}
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200 flex items-center justify-center"
          >
            <FiSave className="mr-2" />
            {isEditing ? "Actualizar Médico" : "Agregar Médico"}
          </button>
        </div>
      </form>

      <Transition appear show={isModalOpen} as={React.Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsModalOpen(false)}
        >
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Crear Nueva Especialidad
                  </Dialog.Title>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={newEspecialidad}
                      onChange={(e) => setNewEspecialidad(e.target.value)}
                      placeholder="Nombre de la nueva especialidad"
                      className="w-full p-2 border rounded-md focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    />
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={handleCreateEspecialidad}
                    >
                      Crear
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}