import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { authClient } from "../auth";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

export default function AuthLayout() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: session } = await authClient.getSession();
        if (session) {
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        console.error("Auth check error", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="auth-wrapper">
        <div className="auth-top-bar">
          <ThemeToggle />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <Logo size="md" />
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)", fontWeight: "600" }}>
            <div className="spinner" style={{
              width: "20px",
              height: "20px",
              border: "3px solid var(--primary-light)",
              borderTopColor: "var(--primary)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite"
            }} />
            <span>Carregando sistema...</span>
          </div>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-top-bar">
        <ThemeToggle />
      </div>

      <div className="auth-card animate-fade-in">
        <header className="auth-header">
          <Logo variant="stacked" size="md" />
        </header>
        <Outlet />
      </div>
      
      <footer style={{ marginTop: "2rem", color: "var(--text-light)", fontSize: "0.8rem", textAlign: "center", zIndex: 1 }}>
        &copy; {new Date().getFullYear()} LopesNutri &bull; Sistema de Gestão para Nutricionistas
      </footer>
    </div>
  );
}
