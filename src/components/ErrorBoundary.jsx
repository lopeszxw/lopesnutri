import React from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            background: "var(--bg-main, #f8fafc)",
            color: "var(--text-main, #0f172a)",
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: "520px",
              width: "100%",
              background: "var(--surface, #ffffff)",
              padding: "2.5rem 2rem",
              borderRadius: "16px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
              border: "1px solid var(--border, #e2e8f0)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                background: "rgba(239, 68, 68, 0.12)",
                color: "#ef4444",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h2 style={{ fontSize: "1.35rem", fontWeight: "700", marginBottom: "0.5rem" }}>
              Ops! Algo inesperado aconteceu
            </h2>
            <p style={{ color: "var(--text-muted, #64748b)", fontSize: "0.92rem", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              Ocorreu um erro ao renderizar este módulo. Detalhes: {this.state.error?.message || "Erro desconhecido"}
            </p>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                onClick={this.handleGoBack}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.65rem 1.25rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border, #cbd5e1)",
                  background: "transparent",
                  color: "var(--text-main, #334155)",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                <ArrowLeft size={16} />
                <span>Voltar ao Início</span>
              </button>

              <button
                onClick={this.handleReload}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.65rem 1.25rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "var(--primary, #0d7a6b)",
                  color: "#ffffff",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                <RefreshCw size={16} />
                <span>Recarregar Página</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
