import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white py-4 px-6 text-center text-gray-600 text-sm border-t border-gray-200">
      © {new Date().getFullYear()} Centro de Salud MediConsulta. Todos los derechos reservados.
    </footer>
  );
}
