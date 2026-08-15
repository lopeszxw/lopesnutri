import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Users,
  Search,
  UserPlus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  X,
  CalendarClock
} from "lucide-react";
import { sql } from "../db";

export default function Pacientes() {
  const { user } = useOutletContext() || {};
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("nome");
  const [sortDirection, setSortDirection] = useState("asc"); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal Novo Paciente
  const [modalOpen, setModalOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [newPatient, setNewPatient] = useState({
    nome: "",
    email: "",
    whatsapp: "",
    sexo: "Feminino",
    data_nascimento: "",
    peso_inicial: "",
    altura: "",
    objetivo_texto: "",
    observacoes: ""
  });

  const fetchPacientes = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Buscar pacientes com a data do próximo retorno e status
      const data = await sql`
        SELECT 
          p.id,
          p.nome,
          p.email,
          p.whatsapp,
          p.created_at,
          p.sexo,
          MAX(c.data_consulta) AS ultima_consulta,
          MAX(c.proximo_retorno) AS proximo_retorno,
          COUNT(c.id)::int AS total_consultas
        FROM pacientes p
        LEFT JOIN consultas c ON p.id = c.paciente_id
        WHERE p.nutricionista_id = ${user.id}
        GROUP BY p.id, p.nome, p.email, p.whatsapp, p.created_at, p.sexo
        ORDER BY p.created_at DESC
      `;
      setPacientes(data || []);
    } catch (err) {
      console.error("Erro ao buscar pacientes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchPacientes();
    }
  }, [user?.id]);

  // Função para formatar data (DD/MM/AAAA)
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  // Status do paciente (Ativo se tiver consulta agendada ou recente, senão Ativo por padrão se cadastrado)
  const getPatientStatus = (paciente) => {
    if (!paciente.ultima_consulta && !paciente.proximo_retorno) {
      return { label: "Ativo", className: "status-active" };
    }
    if (paciente.proximo_retorno) {
      const retornoDate = new Date(paciente.proximo_retorno);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (retornoDate >= today) {
        return { label: "Ativo", className: "status-active" };
      }
    }
    return { label: "Ativo", className: "status-active" };
  };

  // Alternar ordenação
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filtragem em tempo real por nome ou email ou telefone
  const filteredPacientes = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return pacientes;
    return pacientes.filter((p) => {
      const nome = (p.nome || "").toLowerCase();
      const email = (p.email || "").toLowerCase();
      const whatsapp = (p.whatsapp || "").toLowerCase();
      return nome.includes(term) || email.includes(term) || whatsapp.includes(term);
    });
  }, [pacientes, searchTerm]);

  // Ordenação dos resultados filtrados
  const sortedPacientes = useMemo(() => {
    return [...filteredPacientes].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === null || aVal === undefined) aVal = "";
      if (bVal === null || bVal === undefined) bVal = "";

      if (typeof aVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [filteredPacientes, sortField, sortDirection]);

  // Paginação (10 pacientes por página)
  const totalPages = Math.ceil(sortedPacientes.length / itemsPerPage) || 1;
  const paginatedPacientes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedPacientes.slice(start, start + itemsPerPage);
  }, [sortedPacientes, currentPage, itemsPerPage]);

  // Resetar para página 1 ao pesquisar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Submeter cadastro de novo paciente
  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!newPatient.nome.trim()) {
      setFormError("O nome do paciente é obrigatório.");
      return;
    }

    setFormSubmitting(true);
    try {
      await sql`
        INSERT INTO pacientes (
          nutricionista_id,
          nome,
          email,
          whatsapp,
          sexo,
          data_nascimento,
          peso_inicial,
          altura,
          objetivo_texto,
          observacoes
        ) VALUES (
          ${user.id},
          ${newPatient.nome},
          ${newPatient.email || null},
          ${newPatient.whatsapp || null},
          ${newPatient.sexo || null},
          ${newPatient.data_nascimento || null},
          ${newPatient.peso_inicial ? parseFloat(newPatient.peso_inicial) : null},
          ${newPatient.altura ? parseFloat(newPatient.altura) : null},
          ${newPatient.objetivo_texto || null},
          ${newPatient.observacoes || null}
        )
      `;

      // Limpar formulário e fechar modal
      setNewPatient({
        nome: "",
        email: "",
        whatsapp: "",
        sexo: "Feminino",
        data_nascimento: "",
        peso_inicial: "",
        altura: "",
        objetivo_texto: "",
        observacoes: ""
      });
      setModalOpen(false);
      // Recarregar pacientes
      await fetchPacientes();
    } catch (err) {
      console.error("Erro ao cadastrar paciente:", err);
      setFormError("Erro ao salvar paciente no banco de dados. Verifique os dados.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="sort-icon-idle" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp size={14} className="sort-icon-active" />
    ) : (
      <ArrowDown size={14} className="sort-icon-active" />
    );
  };

  return (
    <div className="pacientes-page-container">
      {/* Header */}
      <div className="page-header-wrapper">
        <div>
          <div className="page-badge">
            <Users size={14} />
            <span>Gestão Clínica</span>
          </div>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-subtitle">
            Consulte, filtre e gerencie os registros e retornos de todos os seus pacientes.
          </p>
        </div>

        <button
          className="btn-primary-action"
          onClick={() => {
            setFormError("");
            setModalOpen(true);
          }}
        >
          <UserPlus size={18} />
          <span>Novo Paciente</span>
        </button>
      </div>

      {/* Control Bar: Search input & Stats */}
      <div className="table-controls-card">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input-field"
            placeholder="Pesquisar por nome, e-mail ou WhatsApp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchTerm("")}
              title="Limpar pesquisa"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="table-stats-pill">
          <span>{filteredPacientes.length} paciente(s) encontrado(s)</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-card-container">
        <div className="table-responsive-wrapper">
          <table className="custom-data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("nome")} className="sortable-header">
                  <div className="th-content">
                    <span>Nome</span>
                    {renderSortIcon("nome")}
                  </div>
                </th>
                <th onClick={() => handleSort("email")} className="sortable-header">
                  <div className="th-content">
                    <span>E-mail</span>
                    {renderSortIcon("email")}
                  </div>
                </th>
                <th>Telefone</th>
                <th onClick={() => handleSort("created_at")} className="sortable-header">
                  <div className="th-content">
                    <span>Data de cadastro</span>
                    {renderSortIcon("created_at")}
                  </div>
                </th>
                <th onClick={() => handleSort("proximo_retorno")} className="sortable-header">
                  <div className="th-content">
                    <span>Próximo retorno</span>
                    {renderSortIcon("proximo_retorno")}
                  </div>
                </th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="table-loading-cell">
                    <div className="loading-spinner-box">
                      <div className="spinner" />
                      <span>Carregando lista de pacientes...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedPacientes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty-cell">
                    <div className="table-empty-box">
                      <Users size={36} className="empty-icon-muted" />
                      <h4>Nenhum paciente encontrado</h4>
                      <p>
                        {searchTerm
                          ? "Não encontramos nenhum paciente correspondente à sua busca."
                          : "Você ainda não possui pacientes cadastrados."}
                      </p>
                      {!searchTerm && (
                        <button
                          className="btn-primary-action"
                          style={{ marginTop: "1rem" }}
                          onClick={() => setModalOpen(true)}
                        >
                          <UserPlus size={16} />
                          <span>Cadastrar Primeiro Paciente</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPacientes.map((paciente) => {
                  const status = getPatientStatus(paciente);
                  return (
                    <tr
                      key={paciente.id}
                      className="table-data-row"
                      onClick={() => navigate(`/pacientes/${paciente.id}`)}
                      title="Clique para ver o perfil completo do paciente"
                    >
                      {/* Nome */}
                      <td className="cell-name">
                        <div className="paciente-row-name-box">
                          <div className="paciente-row-avatar">
                            {paciente.nome ? paciente.nome.charAt(0).toUpperCase() : "P"}
                          </div>
                          <div>
                            <span className="paciente-name-text">{paciente.nome}</span>
                            {paciente.sexo && (
                              <span className="paciente-sub-sexo">{paciente.sexo}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="cell-email">
                        {paciente.email ? (
                          <div className="cell-flex-item">
                            <Mail size={14} className="cell-icon" />
                            <span>{paciente.email}</span>
                          </div>
                        ) : (
                          <span className="cell-muted-text">-</span>
                        )}
                      </td>

                      {/* Telefone */}
                      <td className="cell-phone">
                        {paciente.whatsapp ? (
                          <div className="cell-flex-item">
                            <Phone size={14} className="cell-icon" />
                            <span>{paciente.whatsapp}</span>
                          </div>
                        ) : (
                          <span className="cell-muted-text">-</span>
                        )}
                      </td>

                      {/* Data de cadastro */}
                      <td className="cell-date">
                        <div className="cell-flex-item">
                          <Calendar size={14} className="cell-icon" />
                          <span>{formatDate(paciente.created_at)}</span>
                        </div>
                      </td>

                      {/* Próximo retorno */}
                      <td className="cell-retorno">
                        {paciente.proximo_retorno ? (
                          <span className="retorno-badge scheduled">
                            <CalendarClock size={13} />
                            {formatDate(paciente.proximo_retorno)}
                          </span>
                        ) : (
                          <span className="retorno-badge not-scheduled">
                            Não agendado
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="cell-status">
                        <span className={`status-pill ${status.className}`}>
                          <span className="status-dot" />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section (Se houver pacientes) */}
        {!loading && sortedPacientes.length > 0 && (
          <div className="table-pagination-footer">
            <div className="pagination-info">
              Mostrando{" "}
              <strong>
                {Math.min(
                  (currentPage - 1) * itemsPerPage + 1,
                  sortedPacientes.length
                )}
              </strong>{" "}
              a{" "}
              <strong>
                {Math.min(currentPage * itemsPerPage, sortedPacientes.length)}
              </strong>{" "}
              de <strong>{sortedPacientes.length}</strong> pacientes
            </div>

            <div className="pagination-buttons">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                aria-label="Página anterior"
              >
                <ChevronLeft size={18} />
                <span>Anterior</span>
              </button>

              <div className="pagination-pages-list">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      className={`pagination-number-btn ${
                        currentPage === pageNum ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  )
                )}
              </div>

              <button
                className="pagination-btn"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                aria-label="Próxima página"
              >
                <span>Próxima</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Novo Paciente */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="modal-content-card animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-header-title">
                <div className="modal-icon-badge">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3>Cadastrar Novo Paciente</h3>
                  <p>Preencha os dados cadastrais do paciente</p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="error-message" style={{ margin: "1rem 1.5rem 0" }}>
                <AlertCircle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePatient} className="modal-form-body">
              <div className="form-grid-2">
                <div className="input-group">
                  <label htmlFor="nome">Nome Completo *</label>
                  <input
                    type="text"
                    id="nome"
                    className="input-field"
                    required
                    placeholder="Ex: João da Silva"
                    value={newPatient.nome}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, nome: e.target.value })
                    }
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="email">E-mail</label>
                  <input
                    type="email"
                    id="email"
                    className="input-field"
                    placeholder="Ex: joao@email.com"
                    value={newPatient.email}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="input-group">
                  <label htmlFor="whatsapp">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    id="whatsapp"
                    className="input-field"
                    placeholder="(11) 99999-9999"
                    value={newPatient.whatsapp}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, whatsapp: e.target.value })
                    }
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="sexo">Sexo Biológico</label>
                  <select
                    id="sexo"
                    className="input-field"
                    value={newPatient.sexo}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, sexo: e.target.value })
                    }
                  >
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-3">
                <div className="input-group">
                  <label htmlFor="data_nascimento">Data de Nascimento</label>
                  <input
                    type="date"
                    id="data_nascimento"
                    className="input-field"
                    value={newPatient.data_nascimento}
                    onChange={(e) =>
                      setNewPatient({
                        ...newPatient,
                        data_nascimento: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="peso_inicial">Peso Inicial (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    id="peso_inicial"
                    className="input-field"
                    placeholder="Ex: 72.5"
                    value={newPatient.peso_inicial}
                    onChange={(e) =>
                      setNewPatient({
                        ...newPatient,
                        peso_inicial: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="altura">Altura (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    id="altura"
                    className="input-field"
                    placeholder="Ex: 175"
                    value={newPatient.altura}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, altura: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="objetivo_texto">Objetivo Principal</label>
                <input
                  type="text"
                  id="objetivo_texto"
                  className="input-field"
                  placeholder="Ex: Emagrecimento saudável e ganho de disposição"
                  value={newPatient.objetivo_texto}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      objetivo_texto: e.target.value,
                    })
                  }
                />
              </div>

              <div className="input-group">
                <label htmlFor="observacoes">Observações Clínicas Iniciais</label>
                <textarea
                  id="observacoes"
                  rows="3"
                  className="input-field"
                  style={{ resize: "vertical" }}
                  placeholder="Anotações gerais sobre o paciente..."
                  value={newPatient.observacoes}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      observacoes: e.target.value,
                    })
                  }
                />
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => setModalOpen(false)}
                  disabled={formSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? "Salvando..." : "Salvar Paciente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
