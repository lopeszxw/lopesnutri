import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useOutletContext } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Plus,
  HeartPulse,
  Scale,
  Ruler,
  CalendarClock,
  Sparkles,
  FileText,
  MessageCircle,
  AlertCircle,
  X,
  CheckCircle2,
  Mail
} from "lucide-react";
import { sql } from "../db";

export default function PacienteDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useOutletContext() || {};

  const [paciente, setPaciente] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal Nova Consulta
  const [modalConsultaOpen, setModalConsultaOpen] = useState(false);
  const [submittingConsulta, setSubmittingConsulta] = useState(false);
  const [consultaError, setConsultaError] = useState("");
  const [newConsulta, setNewConsulta] = useState({
    data_consulta: new Date().toISOString().split("T")[0],
    peso: "",
    cintura: "",
    quadril: "",
    percentual_gordura: "",
    proximo_retorno: "",
    observacoes: ""
  });

  const fetchPacienteData = async () => {
    if (!id || !user?.id) return;
    setLoading(true);
    setError("");
    try {
      const pacienteRes = await sql`
        SELECT * FROM pacientes 
        WHERE id = ${id} AND nutricionista_id = ${user.id}
      `;

      if (!pacienteRes || pacienteRes.length === 0) {
        setError("Paciente não encontrado ou você não tem permissão para acessá-lo.");
        setLoading(false);
        return;
      }

      setPaciente(pacienteRes[0]);

      const consultasRes = await sql`
        SELECT * FROM consultas 
        WHERE paciente_id = ${id} 
        ORDER BY data_consulta DESC, created_at DESC
      `;
      setConsultas(consultasRes || []);
    } catch (err) {
      console.error("Erro ao carregar paciente:", err);
      setError("Erro ao carregar dados do paciente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && user?.id) {
      fetchPacienteData();
    }
  }, [id, user?.id]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC"
    });
  };

  const handleCreateConsulta = async (e) => {
    e.preventDefault();
    setConsultaError("");

    if (!newConsulta.data_consulta) {
      setConsultaError("Informe a data da consulta.");
      return;
    }

    setSubmittingConsulta(true);
    try {
      await sql`
        INSERT INTO consultas (
          paciente_id,
          data_consulta,
          peso,
          cintura,
          quadril,
          percentual_gordura,
          proximo_retorno,
          observacoes
        ) VALUES (
          ${id},
          ${newConsulta.data_consulta},
          ${newConsulta.peso ? parseFloat(newConsulta.peso) : null},
          ${newConsulta.cintura ? parseFloat(newConsulta.cintura) : null},
          ${newConsulta.quadril ? parseFloat(newConsulta.quadril) : null},
          ${newConsulta.percentual_gordura ? parseFloat(newConsulta.percentual_gordura) : null},
          ${newConsulta.proximo_retorno || null},
          ${newConsulta.observacoes.trim() || null}
        )
      `;

      setNewConsulta({
        data_consulta: new Date().toISOString().split("T")[0],
        peso: "",
        cintura: "",
        quadril: "",
        percentual_gordura: "",
        proximo_retorno: "",
        observacoes: ""
      });
      setModalConsultaOpen(false);
      await fetchPacienteData();
    } catch (err) {
      console.error("Erro ao cadastrar consulta:", err);
      setConsultaError("Erro ao registrar a consulta no banco de dados.");
    } finally {
      setSubmittingConsulta(false);
    }
  };

  if (loading) {
    return (
      <div className="paciente-detalhes-container">
        <div className="loading-spinner-box" style={{ padding: "4rem 0" }}>
          <div className="spinner" />
          <span>Carregando perfil do paciente...</span>
        </div>
      </div>
    );
  }

  if (error || !paciente) {
    return (
      <div className="paciente-detalhes-container">
        <div className="error-alert-card">
          <AlertCircle size={20} />
          <span>{error || "Paciente não encontrado."}</span>
        </div>
        <Link to="/pacientes" className="btn-secondary-action" style={{ marginTop: "1rem" }}>
          <ArrowLeft size={16} />
          <span>Voltar para Lista de Pacientes</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="paciente-detalhes-container">
      {/* Top Breadcrumb & Actions */}
      <div className="detalhes-topbar">
        <button className="btn-back-link" onClick={() => navigate("/pacientes")}>
          <ArrowLeft size={18} />
          <span>Voltar para Pacientes</span>
        </button>

        <button
          className="btn-primary-action"
          onClick={() => {
            setConsultaError("");
            setModalConsultaOpen(true);
          }}
        >
          <Plus size={18} />
          <span>Nova Consulta / Evolução</span>
        </button>
      </div>

      {/* Main Profile Header Card */}
      <div className="paciente-profile-header-card">
        <div className="profile-header-main">
          <div className="profile-large-avatar">
            {paciente.nome ? paciente.nome.charAt(0).toUpperCase() : "P"}
          </div>

          <div className="profile-header-text">
            <div className="profile-header-title-row">
              <h1 className="profile-nome-heading">{paciente.nome}</h1>
              <span className="profile-status-badge active">Ativo</span>
            </div>

            <div className="profile-contact-chips">
              {paciente.email && (
                <a href={`mailto:${paciente.email}`} className="contact-chip">
                  <Mail size={14} />
                  <span>{paciente.email}</span>
                </a>
              )}
              {paciente.whatsapp && (
                <a
                  href={`https://wa.me/${paciente.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-chip chip-whatsapp"
                >
                  <MessageCircle size={14} />
                  <span>{paciente.whatsapp}</span>
                </a>
              )}
              <div className="contact-chip">
                <Calendar size={14} />
                <span>Cadastrado em {formatDate(paciente.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="profile-quick-stats-grid">
          <div className="quick-stat-item">
            <span className="quick-stat-label">Sexo</span>
            <strong className="quick-stat-value">{paciente.sexo || "Não informado"}</strong>
          </div>
          <div className="quick-stat-item">
            <span className="quick-stat-label">Nascimento</span>
            <strong className="quick-stat-value">{formatDate(paciente.data_nascimento)}</strong>
          </div>
          <div className="quick-stat-item">
            <span className="quick-stat-label">Peso Inicial</span>
            <strong className="quick-stat-value">
              {paciente.peso_inicial ? `${paciente.peso_inicial} kg` : "-"}
            </strong>
          </div>
          <div className="quick-stat-item">
            <span className="quick-stat-label">Altura</span>
            <strong className="quick-stat-value">
              {paciente.altura ? `${paciente.altura} cm` : "-"}
            </strong>
          </div>
          <div className="quick-stat-item">
            <span className="quick-stat-label">Total de Consultas</span>
            <strong className="quick-stat-value">{consultas.length}</strong>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="profile-grid-layout">
        {/* Left Column: Clinical Info & Goals */}
        <div className="profile-col-left">
          {/* Objetivo Principal */}
          <div className="profile-card">
            <div className="profile-card-title">
              <Sparkles size={18} color="var(--primary)" />
              <h3>Objetivo Nutricional</h3>
            </div>
            <div className="profile-card-content">
              <p className="goal-highlight-text">
                {paciente.objetivo_texto || "Nenhum objetivo específico registrado ainda."}
              </p>
            </div>
          </div>

          {/* Observações & Anamnese */}
          <div className="profile-card">
            <div className="profile-card-title">
              <FileText size={18} color="var(--primary)" />
              <h3>Observações Clínicas</h3>
            </div>
            <div className="profile-card-content">
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                {paciente.observacoes || "Nenhuma observação registrada."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Consultas History */}
        <div className="profile-col-right">
          <div className="profile-card">
            <div className="card-header-flex">
              <div className="profile-card-title">
                <CalendarClock size={18} color="var(--primary)" />
                <h3>Histórico de Consultas & Evoluções</h3>
              </div>
              <button
                className="btn-sm-primary"
                onClick={() => setModalConsultaOpen(true)}
              >
                <Plus size={15} />
                <span>Adicionar</span>
              </button>
            </div>

            <div className="consultas-timeline-container">
              {consultas.length === 0 ? (
                <div className="empty-state-box" style={{ padding: "2rem" }}>
                  <Calendar size={32} className="empty-icon-muted" />
                  <h4>Nenhuma consulta registrada</h4>
                  <p>Cadastre a primeira consulta do paciente para acompanhar sua evolução.</p>
                  <button
                    className="btn-primary-action"
                    style={{ marginTop: "1rem" }}
                    onClick={() => setModalConsultaOpen(true)}
                  >
                    <Plus size={16} />
                    <span>Registrar 1ª Consulta</span>
                  </button>
                </div>
              ) : (
                <div className="consultas-list">
                  {consultas.map((c, index) => (
                    <div key={c.id} className="consulta-timeline-item">
                      <div className="timeline-marker-circle">{consultas.length - index}</div>
                      <div className="consulta-item-card">
                        <div className="consulta-item-header">
                          <div>
                            <span className="consulta-date-title">
                              Consulta em {formatDate(c.data_consulta)}
                            </span>
                            {c.proximo_retorno && (
                              <div className="consulta-retorno-tag">
                                <CalendarClock size={13} />
                                <span>Retorno agendado: {formatDate(c.proximo_retorno)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="consulta-metrics-row">
                          {c.peso && (
                            <div className="consulta-metric-pill">
                              <Scale size={14} />
                              <span>Peso: <strong>{c.peso} kg</strong></span>
                            </div>
                          )}
                          {c.cintura && (
                            <div className="consulta-metric-pill">
                              <Ruler size={14} />
                              <span>Cintura: <strong>{c.cintura} cm</strong></span>
                            </div>
                          )}
                          {c.quadril && (
                            <div className="consulta-metric-pill">
                              <Ruler size={14} />
                              <span>Quadril: <strong>{c.quadril} cm</strong></span>
                            </div>
                          )}
                          {c.percentual_gordura && (
                            <div className="consulta-metric-pill">
                              <HeartPulse size={14} />
                              <span>% Gordura: <strong>{c.percentual_gordura}%</strong></span>
                            </div>
                          )}
                        </div>

                        {c.observacoes && (
                          <div className="consulta-obs-box">
                            <strong>Evolução / Anotações:</strong>
                            <p>{c.observacoes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Registrar Nova Consulta Refinado */}
      {modalConsultaOpen && (
        <div className="modal-backdrop" onClick={() => setModalConsultaOpen(false)}>
          <div
            className="modal-content-card modal-refined-card animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-header-title">
                <div className="modal-icon-badge">
                  <Plus size={22} />
                </div>
                <div>
                  <h3>Registrar Nova Consulta</h3>
                  <p>Adicione dados da consulta para {paciente.nome}</p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setModalConsultaOpen(false)}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            {consultaError && (
              <div className="error-message" style={{ margin: "1.25rem 1.75rem 0" }}>
                <AlertCircle size={18} />
                <span>{consultaError}</span>
              </div>
            )}

            <form onSubmit={handleCreateConsulta} className="modal-form-body">
              {/* Seção 1: Agendamento & Datas */}
              <div className="form-section-block">
                <div className="form-section-header">
                  <div className="form-section-icon">
                    <Calendar size={15} />
                  </div>
                  <span className="form-section-title">Datas da Consulta</span>
                </div>

                <div className="form-grid-2">
                  <div className="form-group-field">
                    <label htmlFor="modal_data_consulta" className="form-label">
                      Data da Consulta <span className="required-star">*</span>
                    </label>
                    <div className="input-with-icon">
                      <Calendar size={17} className="input-icon-left" />
                      <input
                        type="date"
                        id="modal_data_consulta"
                        className="styled-input-field"
                        required
                        value={newConsulta.data_consulta}
                        onChange={(e) =>
                          setNewConsulta({
                            ...newConsulta,
                            data_consulta: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="modal_proximo_retorno" className="form-label">
                      Data do Próximo Retorno
                    </label>
                    <div className="input-with-icon">
                      <CalendarClock size={17} className="input-icon-left" />
                      <input
                        type="date"
                        id="modal_proximo_retorno"
                        className="styled-input-field"
                        value={newConsulta.proximo_retorno}
                        onChange={(e) =>
                          setNewConsulta({
                            ...newConsulta,
                            proximo_retorno: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 2: Medidas & Antropometria */}
              <div className="form-section-block">
                <div className="form-section-header">
                  <div className="form-section-icon">
                    <Scale size={15} />
                  </div>
                  <span className="form-section-title">Métricas Antropométricas</span>
                </div>

                <div className="form-grid-2">
                  <div className="form-group-field">
                    <label htmlFor="modal_peso_c" className="form-label">
                      Peso Atual (kg)
                    </label>
                    <div className="input-with-icon">
                      <Scale size={17} className="input-icon-left" />
                      <input
                        type="number"
                        step="0.1"
                        id="modal_peso_c"
                        className="styled-input-field"
                        placeholder="Ex: 68.4"
                        value={newConsulta.peso}
                        onChange={(e) =>
                          setNewConsulta({ ...newConsulta, peso: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="modal_gordura_c" className="form-label">
                      Percentual de Gordura (%)
                    </label>
                    <div className="input-with-icon">
                      <HeartPulse size={17} className="input-icon-left" />
                      <input
                        type="number"
                        step="0.1"
                        id="modal_gordura_c"
                        className="styled-input-field"
                        placeholder="Ex: 22.5"
                        value={newConsulta.percentual_gordura}
                        onChange={(e) =>
                          setNewConsulta({
                            ...newConsulta,
                            percentual_gordura: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group-field">
                    <label htmlFor="modal_cintura_c" className="form-label">
                      Circunferência Cintura (cm)
                    </label>
                    <div className="input-with-icon">
                      <Ruler size={17} className="input-icon-left" />
                      <input
                        type="number"
                        step="0.1"
                        id="modal_cintura_c"
                        className="styled-input-field"
                        placeholder="Ex: 75"
                        value={newConsulta.cintura}
                        onChange={(e) =>
                          setNewConsulta({ ...newConsulta, cintura: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group-field">
                    <label htmlFor="modal_quadril_c" className="form-label">
                      Circunferência Quadril (cm)
                    </label>
                    <div className="input-with-icon">
                      <Ruler size={17} className="input-icon-left" />
                      <input
                        type="number"
                        step="0.1"
                        id="modal_quadril_c"
                        className="styled-input-field"
                        placeholder="Ex: 98"
                        value={newConsulta.quadril}
                        onChange={(e) =>
                          setNewConsulta({ ...newConsulta, quadril: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 3: Observações & Evolução */}
              <div className="form-section-block">
                <div className="form-section-header">
                  <div className="form-section-icon">
                    <FileText size={15} />
                  </div>
                  <span className="form-section-title">Evolução & Conduta Nutricional</span>
                </div>

                <div className="form-group-field">
                  <label htmlFor="modal_obs_c" className="form-label">
                    Observações Clínicas / Relato do Paciente
                  </label>
                  <div className="textarea-wrapper">
                    <textarea
                      id="modal_obs_c"
                      rows="3"
                      className="styled-textarea-field"
                      placeholder="Relato do paciente sobre adesão à dieta, sintomas gastrointestinais, suplementação orientada..."
                      value={newConsulta.observacoes}
                      onChange={(e) =>
                        setNewConsulta({
                          ...newConsulta,
                          observacoes: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="btn-cancel-modal"
                  onClick={() => setModalConsultaOpen(false)}
                  disabled={submittingConsulta}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit-modal"
                  disabled={submittingConsulta}
                >
                  {submittingConsulta ? (
                    <>
                      <div className="spinner-sm" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Salvar Consulta</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
