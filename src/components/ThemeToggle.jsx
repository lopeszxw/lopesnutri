import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "", style = {} }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        padding: "0.5rem 0.85rem",
        borderRadius: "var(--radius-md)",
        border: "1.5px solid var(--border)",
        backgroundColor: "var(--surface)",
        color: "var(--text-main)",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "0.85rem",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        ...style
      }}
      title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
      aria-label="Alternar Tema Claro/Escuro"
    >
      {isDark ? (
        <>
          <Sun size={18} color="#f59e0b" />
          <span>Modo Claro</span>
        </>
      ) : (
        <>
          <Moon size={18} color="#0d7a6b" />
          <span>Modo Escuro</span>
        </>
      )}
    </button>
  );
}
