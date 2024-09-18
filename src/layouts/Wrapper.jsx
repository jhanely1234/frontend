import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import TopHeader from "../components/common/TopHeader";
import Sidebar from "../components/common/Sidebar";
import Footer from "../components/common/Footer";

export default function Wrapper() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopHeader toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
