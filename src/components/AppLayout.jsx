import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { authClient } from "../auth";
import Sidebar from "./Sidebar";
import Logo from "./Logo";

export default function AppLayout() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: session } = await authClient.getSession();
        if (session && session.user) {
          setUser(session.user);
        }
      } catch (err) {
        console.error("Erro ao carregar usuário na sessão:", err);
      }
    };
    fetchUser();
  }, []);

  // Fechar sidebar ao mudar de rota em dispositivos móveis
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-container">
      {/* Fixed Sidebar */}
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="app-main-wrapper">
        {/* Mobile Header Bar */}
        <header className="mobile-topbar">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu de navegação"
          >
            <Menu size={24} />
          </button>

          <div className="mobile-logo-wrap">
            <Logo size="sm" />
          </div>
        </header>

        {/* Content Outlet */}
        <main className="app-content-container">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}
