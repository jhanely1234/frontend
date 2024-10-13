import { useState, useEffect, } from 'react';
import { useNavigate } from "react-router-dom";
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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
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
  const handleLogin = () => {
    navigate("/auth/login");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name) {
      setIsLoading(false);
      return toast.error('El nombre es obligatorio');
    }
    if (!lastname) {
      setIsLoading(false);
      return toast.error('El apellido es obligatorio');
    }
    if (!email) {
      setIsLoading(false);
      return toast.error('El email es obligatorio');
    }

    if (!validateEmail(email)) {
      setIsLoading(false);
      return toast.error('El email no es válido');
    }

    if (!password) {
      setIsLoading(false);
      return toast.error('El password es obligatorio');
    }

    if (password.length < 6) {
      setIsLoading(false);
      return toast.error('El password debe contener al menos 6 caracteres');
    }

    if (edad !== null && edad < 18 && (!nombreTutor || !telefonoTutor)) {
      setIsLoading(false);
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
      toast.error('Error al crear el usuario.');
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
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 relative">
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url('/fondo.png')` }}></div>
      <div className="flex flex-col md:flex-row items-center justify-center w-full p-4 relative z-10">
        <div className="bg-white bg-opacity-90 rounded-lg shadow-xl w-full max-w-2xl p-4 sm:p-6 md:p-8 m-4 border-4 border-teal-600">
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <img
              src="/logo_mediconsulta_original.png"
              alt="Logo Medi Consulta"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-teal-900"
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-teal-800 mb-4 sm:mb-6 text-center">
            Registrarse en Medi Consulta
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre(s)
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder="Ingrese su nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos
                </label>
                <input
                  type="text"
                  id="lastname"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder="Ingrese sus apellidos"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                placeholder="Ingrese su correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ci" className="block text-sm font-medium text-gray-700 mb-1">
                  Cédula de Identidad
                </label>
                <input
                  type="text"
                  id="ci"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder="Ingrese su CI"
                  value={ci}
                  onChange={(e) => setCi(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sexo" className="block text-sm font-medium text-gray-700 mb-1">
                  Sexo
                </label>
                <select
                  id="sexo"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value)}
                  required
                >
                  <option value="" disabled>Selecciona el sexo</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="telefono"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder="Ingrese su teléfono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  id="fechaNacimiento"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="edad" className="block text-sm font-medium text-gray-700 mb-1">
                  Edad
                </label>
                <input
                  type="text"
                  id="edad"
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder="Edad calculada"
                  value={edad !== null ? edad : ''}
                  disabled
                />
              </div>
            </div>
            {edad !== null && edad < 18 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombreTutor" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Tutor
                  </label>
                  <input
                    type="text"
                    id="nombreTutor"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="Ingrese el nombre del tutor"
                    value={nombreTutor}
                    onChange={(e) => setNombreTutor(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="telefonoTutor" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono del Tutor
                  </label>
                  <input
                    type="tel"
                    id="telefonoTutor"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="Ingrese el teléfono del tutor"
                    value={telefonoTutor}
                    onChange={(e) => setTelefonoTutor(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150  ease-in-out"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : "Crear Cuenta"}
              </button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <button
                onClick={handleLogin}
                className="font-medium text-teal-600 hover:text-teal-500 focus:outline-none focus:underline transition duration-150 ease-in-out"
              >
                Inicia sesión
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;