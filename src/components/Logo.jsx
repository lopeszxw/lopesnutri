import React from "react";
import { useTheme } from "../context/ThemeContext";

export default function Logo({ size = "md", showSubtitle = true, className = "" }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const sizeStyles = {
    sm: { width: "160px" },
    md: { width: "210px" },
    lg: { width: "270px" },
    xl: { width: "330px" }
  };

  return (
    <div 
      className={`logo-wrapper ${className}`} 
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease"
      }}
    >
      <img 
        src={isDark ? "/logo-dark.png" : "/logo.png"} 
        alt="LopesNutri - Sistema de Gestão para Nutricionistas" 
        style={{ 
          maxHeight: "100%", 
          objectFit: "contain",
          filter: isDark 
            ? "drop-shadow(0 4px 16px rgba(47, 163, 142, 0.3))" 
            : "drop-shadow(0 4px 12px rgba(13, 122, 107, 0.08))",
          transition: "opacity 0.3s ease, transform 0.3s ease, filter 0.3s ease",
          ...sizeStyles[size]
        }} 
      />
    </div>
  );
}
