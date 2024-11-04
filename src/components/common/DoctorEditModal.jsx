import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { actualizarMedico, obtenerMedicoPorId2 } from "../../api/medicoapi"; // Usar la API que mencionaste
import Swal from "sweetalert2";

const diasSemana = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
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

export default function DoctorEditModal({ closeModal, user }) {
    const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            telefono: user.telefono || "",
            email: user.email || "",
            password: "",
            especialidades: [],
            turno: "",
            disponibilidad: [],
        }
    });

    const [especialidades, setEspecialidades] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [modificarEspecialidades, setModificarEspecialidades] = useState(false); // Nueva variable de estado
    const watchEspecialidades = watch("especialidades");

    useEffect(() => {
        // Cargar especialidades y mapeo correcto de datos del médico
        const fetchMedicoData = async () => {
            try {
                setIsLoading(true);
                const data = await obtenerMedicoPorId2(user._id);

                // Mapear especialidades
                const especialidadesMapped = data.medico.especialidades.map((esp) => ({
                    value: esp.especialidad._id,
                    label: esp.especialidad.name,
                    turno: esp.turno || "",
                    disponibilidades: esp.disponibilidades || []
                }));

                // Establecer valores iniciales en el formulario
                setValue("especialidades", especialidadesMapped);
                setValue("turno", especialidadesMapped.find((esp) => esp.label === "Medicina General")?.turno || "");
                setValue("disponibilidad", especialidadesMapped.flatMap(esp => esp.disponibilidades));

                setEspecialidades(especialidadesMapped);
            } catch (error) {
                Swal.fire("Error", "Error al cargar los datos del médico", "error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMedicoData();
    }, [user._id, setValue]);

    const onSubmit = async (data) => {
        try {
            // Mapear los datos antes de enviarlos
            const mappedData = {
                telefono: data.telefono,
                email: data.email,
                password: data.password || undefined,
            };

            // Solo enviar especialidades y disponibilidad si se desea modificarlas
            if (modificarEspecialidades) {
                mappedData.especialidades = data.especialidades.map((esp) => ({
                    especialidad: esp.value,
                    turno: esp.turno,
                    disponibilidades: data.disponibilidad
                        .filter((disp) => disp.especialidad === esp.value)
                        .map(({ dia, inicio, fin }) => ({ dia, inicio, fin }))
                }));
            }

            await actualizarMedico(user._id, mappedData);
            Swal.fire("Éxito", "Datos actualizados correctamente", "success");
            closeModal();
        } catch (error) {
            Swal.fire("Error", "No se pudo actualizar la información", "error");
        }
    };

    const getHorariosDisponibles = () => {
        return watchEspecialidades.some((esp) => esp.label === "Medicina General" && esp.turno === "mañana")
            ? horariosTarde
            : horariosManana;
    };

    const handleSpecialtyEditQuestion = (response) => {
        setModificarEspecialidades(response === "yes");
    };

    return (
        <div>
            <p className="text-lg">{user.name} {user.lastname}</p>

            {/* Pregunta si quiere modificar especialidades y disponibilidad */}
            <div className="mb-6">
                <p className="text-gray-700">¿Desea modificar sus especialidades, disponibilidad y turno?</p>
                <button
                    type="button"
                    onClick={() => handleSpecialtyEditQuestion("yes")}
                    className="mr-2 bg-green-500 text-white px-4 py-2 rounded-lg"
                >
                    Sí
                </button>
                <button
                    type="button"
                    onClick={() => handleSpecialtyEditQuestion("no")}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                    No
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label>Email</label>
                    <input
                        {...register("email", { required: "El email es obligatorio" })}
                        className="border w-full p-2"
                        type="email"
                    />
                    {errors.email && <span>{errors.email.message}</span>}
                </div>

                <div>
                    <label>Teléfono</label>
                    <input
                        {...register("telefono", { required: "El teléfono es obligatorio" })}
                        className="border w-full p-2"
                        type="tel"
                    />
                    {errors.telefono && <span>{errors.telefono.message}</span>}
                </div>

                <div>
                    <label>Contraseña</label>
                    <input {...register("password")} className="border w-full p-2" type="password" />
                </div>

                {/* Mostrar campos adicionales solo si se desea modificar especialidades y disponibilidad */}
                {modificarEspecialidades && (
                    <>
                        <div>
                            <label>Especialidades</label>
                            <Controller
                                control={control}
                                name="especialidades"
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        isMulti
                                        options={especialidades.map(esp => ({ value: esp.value, label: esp.label }))}
                                        className="basic-multi-select"
                                        classNamePrefix="select"
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <label>Turno</label>
                            <select {...register("turno")} className="border w-full p-2">
                                {turnos.map((turno) => (
                                    <option key={turno} value={turno}>
                                        {turno}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label>Disponibilidad</label>
                            <Controller
                                control={control}
                                name="disponibilidad"
                                render={({ field }) => (
                                    <>
                                        {field.value.map((item, index) => (
                                            <div key={index} className="mb-4 border p-4 rounded-lg bg-blue-50">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-semibold text-blue-700">Horario {index + 1}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newDisponibilidad = [...field.value];
                                                            newDisponibilidad.splice(index, 1);
                                                            field.onChange(newDisponibilidad);
                                                        }}
                                                        className="text-red-500 hover:text-red-700 transition duration-200"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label>Día</label>
                                                        <select
                                                            value={item.dia}
                                                            onChange={(e) => {
                                                                const newDisponibilidad = [...field.value];
                                                                newDisponibilidad[index].dia = e.target.value;
                                                                field.onChange(newDisponibilidad);
                                                            }}
                                                            className="border w-full p-2"
                                                        >
                                                            {diasSemana.map((dia) => (
                                                                <option key={dia} value={dia}>
                                                                    {dia}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label>Inicio</label>
                                                        <select
                                                            value={item.inicio}
                                                            onChange={(e) => {
                                                                const newDisponibilidad = [...field.value];
                                                                newDisponibilidad[index].inicio = e.target.value;
                                                                field.onChange(newDisponibilidad);
                                                            }}
                                                            className="border w-full p-2"
                                                        >
                                                            {getHorariosDisponibles().map((hora) => (
                                                                <option key={hora.value} value={hora.value}>
                                                                    {hora.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label>Fin</label>
                                                        <select
                                                            value={item.fin}
                                                            onChange={(e) => {
                                                                const newDisponibilidad = [...field.value];
                                                                newDisponibilidad[index].fin = e.target.value;
                                                                field.onChange(newDisponibilidad);
                                                            }}
                                                            className="border w-full p-2"
                                                        >
                                                            {getHorariosDisponibles().map((hora) => (
                                                                <option key={hora.value} value={hora.value}>
                                                                    {hora.label}
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
                                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                                        >
                                            Agregar Disponibilidad
                                        </button>
                                    </>
                                )}
                            />
                        </div>
                    </>
                )}

                <button className="bg-blue-500 text-white p-2 rounded">Guardar Cambios</button>
            </form>
        </div>
    );
}
