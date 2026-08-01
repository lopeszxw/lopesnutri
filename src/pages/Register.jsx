import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, UserPlus, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { authClient } from "../auth";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!name || !email || !password || !confirmPassword) {
      setError("Preencha todos os campos para se cadastrar.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas informadas não coincidem.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: authError } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (authError) {
        throw new Error(authError.message || "Erro ao criar conta de nutricionista.");
      }

      // Salvar nome e email na tabela nutricionistas via API do servidor Vite
      const response = await fetch("/api/register-nutricionista", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: data.user.id,
          nome: name,
          email: email
        })
      });

      if (!response.ok) {
        throw new Error("Conta criada na autenticação, mas falha ao salvar dados do nutricionista.");
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao tentar criar a conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "0.25rem" }}>
          Crie sua Conta
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Cadastre-se e comece a gerenciar suas consultas
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
          <label htmlFor="name">Nome completo</label>
          <div className="input-wrapper">
            <User size={18} className="input-icon" />
            <input
              type="text"
              id="name"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dra. Maria Silva"
              disabled={isLoading}
              autoComplete="name"
            />
          </div>
        </div>

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
              placeholder="seu@email.com"
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
              placeholder="Mínimo 6 caracteres"
              disabled={isLoading}
              autoComplete="new-password"
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

        <div className="input-group">
          <label htmlFor="confirmPassword">Confirmar senha</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              className="input-field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita sua senha"
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>
        </div>
        
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? (
            "Criando conta..."
          ) : (
            <>
              <UserPlus size={19} />
              <span>Criar Conta de Nutricionista</span>
            </>
          )}
        </button>
      </form>
      
      <div className="auth-footer">
        <span>Já possui uma conta? </span>
        <Link to="/login">Faça Login</Link>
      </div>
    </div>
  );
}
