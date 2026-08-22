import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useOutletContext, Link } from "react-router-dom";
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
  X,
  CalendarClock,
  Target
} from "lucide-react";
import { sql } from "../db";
import { parsePgArray, formatDate } from "../utils/helpers";

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

  const fetchPacientes = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await sql`
        SELECT 
          p.id,
          p.nome,
          p.email,
          p.whatsapp,
          p.created_at,
          p.sexo,
          p.objetivos,
          p.objetivo_texto,
          MAX(c.data_consulta) AS ultima_consulta,
          MAX(c.proximo_retorno) AS proximo_retorno,
          COUNT(c.id)::int AS total_consultas
        FROM pacientes p
        LEFT JOIN consultas c ON p.id = c.paciente_id
        WHERE p.nutricionista_id = ${user.id}
        GROUP BY p.id, p.nome, p.email, p.whatsapp, p.created_at, p.sexo, p.objetivos, p.objetivo_texto
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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredPacientes = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return pacientes;
    return pacientes.filter((p) => {
      const nome = (p.nome || "").toLowerCase();
      const email = (p.email || "").toLowerCase();
      const whatsapp = (p.whatsapp || "").toLowerCase();
      const objetivo = (p.objetivo_texto || "").toLowerCase();
      const objetivosArr = parsePgArray(p.objetivos).join(" ").toLowerCase();
      return (
        nome.includes(term) ||
        email.includes(term) ||
        whatsapp.includes(term) ||
        objetivo.includes(term) ||
        objetivosArr.includes(term)
      );
    });
  }, [pacientes, searchTerm]);

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

  const totalPages = Math.ceil(sortedPacientes.length / itemsPerPage) || 1;
  const paginatedPacientes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedPacientes.slice(start, start + itemsPerPage);
  }, [sortedPacientes, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

        {/* Botão Novo Paciente direcionando para a nova página /pacientes/novo */}
        <Link to="/pacientes/novo" className="btn-primary-action">
          <UserPlus size={18} />
          <span>Novo Paciente</span>
        </Link>
      </div>

      {/* Control Bar: Search input & Stats */}
      <div className="table-controls-card">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input-field"
            placeholder="Pesquisar por nome, e-mail, WhatsApp ou objetivo..."
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
                <th>Objetivo Principal</th>
                <th onClick={() => handleSort("email")} className="sortable-header">
                  <div className="th-content">
                    <span>Contato</span>
                    {renderSortIcon("email")}
                  </div>
                </th>
                <th onClick={() => handleSort("ultima_consulta")} className="sortable-header">
                  <div className="th-content">
                    <span>Última Consulta</span>
                    {renderSortIcon("ultima_consulta")}
                  </div>
                </th>
                <th onClick={() => handleSort("proximo_retorno")} className="sortable-header">
                  <div className="th-content">
                    <span>Próximo Retorno</span>
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
                      <Users size={40} className="empty-icon-muted" />
                      <h4>Nenhum paciente cadastrado ainda</h4>
                      <p>
                        {searchTerm
                          ? "Não encontramos nenhum paciente correspondente à sua busca."
                          : "Você ainda não possui pacientes cadastrados no sistema."}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/pacientes/novo"
                          className="btn-primary-action"
                          style={{ marginTop: "1rem" }}
                        >
                          <UserPlus size={16} />
                          <span>Cadastrar Primeiro Paciente</span>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPacientes.map((paciente) => {
                  const status = getPatientStatus(paciente);
                  const objetivosList = parsePgArray(paciente.objetivos);
                  const objetivoExibicao =
                    paciente.objetivo_texto ||
                    (objetivosList.length > 0 ? objetivosList[0] : "Acompanhamento geral");

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

                      {/* Objetivo */}
                      <td className="cell-objetivo">
                        <div className="cell-objetivo-box">
                          <Target size={14} className="cell-icon-accent" />
                          <span className="objetivo-pill" title={paciente.objetivo_texto || objetivosList.join(", ")}>
                            {objetivoExibicao}
                          </span>
                        </div>
                      </td>

                      {/* Contato (Email / WhatsApp) */}
                      <td className="cell-contact">
                        <div className="contact-column-stack">
                          {paciente.email && (
                            <div className="cell-flex-item">
                              <Mail size={13} className="cell-icon" />
                              <span className="cell-text-sm">{paciente.email}</span>
                            </div>
                          )}
                          {paciente.whatsapp && (
                            <div className="cell-flex-item">
                              <Phone size={13} className="cell-icon" />
                              <span className="cell-text-sm">{paciente.whatsapp}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Data da Última Consulta */}
                      <td className="cell-date">
                        <div className="cell-flex-item">
                          <Calendar size={14} className="cell-icon" />
                          <span>{formatDate(paciente.ultima_consulta)}</span>
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

        {/* Pagination Section */}
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
    </div>
  );
}
