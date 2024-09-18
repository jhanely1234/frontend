import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { validateEmail } from '../../helpers/validator.helper';
import axiosClient from '../../services/axios.service';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ci, setCi] = useState('');
  const [sexo, setSexo] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [nombreTutor, setNombreTutor] = useState('');
  const [telefonoTutor, setTelefonoTutor] = useState('');
  const [edad, setEdad] = useState(null);

  useEffect(() => {
    if (fechaNacimiento) {
      const today = new Date();
      const birthDate = new Date(fechaNacimiento);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      setEdad(age);
    }
  }, [fechaNacimiento]);

  const formatFechaNacimiento = (date) => {
    const d = new Date(date);
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const day = (`0${d.getDate()}`).slice(-2);
    const year = d.getFullYear();
    return `${month}-${day}-${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      return toast.error('El nombre es obligatorio');
    }
    if (!lastname) {
      return toast.error('El apellido es obligatorio');
    }
    if (!email) {
      return toast.error('El email es obligatorio');
    }

    if (!validateEmail(email)) {
      return toast.error('El email no es válido');
    }

    if (!password) {
      return toast.error('El password es obligatorio');
    }

    if (password.length < 6) {
      return toast.error('El password debe contener al menos 6 caracteres');
    }

    if (edad !== null && edad < 18 && (!nombreTutor || !telefonoTutor)) {
      return toast.error('El nombre y teléfono del tutor son obligatorios para menores de edad');
    }

    const formattedFechaNacimiento = formatFechaNacimiento(fechaNacimiento);
    const toastLoading = toast.loading('Creando usuario...');

    try {
      const { data } = await axiosClient.post('/auth/register', {
        name,
        lastname,
        email,
        password,
        ci,
        sexo,
        fechaNacimiento: formattedFechaNacimiento,
        telefono,
        nombre_tutor: nombreTutor,
        telefono_tutor: telefonoTutor,
      });

      console.log(data);

      if (data.response === 'success') {
        toast.success('Usuario creado correctamente');
      }
    } catch (error) {
      console.log(error);
      return toast.error('Error al crear el usuario.');
    } finally {
      setName('');
      setLastname('');
      setEmail('');
      setPassword('');
      setCi('');
      setSexo('');
      setFechaNacimiento('');
      setTelefono('');
      setNombreTutor('');
      setTelefonoTutor('');
      toast.dismiss(toastLoading);
    }
  };

  return (
    <div className="register flex flex-col min-h-screen rounded-lg md:p-8">
      <div className="p-8 mb-14">
        <h1 className="text-gray-100 text-3xl font-medium tracking-widest">
          Medi-Consulta
        </h1>
      </div>
      <div className="p-8">
        <h3 className="text-gray-500 uppercase text-sm font-bold mb-2">
          Registrar Cuenta
        </h3>
        <h1 className="text-6xl text-white font-medium mb-2">
          Crea una cuenta<span className="text-cyan-500">.</span>
        </h1>
        <span className="text-gray-500 font-medium">
          ¿Ya eres usuario?{' '}
          <a href="/auth/login" className="text-cyan-500 hover:underline">
            Ingresa
          </a>
        </span>
        <form className="mt-8" onSubmit={handleSubmit}>
          <div className="max-w-lg mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <input
              type="text"
              autoComplete="off"
              className="w-full py-3 px-4 rounded-xl outline-none bg-[#343434] text-gray-100 group"
              placeholder="Nombre(s)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              autoComplete="off"
              className="w-full py-3 px-4 rounded-xl outline-none bg-[#343434] text-gray-100 group"
              placeholder="Apellidos"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
            />
          </div>
          <div className="max-w-lg mb-4">
            <input
              type="email"
              autoComplete="off"
              className="w-full py-3 px-4 rounded-xl outline-none bg-[#343434] text-gray-100 group"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="max-w-lg mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <input
              type="password"
              autoComplete="off"
              className="w-full py-3 px-4 rounded-xl outline-none bg-[#343434] text-gray-100 group"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="text"
              autoComplete="off"
              className="w-full py-3 px-4 rounded-xl outline-none bg-[#343434] text-gray-100 group"
              placeholder="Cédula de identidad"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
            />
          </div>
          <div className="max-w-lg mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <select
              className="w-full py-3 px-4 rounded-xl outline-none bg-[#343434] text-gray-100 group"
              value={sexo}
              onChange={(e) => setSexo(e.target.value)}
            >
              <option value="" disabled>Selecciona el sexo</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
            <input
              type="text"
              autoComplete="off"
              className="w-full py-3 px-4 rounded-xl outline-none bg-[#343434] text-gray-100 group"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          <div className="max-w-lg mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <input
              type="date"
              autoComplete="off"
              className="w-full py-3 px-4 rounded-xl outline-none bg-[#343434] text-gray-100 group"
              placeholder="Fecha de nacimiento"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
            />
            <input
              type="text"
              autoComplete="off"
              className="w-full py-3 px-4 rounded-xl outline-none bg-[#343434] text-gray-100 group"
              placeholder="Edad"
              value={edad !== null ? edad : ''}
              disabled
            />
          </div>
          {edad !== null && edad < 18 && (
            <div className="max-w-lg mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <input
                type="text"
                autoComplete="off"
                className="w-full py-3 px-4 rounded-xl outline-none bg-[#343434] text-gray-100 group"
                placeholder="Nombre del tutor"
                value={nombreTutor}
                onChange={(e) => setNombreTutor(e.target.value)}
              />
              <input
                type="text"
                autoComplete="off"
                className="w-full py-3 px-4 rounded-xl outline-none bg-[#343434] text-gray-100 group"
                placeholder="Teléfono del tutor"
                value={telefonoTutor}
                onChange={(e) => setTelefonoTutor(e.target.value)}
              />
            </div>
          )}
          <div className="max-w-lg flex justify-center md:justify-end mb-6">
            <a
              href="/auth/forgot-password"
              className="text-gray-500 font-medium hover:text-gray-300 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div className="max-w-lg">
            <button className="bg-cyan-600 text-white w-full py-3 px-4 rounded-full hover:bg-cyan-700 transition-colors">
              Crear cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
