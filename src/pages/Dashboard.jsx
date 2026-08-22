import React, { useEffect, useState, useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  Users,
  Calendar,
  ClockAlert,
  ChevronRight,
  UserPlus,
  RefreshCw,
  Sparkles,
  ArrowRight,
  CalendarDays,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  FileText
} from "lucide-react";
import { sql } from "../db";
import { formatDate, formatNutriGreeting } from "../utils/helpers";

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

  // Taxa de Adesão / Retenção Clínica
  const taxaAdesao = useMemo(() => {
    if (stats.totalPacientes === 0) return 100;
    const emDia = Math.max(0, stats.totalPacientes - stats.pacientesSemRetorno.length);
    return Math.round((emDia / stats.totalPacientes) * 100);
  }, [stats.totalPacientes, stats.pacientesSemRetorno.length]);

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
            <Sparkles size={14} />
            <span>Painel Clínico LopesNutri</span>
          </div>
          <h1 className="dashboard-title">
            {getGreeting()}, {formatNutriGreeting(user?.name)}! 👋
          </h1>
          <p className="dashboard-subtitle">
            Visão geral do seu consultório, indicadores clínicos e retornos de pacientes.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <button
            className="btn-refresh"
            onClick={() => fetchDashboardData(true)}
            disabled={loading || refreshing}
            title="Atualizar dados em tempo real"
          >
            <RefreshCw size={15} className={refreshing ? "spin-animation" : ""} />
            <span>{refreshing ? "Atualizando..." : "Atualizar"}</span>
          </button>

          <Link to="/pacientes/novo" className="btn-primary-action">
            <UserPlus size={17} />
            <span>Novo Paciente</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="error-alert-card">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of 3 Top Clinical Metric Cards */}
      <div className="dashboard-stats-grid">
        {/* Card 1: Total de Pacientes Ativos */}
        <div className="stat-card">
          <div>
            <div className="stat-card-top">
              <div className="stat-icon-wrapper icon-users">
                <Users size={22} />
              </div>
              <span className="stat-badge">Base Ativa</span>
            </div>

            <div className="stat-value-group">
              <h2 className="stat-number">
                {loading ? <span className="skeleton-loader" /> : stats.totalPacientes}
              </h2>
              <span className="stat-unit">pacientes</span>
            </div>
            <p className="stat-description">
              Total de pacientes sob seus cuidados clínicos
            </p>
          </div>

          <div className="stat-card-footer">
            <Link to="/pacientes" className="stat-footer-link">
              <span>Ver lista de pacientes</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Card 2: Consultas da Semana */}
        <div className="stat-card">
          <div>
            <div className="stat-card-top">
              <div className="stat-icon-wrapper icon-calendar">
                <Calendar size={22} />
              </div>
              <span className="stat-badge badge-week">Agenda Semanal</span>
            </div>

            <div className="stat-value-group">
              <h2 className="stat-number">
                {loading ? <span className="skeleton-loader" /> : stats.consultasSemana}
              </h2>
              <span className="stat-unit">consultas</span>
            </div>
            <p className="stat-description">
              Atendimentos clínicos agendados na semana corrente
            </p>
          </div>

          <div className="stat-card-footer">
            <div className="stat-footer-info">
              <CalendarDays size={14} />
              <span>Segunda a Domingo</span>
            </div>
          </div>
        </div>

        {/* Card 3: Adesão & Retenção Clínica */}
        <div className="stat-card">
          <div>
            <div className="stat-card-top">
              <div className="stat-icon-wrapper icon-health">
                <HeartPulse size={22} />
              </div>
              <span className="stat-badge badge-adhesion">Adesão Clínica</span>
            </div>

            <div className="stat-value-group">
              <h2 className="stat-number">
                {loading ? <span className="skeleton-loader" /> : `${taxaAdesao}%`}
              </h2>
              <span className="stat-unit">em dia</span>
            </div>
            <p className="stat-description">
              {stats.totalPacientes > 0 && stats.pacientesSemRetorno.length > 0
                ? `${Math.max(0, stats.totalPacientes - stats.pacientesSemRetorno.length)} de ${stats.totalPacientes} pacientes com retornos regulares`
                : "Todos os pacientes em acompanhamento regular"}
            </p>
          </div>

          <div className="stat-card-footer">
            <div className="stat-footer-info">
              <CheckCircle2 size={14} color="var(--primary)" />
              <span>Indicador de retenção ativa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Alertas: Pacientes Sem Retorno */}
      <div className="alert-card-section">
        <div className="card-header-flex">
          <div className="card-header-title-box">
            <div className="stat-icon-wrapper icon-alert">
              <ClockAlert size={20} />
            </div>
            <div>
              <h3 className="card-title">Pacientes sem retorno recente</h3>
              <p className="card-subtitle">
                Pacientes cuja última consulta foi há mais de 30 dias e sem próximo retorno agendado
              </p>
            </div>
          </div>

          <div className="badge-count-warning">
            {loading ? "..." : `${stats.pacientesSemRetorno.length} necessitam de contato`}
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
            <div className="empty-state-box" style={{ padding: "2.5rem 1.5rem" }}>
              <div className="empty-icon-circle">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="empty-title">Nenhum paciente sem retorno no momento</h4>
              <p className="empty-desc">
                Excelente trabalho! Todos os seus pacientes estão com consultas e retornos em dia.
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
                            <Mail size={12} /> {paciente.email}
                          </span>
                        )}
                        {paciente.whatsapp && (
                          <span className="paciente-meta-item">
                            <Phone size={12} /> {paciente.whatsapp}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="paciente-status-col">
                    <div className="consulta-timing-tag">
                      <ClockAlert size={13} />
                      <span>
                        {paciente.ultima_consulta
                          ? `Última consulta: ${formatDate(paciente.ultima_consulta)} (${paciente.dias_sem_consulta} dias)`
                          : `Cadastrado há ${paciente.dias_sem_consulta} dias (sem consultas)`}
                      </span>
                    </div>
                    <div className="action-hover-btn">
                      <span>Ver Perfil</span>
                      <ChevronRight size={15} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feed / Acesso Rápido do Consultório */}
      <div className="dashboard-shortcuts-grid">
        <Link to="/pacientes/novo" className="shortcut-card">
          <div className="shortcut-icon">
            <UserPlus size={20} />
          </div>
          <div>
            <h4 className="shortcut-title">
              Cadastrar Paciente <ChevronRight size={14} />
            </h4>
            <p className="shortcut-desc">
              Inicie uma nova ficha clínica com histórico, antropometria e anamnese completa.
            </p>
          </div>
        </Link>

        <Link to="/pacientes" className="shortcut-card">
          <div className="shortcut-icon">
            <Users size={20} />
          </div>
          <div>
            <h4 className="shortcut-title">
              Gestão de Pacientes <ChevronRight size={14} />
            </h4>
            <p className="shortcut-desc">
              Consulte, filtre e gerencie todos os prontuários e contatos da sua base clínica.
            </p>
          </div>
        </Link>

        <Link to="/pacientes" className="shortcut-card">
          <div className="shortcut-icon">
            <FileText size={20} />
          </div>
          <div>
            <h4 className="shortcut-title">
              Evolução & Consultas <ChevronRight size={14} />
            </h4>
            <p className="shortcut-desc">
              Acompanhe curvas de peso corporal, percentual de gordura e histórico de consultas.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
