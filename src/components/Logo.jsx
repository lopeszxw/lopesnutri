import React from "react";
import { useTheme } from "../context/ThemeContext";

export default function Logo({ 
  variant = "horizontal", 
  size = "md", 
  forceTheme = null, 
  className = "",
  style = {}
}) {
  const { theme } = useTheme();
  const activeTheme = forceTheme || theme || "light";
  const isDark = activeTheme === "dark";

  let src = "/logo-horizontal.png";
  if (variant === "stacked") {
    src = isDark ? "/logo-dark.png" : "/logo.png";
  } else if (variant === "symbol") {
    src = isDark ? "/logo-symbol-dark.png" : "/logo-symbol.png";
  } else {
    src = isDark ? "/logo-horizontal-dark.png" : "/logo-horizontal.png";
  }

  const dimensions = {
    horizontal: {
      xs: { height: "24px", maxWidth: "120px" },
      sm: { height: "32px", maxWidth: "165px" },
      md: { height: "40px", maxWidth: "205px" },
      lg: { height: "50px", maxWidth: "250px" },
      xl: { height: "64px", maxWidth: "310px" }
    },
    stacked: {
      xs: { height: "36px", maxWidth: "60px" },
      sm: { height: "54px", maxWidth: "90px" },
      md: { height: "74px", maxWidth: "130px" },
      lg: { height: "98px", maxWidth: "170px" },
      xl: { height: "130px", maxWidth: "220px" }
    },
    symbol: {
      xs: { height: "24px", width: "24px" },
      sm: { height: "32px", width: "32px" },
      md: { height: "44px", width: "44px" },
      lg: { height: "60px", width: "60px" },
      xl: { height: "80px", width: "80px" }
    }
  };

  const currentSize = dimensions[variant]?.[size] || dimensions.horizontal.md;

  return (
    <div 
      className={`logo-wrapper ${className}`} 
      style={{ 
        display: "inline-flex", 
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
        ...style
      }}
    >
      <img 
        src={src} 
        alt="LopesNutri - Gestão Clínica e Nutricional" 
        style={{ 
          height: currentSize.height,
          maxWidth: currentSize.maxWidth || "100%",
          width: currentSize.width || "auto",
          objectFit: "contain",
          display: "block",
          filter: isDark ? "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" : "none",
          transition: "opacity 0.25s ease, transform 0.25s ease"
        }} 
      />
    </div>
  );
}
