import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { authClient } from "../auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Preencha todos os campos para continuar.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: authError } = await authClient.signIn.email({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message || "Email ou senha incorretos.");
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao tentar fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "0.25rem" }}>
          Acesse sua Conta
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Entre com suas credenciais de nutricionista
        </p>
      </div>
      
      {error && (
        <div className="error-message">
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="email">Email profissional</label>
          <div className="input-wrapper">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              id="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nutri@exemplo.com"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
        </div>
        
        <div className="input-group">
          <label htmlFor="password">Senha</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="input-field"
              style={{ paddingRight: "2.75rem" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              disabled={isLoading}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? (
            "Entrando..."
          ) : (
            <>
              <LogIn size={19} />
              <span>Entrar no Sistema</span>
            </>
          )}
        </button>
      </form>
      
      <div className="auth-footer">
        <span>Não tem uma conta ainda? </span>
        <Link to="/register">Cadastre-se aqui</Link>
      </div>
    </div>
  );
}
