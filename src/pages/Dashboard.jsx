import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Users, Calendar, Utensils, UserCheck } from "lucide-react";
import { authClient } from "../auth";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: session } = await authClient.getSession();
        if (session && session.user) {
          setUser(session.user);
        }
      } catch (err) {
        console.error("Erro ao carregar usuário", err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Erro ao fazer logout", error);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-main)", color: "var(--text-main)", transition: "background-color 0.3s ease, color 0.3s ease" }}>
      {/* Top Navbar */}
      <header style={{
        backgroundColor: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "0.75rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "var(--shadow-card)",
        transition: "background-color 0.3s ease, border-color 0.3s ease"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Logo size="sm" />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
              <UserCheck size={18} color="var(--primary)" />
              <span>Olá, <strong style={{ color: "var(--text-main)" }}>{user.name || user.email}</strong></span>
            </div>
          )}

          <ThemeToggle />

          <button 
            onClick={handleLogout}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: "transparent",
              border: "1.5px solid var(--border)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              color: "var(--text-muted)",
              fontWeight: "600",
              fontSize: "0.875rem",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--error)";
              e.currentTarget.style.color = "var(--error)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: "1100px", margin: "2.5rem auto", padding: "0 1.5rem" }}>
        {/* Welcome Banner */}
        <div style={{
          background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
          color: "white",
          padding: "2.5rem 2rem",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-card)",
          marginBottom: "2rem",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.5rem" }}>
              Painel de Gestão Nutricional
            </h1>
            <p style={{ opacity: 0.9, fontSize: "1rem", maxWidth: "600px" }}>
              Bem-vindo ao LopesNutri! Seu ambiente completo para gerenciar pacientes, planos alimentares e acompanhamento nutricional com precisão e eficiência.
            </p>
          </div>
        </div>

        {/* Quick Stats Grid Preview */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
          <div style={{
            backgroundColor: "var(--surface)",
            padding: "1.5rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
            transition: "background-color 0.3s ease, border-color 0.3s ease"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-muted)" }}>Pacientes</span>
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users size={20} color="var(--primary)" />
              </div>
            </div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "700" }}>--</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-light)", marginTop: "0.25rem" }}>Pronto para adicionar pacientes</p>
          </div>

          <div style={{
            backgroundColor: "var(--surface)",
            padding: "1.5rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
            transition: "background-color 0.3s ease, border-color 0.3s ease"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-muted)" }}>Consultas Hoje</span>
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Calendar size={20} color="var(--primary)" />
              </div>
            </div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "700" }}>--</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-light)", marginTop: "0.25rem" }}>Nenhuma consulta agendada</p>
          </div>

          <div style={{
            backgroundColor: "var(--surface)",
            padding: "1.5rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
            transition: "background-color 0.3s ease, border-color 0.3s ease"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-muted)" }}>Planos Alimentares</span>
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Utensils size={20} color="var(--primary)" />
              </div>
            </div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "700" }}>--</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-light)", marginTop: "0.25rem" }}>Planos cadastrados no sistema</p>
          </div>
        </div>
      </main>
    </div>
  );
}
