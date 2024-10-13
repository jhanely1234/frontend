import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthLayout from "./layouts/auth.layout";
import Wrapper from "./layouts/Wrapper";
import Reportes from "./pages/reportes/ReporteConsultas";
import LoginPage from "./pages/auth/login.page";
import RegisterPage from "./pages/auth/register.page";
import PasswordPage from "./pages/auth/forgot-password.page";
import PasswordResetPage from "./pages/auth/reset-password.page";
import DashboardPage from "./pages/store/home.page";
import UsersPage from "./pages/admin/users.page";
import ProductsPage from "./pages/admin/products.page";
import Medicos from "./pages/medico/Medicos";
import MedicosCrud from "./pages/medico/MedicosCrud";
import MedicoProfile from "./pages/medico/MedicoPerfil";
import HistorialMedico from "./pages/medico/HistorialMedico";
import CrearConsulta from "./pages/medico/CrearConsulta";
import Pacientes from "./pages/paciente/Pacientes";
import PacientesCrud from "./pages/paciente/PacientesCrud";
import PacienteProfile from "./pages/paciente/PerfilPaciente";
import Reservas from "./pages/reserva/Reservas";
import ReservasCrud from "./pages/reserva/ReservasCrud";
import DashboardPageRecepcionista from "./pages/recepcionista/dashboard.page";
import UsersPageRecepcionista from "./pages/recepcionista/users.page";
import ProductsPageRecepcionista from "./pages/recepcionista/products.page";
import NotFoundPage from "./pages/404";
import { AuthProvider } from "./providers/auth.provider";
import PrivateRoute from "./components/PrivateRoute";
import { ToastContainer } from "react-toastify"; // Importar ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Importar los estilos de Toastify

const App = () => {
  return (
    <AuthProvider>
      {/* ToastContainer para permitir que se muestren los mensajes de toastify */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="registro" element={<RegisterPage />} />
          <Route path="forgot-password" element={<PasswordPage />} />
          <Route path="reset-password" element={<PasswordResetPage />} />
        </Route>
        <Route path="/" element={<Wrapper />}>
          <Route
            index
            element={
              <PrivateRoute element={DashboardPage} allowedRoles={["admin", "medico", "recepcionista", "paciente"]} />
            }
          />
          <Route
            path="gestor-usuarios"
            element={
              <PrivateRoute element={UsersPage} allowedRoles={["admin"]} />
            }
          />
          <Route
            path="gestor-productos"
            element={
              <PrivateRoute element={ProductsPage} allowedRoles={["admin"]} />
            }
          />
          <Route path="medico">
            <Route
              index
              element={
                <PrivateRoute
                  element={Medicos}
                  allowedRoles={[
                    "admin",
                    "medico",
                    "recepcionista",
                    "paciente"
                  ]}
                />
              }
            />
            <Route
              path="nuevo"
              element={
                <PrivateRoute
                  element={MedicosCrud}
                  allowedRoles={["admin", "medico", "recepcionista"]}
                />
              }
            />
            <Route
              path="editar/:id"
              element={
                <PrivateRoute
                  element={MedicosCrud}
                  allowedRoles={["admin", "medico", "recepcionista"]}
                />
              }
            />
            <Route
              path="profile"
              element={
                <PrivateRoute
                  element={MedicoProfile}
                  allowedRoles={["admin", "medico", "recepcionista"]}
                />
              }
            />
            <Route
              path="consultas/crear/:id"
              element={
                <PrivateRoute
                  element={CrearConsulta}
                  allowedRoles={["admin", "medico", "recepcionista"]}
                />
              }
            />
          </Route>
          <Route path="paciente">
            <Route
              index
              element={
                <PrivateRoute
                  element={Pacientes}
                  allowedRoles={[
                    "admin",
                    "medico",
                    "recepcionista",
                    "paciente"
                  ]}
                />
              }
            />
            <Route
              path="historial/:pacienteId"
              element={
                <PrivateRoute
                  element={HistorialMedico}
                  allowedRoles={["admin", "medico", "recepcionista"]}
                />
              }
            />
            <Route
              path="nuevo"
              element={
                <PrivateRoute
                  element={PacientesCrud}
                  allowedRoles={["admin", "medico", "recepcionista"]}
                />
              }
            />
            <Route
              path="editar/:id"
              element={
                <PrivateRoute
                  element={PacientesCrud}
                  allowedRoles={["admin", "medico", "recepcionista"]}
                />
              }
            />
            <Route
              path="profile"
              element={
                <PrivateRoute
                  element={PacienteProfile}
                  allowedRoles={[
                    "admin",
                    "medico",
                    "recepcionista",
                    "paciente"
                  ]}
                />
              }
            />
          </Route>
          <Route path="recepcionista">
            <Route
              index
              element={
                <PrivateRoute
                  element={DashboardPageRecepcionista}
                  allowedRoles={["recepcionista"]}
                />
              }
            />
            <Route
              path="gestor-usuarios"
              element={
                <PrivateRoute
                  element={UsersPageRecepcionista}
                  allowedRoles={["recepcionista"]}
                />
              }
            />
            <Route
              path="gestor-productos"
              element={
                <PrivateRoute
                  element={ProductsPageRecepcionista}
                  allowedRoles={["recepcionista"]}
                />
              }
            />
          </Route>
          <Route path="reservas">
            <Route
              index
              element={
                <PrivateRoute
                  element={Reservas}
                  allowedRoles={[
                    "admin",
                    "medico",
                    "recepcionista",
                    "paciente"
                  ]}
                />
              }
            />
            <Route
              path="nuevo"
              element={
                <PrivateRoute
                  element={ReservasCrud}
                  allowedRoles={[
                    "admin",
                    "medico",
                    "recepcionista",
                    "paciente"
                  ]}
                />
              }
            />
            <Route
              path="editar/:id"
              element={
                <PrivateRoute
                  element={ReservasCrud}
                  allowedRoles={[
                    "admin",
                    "medico",
                    "recepcionista",
                    "paciente"
                  ]}
                />
              }
            />
          </Route>
          <Route path="reportes">
            <Route
              path="reportes"
              element={
                <PrivateRoute
                  element={Reportes}
                  allowedRoles={[
                    "admin",
                    "medico",
                    "recepcionista",
                    "paciente"
                  ]}
                />
              }
            />

          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
