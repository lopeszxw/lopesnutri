import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, LogOut, Sparkles, X } from "lucide-react";
import { authClient } from "../auth";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

export default function Sidebar({ user, isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Pacientes",
      path: "/pacientes",
      icon: Users,
    },
  ];

  const getInitials = (name = "") => {
    if (!name) return "N";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isOpen ? "open" : ""}`}>
        {/* Sidebar Header with LopesNutri Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo-container">
            <Logo variant="horizontal" size="sm" forceTheme="dark" />
          </div>
          {onClose && (
            <button
              className="sidebar-close-btn"
              onClick={onClose}
              aria-label="Fechar menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Navegação Principal</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
                onClick={() => {
                  if (onClose) onClose();
                }}
              >
                <div className="nav-icon-box">
                  <Icon size={20} />
                </div>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Pro / Helper Badge */}
        <div className="sidebar-badge-card">
          <div className="badge-card-icon">
            <Sparkles size={18} />
          </div>
          <div className="badge-card-content">
            <strong>LopesNutri Pro</strong>
            <p>Gestão clínica completa & acompanhamento</p>
          </div>
        </div>

        {/* User Profile & Footer Controls */}
        <div className="sidebar-footer">
          <div className="sidebar-user-box">
            <div className="user-avatar-circle">
              {getInitials(user?.name || user?.email)}
            </div>
            <div className="user-details-text">
              <div className="user-name" title={user?.name || "Nutricionista"}>
                {user?.name || "Nutricionista"}
              </div>
              <div className="user-email" title={user?.email || ""}>
                {user?.email || ""}
              </div>
            </div>
          </div>

          <div className="sidebar-footer-actions">
            <div className="theme-toggle-wrapper">
              <ThemeToggle />
            </div>

            <button
              className="logout-btn"
              onClick={handleLogout}
              title="Sair do sistema"
            >
              <LogOut size={18} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
