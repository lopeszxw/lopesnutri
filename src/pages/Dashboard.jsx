import React, { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  Users,
  Calendar,
  ClockAlert,
  ChevronRight,
  UserPlus,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  CalendarDays,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { sql } from "../db";
import { formatDate } from "../utils/helpers";

export default function Dashboard() {
  const { user } = useOutletContext() || {};
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalPacientes: 0,
    consultasSemana: 0,
    pacientesSemRetorno: [],
  });
  const [error, setError] = useState(null);

  const fetchDashboardData = async (isManualRefresh = false) => {
    if (!user?.id) return;
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // 1. Total de pacientes cadastrados pela nutricionista logada
      const totalPacientesRes = await sql`
        SELECT COUNT(*)::int AS count 
        FROM pacientes 
        WHERE nutricionista_id = ${user.id}
      `;
      const totalPacientes = totalPacientesRes[0]?.count || 0;

      // 2. Consultas da semana atual da nutricionista logada
      // Semana de segunda a domingo pelo date_trunc('week', CURRENT_DATE)
      const consultasSemanaRes = await sql`
        SELECT COUNT(*)::int AS count 
        FROM consultas c
        JOIN pacientes p ON c.paciente_id = p.id
        WHERE p.nutricionista_id = ${user.id}
          AND c.data_consulta >= date_trunc('week', CURRENT_DATE)
          AND c.data_consulta <= (date_trunc('week', CURRENT_DATE) + INTERVAL '6 days 23 hours 59 minutes 59 seconds')
      `;
      const consultasSemana = consultasSemanaRes[0]?.count || 0;

      // 3. Pacientes sem retorno: última consulta há mais de 30 dias e sem próximo retorno agendado (ou retorno já passado)
      // Também considera pacientes cadastrados há mais de 30 dias que nunca tiveram consulta registrada
      const pacientesSemRetornoRes = await sql`
        SELECT 
          p.id, 
          p.nome, 
          p.email, 
          p.whatsapp,
          p.created_at,
          MAX(c.data_consulta) AS ultima_consulta,
          MAX(c.proximo_retorno) AS proximo_retorno,
          CURRENT_DATE - COALESCE(MAX(c.data_consulta), p.created_at::date) AS dias_sem_consulta
        FROM pacientes p
        LEFT JOIN consultas c ON p.id = c.paciente_id
        WHERE p.nutricionista_id = ${user.id}
        GROUP BY p.id, p.nome, p.email, p.whatsapp, p.created_at
        HAVING 
          (MAX(c.data_consulta) IS NOT NULL AND MAX(c.data_consulta) < CURRENT_DATE - INTERVAL '30 days' AND (MAX(c.proximo_retorno) IS NULL OR MAX(c.proximo_retorno) < CURRENT_DATE))
          OR (MAX(c.data_consulta) IS NULL AND p.created_at::date < CURRENT_DATE - INTERVAL '30 days')
        ORDER BY dias_sem_consulta DESC
        LIMIT 15
      `;

      setStats({
        totalPacientes,
        consultasSemana,
        pacientesSemRetorno: pacientesSemRetornoRes || [],
      });
    } catch (err) {
      console.error("Erro ao carregar métricas do dashboard:", err);
      setError("Não foi possível carregar os dados em tempo real do banco de dados.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="dashboard-container">
      {/* Top Header / Welcome */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="greeting-badge">
            <Sparkles size={15} />
            <span>Painel LopesNutri</span>
          </div>
          <h1 className="dashboard-title">
            {getGreeting()}, {user?.name ? user.name.split(" ")[0] : "Nutricionista"}! 👋
          </h1>
          <p className="dashboard-subtitle">
            Acompanhe o desempenho do seu consultório e o acompanhamento dos seus pacientes.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <button
            className="btn-refresh"
            onClick={() => fetchDashboardData(true)}
            disabled={loading || refreshing}
            title="Atualizar dados em tempo real"
          >
            <RefreshCw size={16} className={refreshing ? "spin-animation" : ""} />
            <span>{refreshing ? "Atualizando..." : "Atualizar"}</span>
          </button>

          <Link to="/pacientes" className="btn-primary-action">
            <UserPlus size={18} />
            <span>Gerenciar Pacientes</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="error-alert-card">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Main 3 Cards as specified in Prompt 3 */}
      <div className="dashboard-main-grid">
        {/* Card 1: Total de pacientes ativos */}
        <div className="stat-card stat-card-primary">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper icon-users">
              <Users size={24} />
            </div>
            <span className="stat-badge">Total Ativos</span>
          </div>

          <div className="stat-card-body">
            <div className="stat-value-group">
              <h2 className="stat-number">
                {loading ? <span className="skeleton-loader" /> : stats.totalPacientes}
              </h2>
              <span className="stat-unit">pacientes</span>
            </div>
            <p className="stat-description">
              Total de pacientes vinculados ao seu cadastro
            </p>
          </div>

          <div className="stat-card-footer">
            <Link to="/pacientes" className="stat-footer-link">
              <span>Ver todos os pacientes</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        {/* Card 2: Consultas da semana */}
        <div className="stat-card stat-card-accent">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper icon-calendar">
              <Calendar size={24} />
            </div>
            <span className="stat-badge badge-week">Esta Semana</span>
          </div>

          <div className="stat-card-body">
            <div className="stat-value-group">
              <h2 className="stat-number">
                {loading ? <span className="skeleton-loader" /> : stats.consultasSemana}
              </h2>
              <span className="stat-unit">consultas</span>
            </div>
            <p className="stat-description">
              Consultas registradas na semana corrente
            </p>
          </div>

          <div className="stat-card-footer">
            <div className="stat-footer-info">
              <CalendarDays size={15} />
              <span>Segunda a Domingo</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pacientes sem retorno */}
        <div className="stat-card stat-card-alert span-full-card">
          <div className="card-header-flex">
            <div className="card-header-title-box">
              <div className="stat-icon-wrapper icon-alert">
                <ClockAlert size={22} />
              </div>
              <div>
                <h3 className="card-title">Pacientes sem retorno</h3>
                <p className="card-subtitle">
                  Pacientes cuja última consulta foi há mais de 30 dias e sem retorno agendado
                </p>
              </div>
            </div>

            <div className="badge-count-warning">
              {loading ? "..." : `${stats.pacientesSemRetorno.length} sem retorno`}
            </div>
          </div>

          <div className="card-content-list-wrapper">
            {loading ? (
              <div className="skeleton-list">
                <div className="skeleton-row" />
                <div className="skeleton-row" />
                <div className="skeleton-row" />
              </div>
            ) : stats.pacientesSemRetorno.length === 0 ? (
              <div className="empty-state-box">
                <div className="empty-icon-circle">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="empty-title">Nenhum paciente sem retorno no momento</h4>
                <p className="empty-desc">
                  Parabéns! Todos os seus pacientes estão com consultas e retornos em dia.
                </p>
              </div>
            ) : (
              <div className="pacientes-sem-retorno-list">
                {stats.pacientesSemRetorno.map((paciente) => (
                  <Link
                    key={paciente.id}
                    to={`/pacientes/${paciente.id}`}
                    className="paciente-sem-retorno-item"
                    title={`Abrir perfil de ${paciente.nome}`}
                  >
                    <div className="paciente-info-col">
                      <div className="paciente-avatar-sm">
                        {paciente.nome ? paciente.nome.charAt(0).toUpperCase() : "P"}
                      </div>
                      <div className="paciente-text-group">
                        <strong className="paciente-nome">{paciente.nome}</strong>
                        <div className="paciente-subdetails">
                          {paciente.email && (
                            <span className="paciente-meta-item">
                              <Mail size={13} /> {paciente.email}
                            </span>
                          )}
                          {paciente.whatsapp && (
                            <span className="paciente-meta-item">
                              <Phone size={13} /> {paciente.whatsapp}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="paciente-status-col">
                      <div className="consulta-timing-tag">
                        <ClockAlert size={14} />
                        <span>
                          {paciente.ultima_consulta
                            ? `Última consulta: ${formatDate(paciente.ultima_consulta)} (${paciente.dias_sem_consulta} dias)`
                            : `Cadastrado há ${paciente.dias_sem_consulta} dias (sem consultas)`}
                        </span>
                      </div>
                      <div className="action-hover-btn">
                        <span>Ver Perfil</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
