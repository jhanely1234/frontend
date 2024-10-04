import React from "react";
import { useForm } from "react-hook-form";
import { actualizarPaciente } from "../../api/pacienteapi";
import Swal from "sweetalert2";

export default function BasicEditModal({ closeModal, user }) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            telefono: user.telefono || "",
            email: user.email || "",
            password: "",
        }
    });

    const onSubmit = async (data) => {
        try {
            await actualizarPaciente(user._id, data);
            Swal.fire("Éxito", "Datos actualizados correctamente", "success");
            closeModal();
        } catch (error) {
            Swal.fire("Error", "No se pudo actualizar la información", "error");
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Editar Perfil</h2>
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

                <button className="bg-blue-500 text-white p-2 rounded">Guardar Cambios</button>
            </form>
        </div>
    );
}
