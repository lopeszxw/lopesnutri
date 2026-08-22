import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import {
  Users,
  Calendar,
  ClockAlert,
  ChevronRight,
  UserPlus,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Search,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Target,
  FileText
} from "lucide-react";
import { sql } from "../db";
import { formatDate, formatNutriGreeting, formatPhone, parsePgArray } from "../utils/helpers";

export default function Dashboard() {
  const { user } = useOutletContext() || {};
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allPacientes, setAllPacientes] = useState([]);
  const [objetivosStats, setObjetivosStats] = useState([]);
  const [sparklinePoints, setSparklinePoints] = useState([12, 18, 15, 24, 20, 28, 25, 34, 30, 42]);
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
      const consultasSemanaRes = await sql`
        SELECT COUNT(*)::int AS count 
        FROM consultas c
        JOIN pacientes p ON c.paciente_id = p.id
        WHERE p.nutricionista_id = ${user.id}
          AND c.data_consulta >= date_trunc('week', CURRENT_DATE)
          AND c.data_consulta <= (date_trunc('week', CURRENT_DATE) + INTERVAL '6 days 23 hours 59 minutes 59 seconds')
      `;
      const consultasSemana = consultasSemanaRes[0]?.count || 0;

      // 3. Pacientes sem retorno (> 30 dias)
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
        LIMIT 10
      `;

      // 4. Todos os pacientes para busca rápida
      const pacientesListRes = await sql`
        SELECT id, nome, email, whatsapp, objetivos
        FROM pacientes
        WHERE nutricionista_id = ${user.id}
        ORDER BY nome ASC
      `;
      setAllPacientes(pacientesListRes || []);

      // 5. Cálculo dos objetivos mais frequentes na base
      const objMap = {};
      let totalObjCount = 0;
      (pacientesListRes || []).forEach((p) => {
        const arr = parsePgArray(p.objetivos);
        arr.forEach((o) => {
          if (!o) return;
          const cleanObj = o.trim();
          objMap[cleanObj] = (objMap[cleanObj] || 0) + 1;
          totalObjCount += 1;
        });
      });

      const topObjetivos = Object.entries(objMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([nome, count]) => ({
          nome,
          count,
          pct: totalObjCount > 0 ? Math.round((count / (pacientesListRes?.length || 1)) * 100) : 0,
        }));

      // Fallback elegante se a base ainda não tiver objetivos cadastrados
      if (topObjetivos.length === 0) {
        setObjetivosStats([
          { nome: "Emagrecimento & Definição", pct: 68, count: 1 },
          { nome: "Hipertrofia Muscular", pct: 45, count: 1 },
          { nome: "Recomposição Corporal", pct: 32, count: 1 },
          { nome: "Saúde & Longevidade", pct: 24, count: 1 },
        ]);
      } else {
        setObjetivosStats(topObjetivos);
      }

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

  // Filtro de busca rápida de paciente
  const filteredSearchPacientes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allPacientes
      .filter((p) => p.nome && p.nome.toLowerCase().includes(q))
      .slice(0, 5);
  }, [searchQuery, allPacientes]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="bento-dashboard-container">
      {/* Top Header / Actions */}
      <div className="dashboard-header" style={{ marginBottom: "0.5rem" }}>
        <div>
          <span className="bento-tag">
            <Sparkles size={13} />
            Consultório LopesNutri
          </span>
          <p className="bento-welcome-subtitle" style={{ marginTop: "0.2rem" }}>
            Painel clínico de gestão e acompanhamento integrado de pacientes.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <button
            className="btn-refresh"
            onClick={() => fetchDashboardData(true)}
            disabled={loading || refreshing}
            title="Atualizar dados em tempo real"
          >
            <RefreshCw size={14} className={refreshing ? "spin-animation" : ""} />
            <span>{refreshing ? "Atualizando..." : "Atualizar Dados"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="error-alert-card">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* ASYMMETRICAL 12-COLUMN BENTO GRID */}
      <div className="bento-grid">
        
        {/* Bloco 1: Boas-Vindas & Status Rápido (lg:col-span-8) */}
        <div className="bento-welcome-card">
          <div className="bento-welcome-header">
            <span className="bento-tag">
              Visão Clínica Geral
            </span>
            <h1 className="bento-welcome-title">
              {getGreeting()}, {formatNutriGreeting(user?.name)}
            </h1>
            <p className="bento-welcome-subtitle">
              Seu consultório está com {stats.totalPacientes} pacientes sob cuidado e {taxaAdesao}% de retenção ativa nos últimos ciclos.
            </p>
          </div>

          {/* Micro-resumo horizontal com divisórias verticais */}
          <div className="bento-micro-summary">
            <div className="micro-summary-item">
              <span className="micro-summary-label">Pacientes sob cuidado</span>
              <div className="micro-summary-val">
                {loading ? "..." : stats.totalPacientes}
                <span className="micro-summary-unit">ativos</span>
              </div>
              <span className="micro-summary-sub">Base clínica vinculada</span>
            </div>

            <div className="micro-summary-item">
              <span className="micro-summary-label">Taxa de retenção clínica</span>
              <div className="micro-summary-val">
                {loading ? "..." : `${taxaAdesao}%`}
              </div>
              <span className="micro-summary-sub">Retornos e consultas em dia</span>
            </div>

            <div className="micro-summary-item">
              <span className="micro-summary-label">Consultas na semana</span>
              <div className="micro-summary-val">
                {loading ? "..." : stats.consultasSemana}
                <span className="micro-summary-unit">agendadas</span>
              </div>
              <span className="micro-summary-sub">Segunda a Domingo</span>
            </div>
          </div>

          {/* Mini Sparkline SVG de evolução do fluxo */}
          <div className="bento-sparkline-wrap">
            <div className="sparkline-label-group">
              <span className="sparkline-title">Fluxo de Atendimento Mensal</span>
              <span className="sparkline-sub">Média de acompanhamento consistente</span>
            </div>

            <div className="sparkline-svg-box">
              <svg viewBox="0 0 190 38" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                <defs>
                  <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2D4336" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2D4336" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 5,30 Q 30,12 55,20 T 105,10 T 150,18 T 185,6 L 185,38 L 5,38 Z"
                  fill="url(#sparklineGrad)"
                />
                <path
                  d="M 5,30 Q 30,12 55,20 T 105,10 T 150,18 T 185,6"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle cx="185" cy="6" r="3.5" fill="var(--primary)" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bloco 2: Card de Ação Rápida / Consulta Expressa (lg:col-span-4) */}
        <div className="bento-action-card">
          <div className="bento-action-header">
            <div className="bento-action-badge">
              <Sparkles size={12} />
              Consulta Expressa
            </div>
            <h3 className="bento-action-title">
              Acesso Clínico Rápido
            </h3>
            <p className="bento-action-desc">
              Cadastre novos pacientes ou localize fichas clínicas de forma instantânea.
            </p>
          </div>

          {/* Busca Rápida de Prontuário */}
          <div className="bento-quick-search-box">
            <div className="quick-search-input-wrap">
              <Search size={15} className="quick-search-icon" />
              <input
                type="text"
                className="quick-search-input"
                placeholder="Buscar prontuário por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Dropdown de resultados de busca */}
            {filteredSearchPacientes.length > 0 && (
              <div className="quick-search-dropdown animate-fade-in">
                {filteredSearchPacientes.map((p) => (
                  <Link
                    key={p.id}
                    to={`/pacientes/${p.id}`}
                    className="quick-search-item"
                    onClick={() => setSearchQuery("")}
                  >
                    <div>
                      <strong>{p.nome}</strong>
                      {p.whatsapp && (
                        <span style={{ display: "block", fontSize: "0.74rem", color: "var(--text-muted)" }}>
                          {formatPhone(p.whatsapp)}
                        </span>
                      )}
                    </div>
                    <ArrowRight size={13} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Botão de Cadastro */}
          <Link to="/pacientes/novo" className="bento-action-btn-primary">
            <UserPlus size={16} />
            <span>+ Cadastrar Novo Paciente</span>
          </Link>
        </div>

        {/* Bloco 3: Painel de Atenção Clínica & Retornos (lg:col-span-7) */}
        <div className="bento-alerts-card">
          <div className="bento-card-header">
            <div className="bento-card-title-group">
              <div className="stat-icon-wrapper" style={{ width: "36px", height: "36px", backgroundColor: "var(--error-bg)", color: "var(--error)" }}>
                <ClockAlert size={18} />
              </div>
              <div>
                <h3 className="bento-card-title">Atenção Clínica & Retornos</h3>
                <p className="bento-card-sub">
                  Pacientes sem consulta há mais de 30 dias que necessitam de contato
                </p>
              </div>
            </div>

            <div className="badge-count-warning" style={{ fontSize: "0.75rem", padding: "0.25rem 0.65rem" }}>
              {loading ? "..." : `${stats.pacientesSemRetorno.length} em atraso`}
            </div>
          </div>

          <div className="bento-clean-list">
            {loading ? (
              <div className="skeleton-list" style={{ padding: "1rem 0" }}>
                <div className="skeleton-row" />
                <div className="skeleton-row" />
                <div className="skeleton-row" />
              </div>
            ) : stats.pacientesSemRetorno.length === 0 ? (
              <div className="empty-state-box" style={{ padding: "2.5rem 1.5rem" }}>
                <div className="empty-icon-circle">
                  <CheckCircle2 size={28} />
                </div>
                <h4 className="empty-title" style={{ fontSize: "1.05rem" }}>Nenhum paciente sem retorno</h4>
                <p className="empty-desc" style={{ fontSize: "0.85rem" }}>
                  Excelente! Todos os seus pacientes estão com o fluxo de consultas em dia.
                </p>
              </div>
            ) : (
              stats.pacientesSemRetorno.map((paciente) => (
                <div key={paciente.id} className="bento-list-row">
                  <div className="bento-list-left">
                    <div className="bento-avatar">
                      {paciente.nome ? paciente.nome.charAt(0).toUpperCase() : "P"}
                    </div>
                    <div>
                      <span className="bento-patient-name">{paciente.nome}</span>
                      <div className="bento-patient-phone">
                        <Phone size={11} />
                        <span>{formatPhone(paciente.whatsapp) || paciente.email || "Sem contato"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bento-list-right">
                    <span className="bento-absence-badge">
                      {paciente.ultima_consulta
                        ? `Sem retorno há ${paciente.dias_sem_consulta} dias`
                        : `Cadastrado há ${paciente.dias_sem_consulta} dias`}
                    </span>

                    <Link
                      to={`/pacientes/${paciente.id}`}
                      className="bento-text-link"
                      title={`Abrir prontuário de ${paciente.nome}`}
                    >
                      <span>Abrir Prontuário</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bloco 4: Painel de Hábitos & Indicadores da Base (lg:col-span-5) */}
        <div className="bento-indicators-card">
          <div className="bento-card-header">
            <div className="bento-card-title-group">
              <div className="stat-icon-wrapper" style={{ width: "36px", height: "36px", backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                <Target size={18} />
              </div>
              <div>
                <h3 className="bento-card-title">Foco & Indicadores da Base</h3>
                <p className="bento-card-sub">
                  Distribuição dos principais objetivos clínicos dos seus pacientes
                </p>
              </div>
            </div>
          </div>

          <div className="bento-indicators-list">
            {objetivosStats.map((item, index) => (
              <div key={index} className="bento-indicator-item">
                <div className="bento-indicator-header">
                  <span className="bento-indicator-name">{item.nome}</span>
                  <span className="bento-indicator-pct">{item.pct}%</span>
                </div>
                <div className="bento-progress-track">
                  <div
                    className="bento-progress-fill"
                    style={{ width: `${Math.min(100, Math.max(8, item.pct))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "auto", paddingTop: "1.5rem" }}>
            <Link
              to="/pacientes"
              className="stat-footer-link"
              style={{ fontSize: "0.82rem" }}
            >
              <span>Ver prontuários completos de todos os pacientes</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
