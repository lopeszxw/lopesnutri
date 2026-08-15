import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useOutletContext, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Scale,
  Ruler,
  Activity,
  HeartPulse,
  Pill,
  Coffee,
  Moon,
  Sun,
  Droplets,
  Utensils,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  Target,
  ShieldAlert,
  Apple,
  Edit3
} from "lucide-react";
import { sql } from "../db";

export default function NovoPaciente() {
  const { user } = useOutletContext() || {};
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  const [activeTab, setActiveTab] = useState(1); // 1: Pessoal, 2: Clínico, 3: Hábitos
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Estado do formulário completo
  const [formData, setFormData] = useState({
    // Aba 1 - Pessoal
    nome: "",
    data_nascimento: "",
    sexo: "Feminino",
    telefone: "",
    whatsapp: "",
    email: "",

    // Aba 2 - Clínico
    peso_inicial: "",
    altura: "",
    objetivos: [],
    objetivo_texto: "",
    nivel_atividade: "Sedentário",
    patologias: [],
    restricoes_alimentares: [],
    alergias: [],
    medicamentos: "",
    suplementos: "",

    // Aba 3 - Hábitos
    refeicoes_por_dia: 3,
    horario_acorda: "",
    horario_dorme: "",
    litros_agua: "",
    atividade_fisica: false,
    atividade_fisica_descricao: "",
    observacoes: ""
  });

  // Estado para inputs de novas tags customizadas
  const [customPatologia, setCustomPatologia] = useState("");
  const [customRestricao, setCustomRestricao] = useState("");
  const [customAlergia, setCustomAlergia] = useState("");

  // Funções utilitárias seguras para parsing de tipos do PostgreSQL
  const formatDateForInput = (val) => {
    if (!val) return "";
    if (val instanceof Date) {
      const year = val.getUTCFullYear();
      const month = String(val.getUTCMonth() + 1).padStart(2, "0");
      const day = String(val.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    if (typeof val === "string") {
      return val.split("T")[0];
    }
    return "";
  };

  const parsePgArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      const clean = val.replace(/^\{|\}$/g, "").trim();
      if (!clean) return [];
      return clean
        .split(",")
        .map((s) => s.replace(/^"|"$/g, "").trim())
        .filter(Boolean);
    }
    return [];
  };

  // Carregar dados existentes caso esteja em modo de Edição
  useEffect(() => {
    if (!isEditMode || !id) return;
    if (!user?.id) return; // Aguardar carregamento da sessão do usuário

    const loadPaciente = async () => {
      setLoadingData(true);
      setError("");
      try {
        const res = await sql`
          SELECT * FROM pacientes 
          WHERE id = ${id} AND nutricionista_id = ${user.id}
        `;

        if (!res || res.length === 0) {
          setError("Paciente não encontrado ou você não tem permissão para editá-lo.");
          return;
        }

        const p = res[0];
        setFormData({
          nome: p.nome || "",
          data_nascimento: formatDateForInput(p.data_nascimento),
          sexo: p.sexo || "Feminino",
          telefone: p.whatsapp || "",
          whatsapp: p.whatsapp || "",
          email: p.email || "",

          peso_inicial: p.peso_inicial != null ? String(p.peso_inicial) : "",
          altura: p.altura != null ? String(p.altura) : "",
          objetivos: parsePgArray(p.objetivos),
          objetivo_texto: p.objetivo_texto || "",
          nivel_atividade: p.nivel_atividade || "Sedentário",
          patologias: parsePgArray(p.patologias),
          restricoes_alimentares: parsePgArray(p.restricoes_alimentares),
          alergias: parsePgArray(p.alergias),
          medicamentos: p.medicamentos || "",
          suplementos: p.suplementos || "",

          refeicoes_por_dia: p.refeicoes_por_dia || 3,
          horario_acorda: p.horario_acorda || "",
          horario_dorme: p.horario_dorme || "",
          litros_agua: p.litros_agua != null ? String(p.litros_agua) : "",
          atividade_fisica: Boolean(p.atividade_fisica),
          atividade_fisica_descricao: p.atividade_fisica_descricao || "",
          observacoes: p.observacoes || ""
        });
      } catch (err) {
        console.error("Erro ao carregar paciente para edição:", err);
        setError("Erro ao carregar dados do paciente.");
      } finally {
        setLoadingData(false);
      }
    };

    loadPaciente();
  }, [id, isEditMode, user?.id]);

  // Lista padrão de opções
  const objetivosOpcoes = [
    "Emagrecer",
    "Ganhar massa",
    "Controlar diabetes",
    "Saúde geral",
    "Performance esportiva",
    "Reeducação alimentar"
  ];

  const patologiasOpcoes = [
    "Diabetes",
    "Hipertensão",
    "Hipotireoidismo",
    "Hipertireoidismo",
    "Síndrome do ovário policístico",
    "Doença celíaca",
    "Colesterol alto"
  ];

  const restricoesOpcoes = [
    "Lactose",
    "Glúten",
    "Açúcar",
    "Carne vermelha",
    "Frutos do mar"
  ];

  const alergiasOpcoes = [
    "Amendoim",
    "Leite",
    "Ovo",
    "Soja",
    "Trigo",
    "Frutos do mar"
  ];

  const nivelAtividadeOpcoes = [
    "Sedentário",
    "Levemente ativo",
    "Moderadamente ativo",
    "Muito ativo",
    "Extremamente ativo"
  ];

  // Cálculo automático da Idade
  const idadeCalculada = useMemo(() => {
    if (!formData.data_nascimento) return null;
    const nascimento = new Date(formData.data_nascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade > 0 ? `${idade} anos` : "Menos de 1 ano";
  }, [formData.data_nascimento]);

  // Cálculo automático do IMC
  const imcCalculado = useMemo(() => {
    const peso = parseFloat(formData.peso_inicial);
    const alturaCm = parseFloat(formData.altura);
    if (!peso || !alturaCm || alturaCm <= 0) return null;

    const alturaM = alturaCm / 100;
    const imc = peso / (alturaM * alturaM);
    let classificacao = "Eutrofia (Peso Normal)";
    let cor = "var(--success)";

    if (imc < 18.5) {
      classificacao = "Abaixo do peso";
      cor = "var(--warning)";
    } else if (imc >= 25 && imc < 30) {
      classificacao = "Sobrepeso";
      cor = "var(--warning)";
    } else if (imc >= 30 && imc < 35) {
      classificacao = "Obesidade Grau I";
      cor = "var(--error)";
    } else if (imc >= 35 && imc < 40) {
      classificacao = "Obesidade Grau II";
      cor = "var(--error)";
    } else if (imc >= 40) {
      classificacao = "Obesidade Grau III";
      cor = "var(--error)";
    }

    return {
      valor: imc.toFixed(1),
      classificacao,
      cor
    };
  }, [formData.peso_inicial, formData.altura]);

  // Máscara de Telefone / WhatsApp
  const formatPhone = (val) => {
    const clean = val.replace(/\D/g, "").substring(0, 11);
    if (clean.length <= 2) return clean;
    if (clean.length <= 6) return `(${clean.substring(0, 2)}) ${clean.substring(2)}`;
    if (clean.length <= 10)
      return `(${clean.substring(0, 2)}) ${clean.substring(2, 6)}-${clean.substring(6)}`;
    return `(${clean.substring(0, 2)}) ${clean.substring(2, 7)}-${clean.substring(7, 11)}`;
  };

  // Conversão inteligente de horário (ex: 6 -> 06:00, 630 -> 06:30, 23 -> 23:00)
  const formatTimeAuto = (val) => {
    if (!val) return "";
    const clean = val.replace(/\D/g, "");
    if (!clean) return val;

    if (clean.length === 1 || clean.length === 2) {
      const h = parseInt(clean, 10);
      if (h >= 0 && h <= 23) {
        return `${clean.padStart(2, "0")}:00`;
      }
    } else if (clean.length === 3) {
      const h = clean.substring(0, 1).padStart(2, "0");
      const m = clean.substring(1, 3);
      if (parseInt(m, 10) <= 59) return `${h}:${m}`;
    } else if (clean.length === 4) {
      const h = clean.substring(0, 2);
      const m = clean.substring(2, 4);
      if (parseInt(h, 10) <= 23 && parseInt(m, 10) <= 59) return `${h}:${m}`;
    }
    return val;
  };

  // Manipuladores de Múltipla Escolha com "Nenhum"
  const toggleArrayOption = (field, option) => {
    setFormData((prev) => {
      let current = [...(prev[field] || [])];
      if (option === "Nenhum") {
        return {
          ...prev,
          [field]: current.includes("Nenhum") ? [] : ["Nenhum"]
        };
      }

      // Se marcar outra opção, remove "Nenhum"
      current = current.filter((item) => item !== "Nenhum");

      if (current.includes(option)) {
        current = current.filter((item) => item !== option);
      } else {
        current.push(option);
      }
      return { ...prev, [field]: current };
    });
  };

  const addCustomTag = (field, tag, setter) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      let current = (prev[field] || []).filter((item) => item !== "Nenhum");
      if (!current.includes(trimmed)) {
        current.push(trimmed);
      }
      return { ...prev, [field]: current };
    });
    setter("");
  };

  const removeTag = (field, tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((t) => t !== tagToRemove)
    }));
  };

  // Submissão do Formulário (Criação ou Edição)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!formData.nome.trim()) {
      setActiveTab(1);
      setError("O nome completo do paciente é obrigatório.");
      return;
    }

    if (!user?.id) {
      setError("Sessão de nutricionista não identificada. Faça login novamente.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        // Atualização no Neon PostgreSQL
        await sql`
          UPDATE pacientes SET
            nome = ${formData.nome.trim()},
            email = ${formData.email.trim() || null},
            whatsapp = ${formData.whatsapp.trim() || formData.telefone.trim() || null},
            sexo = ${formData.sexo || null},
            data_nascimento = ${formData.data_nascimento || null},
            peso_inicial = ${formData.peso_inicial ? parseFloat(formData.peso_inicial) : null},
            altura = ${formData.altura ? parseFloat(formData.altura) : null},
            refeicoes_por_dia = ${formData.refeicoes_por_dia ? parseInt(formData.refeicoes_por_dia, 10) : null},
            litros_agua = ${formData.litros_agua ? parseFloat(formData.litros_agua) : null},
            atividade_fisica = ${formData.atividade_fisica},
            atividade_fisica_descricao = ${formData.atividade_fisica ? formData.atividade_fisica_descricao.trim() || null : null},
            nivel_atividade = ${formData.nivel_atividade || null},
            horario_acorda = ${formData.horario_acorda.trim() || null},
            horario_dorme = ${formData.horario_dorme.trim() || null},
            objetivos = ${formData.objetivos.length > 0 ? formData.objetivos : null},
            objetivo_texto = ${formData.objetivo_texto.trim() || null},
            patologias = ${formData.patologias.length > 0 ? formData.patologias : null},
            restricoes_alimentares = ${formData.restricoes_alimentares.length > 0 ? formData.restricoes_alimentares : null},
            alergias = ${formData.alergias.length > 0 ? formData.alergias : null},
            medicamentos = ${formData.medicamentos.trim() || null},
            suplementos = ${formData.suplementos.trim() || null},
            observacoes = ${formData.observacoes.trim() || null}
          WHERE id = ${id} AND nutricionista_id = ${user.id}
        `;

        setSuccessMsg("Dados do paciente atualizados com sucesso!");
        setTimeout(() => {
          navigate(`/pacientes/${id}`);
        }, 700);
      } else {
        // Inserção de Novo Paciente
        const result = await sql`
          INSERT INTO pacientes (
            nutricionista_id,
            nome,
            email,
            whatsapp,
            sexo,
            data_nascimento,
            peso_inicial,
            altura,
            refeicoes_por_dia,
            litros_agua,
            atividade_fisica,
            atividade_fisica_descricao,
            nivel_atividade,
            horario_acorda,
            horario_dorme,
            objetivos,
            objetivo_texto,
            patologias,
            restricoes_alimentares,
            alergias,
            medicamentos,
            suplementos,
            observacoes
          ) VALUES (
            ${user.id},
            ${formData.nome.trim()},
            ${formData.email.trim() || null},
            ${formData.whatsapp.trim() || formData.telefone.trim() || null},
            ${formData.sexo || null},
            ${formData.data_nascimento || null},
            ${formData.peso_inicial ? parseFloat(formData.peso_inicial) : null},
            ${formData.altura ? parseFloat(formData.altura) : null},
            ${formData.refeicoes_por_dia ? parseInt(formData.refeicoes_por_dia, 10) : null},
            ${formData.litros_agua ? parseFloat(formData.litros_agua) : null},
            ${formData.atividade_fisica},
            ${formData.atividade_fisica ? formData.atividade_fisica_descricao.trim() || null : null},
            ${formData.nivel_atividade || null},
            ${formData.horario_acorda.trim() || null},
            ${formData.horario_dorme.trim() || null},
            ${formData.objetivos.length > 0 ? formData.objetivos : null},
            ${formData.objetivo_texto.trim() || null},
            ${formData.patologias.length > 0 ? formData.patologias : null},
            ${formData.restricoes_alimentares.length > 0 ? formData.restricoes_alimentares : null},
            ${formData.alergias.length > 0 ? formData.alergias : null},
            ${formData.medicamentos.trim() || null},
            ${formData.suplementos.trim() || null},
            ${formData.observacoes.trim() || null}
          )
          RETURNING id
        `;

        setSuccessMsg("Paciente cadastrado com sucesso!");
        const newId = result[0]?.id;
        setTimeout(() => {
          if (newId) {
            navigate(`/pacientes/${newId}`);
          } else {
            navigate("/pacientes");
          }
        }, 700);
      }
    } catch (err) {
      console.error("Erro ao salvar paciente:", err);
      setError("Erro ao salvar dados do paciente no banco de dados. Verifique as informações.");
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="novo-paciente-container">
        <div className="loading-spinner-box" style={{ padding: "4rem 0" }}>
          <div className="spinner" />
          <span>Carregando dados do paciente para edição...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="novo-paciente-container animate-fade-in">
      {/* Top Header & Breadcrumb */}
      <div className="novo-paciente-header">
        <div className="header-nav-row">
          <Link
            to={isEditMode ? `/pacientes/${id}` : "/pacientes"}
            className="btn-back-link"
          >
            <ArrowLeft size={18} />
            <span>
              {isEditMode
                ? "Voltar para Perfil do Paciente"
                : "Voltar para Lista de Pacientes"}
            </span>
          </Link>

          <span className="step-indicator-badge">
            Aba {activeTab} de 3
          </span>
        </div>

        <div className="header-title-box">
          <div className="header-badge-icon">
            {isEditMode ? <Edit3 size={24} /> : <User size={24} />}
          </div>
          <div>
            <h1 className="header-main-title">
              {isEditMode ? "Editar Dados do Paciente" : "Cadastro de Novo Paciente"}
            </h1>
            <p className="header-sub-title">
              {isEditMode
                ? `Atualize as informações do prontuário de ${formData.nome || "paciente"}.`
                : "Preencha as informações do paciente organizadas por abas para um prontuário completo."}
            </p>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="error-message">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="success-banner animate-fade-in">
          <CheckCircle2 size={20} />
          <span>{successMsg} Redirecionando...</span>
        </div>
      )}

      {/* Tabs Navigation Bar */}
      <div className="cadastro-tabs-nav">
        <button
          type="button"
          className={`tab-nav-btn ${activeTab === 1 ? "active" : ""}`}
          onClick={() => setActiveTab(1)}
        >
          <div className="tab-number">1</div>
          <div className="tab-btn-text">
            <strong>Pessoal</strong>
            <span>Identificação e Contato</span>
          </div>
        </button>

        <button
          type="button"
          className={`tab-nav-btn ${activeTab === 2 ? "active" : ""}`}
          onClick={() => setActiveTab(2)}
        >
          <div className="tab-number">2</div>
          <div className="tab-btn-text">
            <strong>Clínico</strong>
            <span>Medidas, Metas e Saúde</span>
          </div>
        </button>

        <button
          type="button"
          className={`tab-nav-btn ${activeTab === 3 ? "active" : ""}`}
          onClick={() => setActiveTab(3)}
        >
          <div className="tab-number">3</div>
          <div className="tab-btn-text">
            <strong>Hábitos</strong>
            <span>Rotina, Água e Estilo de Vida</span>
          </div>
        </button>
      </div>

      {/* Formulário Principal */}
      <form onSubmit={handleSubmit} className="cadastro-form-card">
        {/* =========================================================================
            ABA 1: DADOS PESSOAIS
           ========================================================================= */}
        {activeTab === 1 && (
          <div className="tab-pane animate-fade-in">
            <div className="tab-pane-title">
              <User size={20} color="var(--primary)" />
              <h3>1. Informações Pessoais & Contato</h3>
            </div>

            <div className="form-grid-2">
              <div className="form-group-field">
                <label htmlFor="p_nome" className="form-label">
                  Nome Completo <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon-left" />
                  <input
                    type="text"
                    id="p_nome"
                    className="styled-input-field"
                    required
                    placeholder="Ex: Dra. Mariana Assis"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group-field">
                <label htmlFor="p_email" className="form-label">
                  E-mail
                </label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon-left" />
                  <input
                    type="email"
                    id="p_email"
                    className="styled-input-field"
                    placeholder="paciente@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-group-field">
                <label htmlFor="p_nascimento" className="form-label">
                  Data de Nascimento
                </label>
                <div className="input-with-icon">
                  <Calendar size={18} className="input-icon-left" />
                  <input
                    type="date"
                    id="p_nascimento"
                    className="styled-input-field"
                    value={formData.data_nascimento}
                    onChange={(e) =>
                      setFormData({ ...formData, data_nascimento: e.target.value })
                    }
                  />
                </div>
                {idadeCalculada && (
                  <span className="field-helper-chip">
                    🎂 Idade calculada: <strong>{idadeCalculada}</strong>
                  </span>
                )}
              </div>

              <div className="form-group-field">
                <label htmlFor="p_sexo" className="form-label">
                  Sexo Biológico
                </label>
                <div className="select-wrapper">
                  <select
                    id="p_sexo"
                    className="styled-select-field"
                    value={formData.sexo}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                  >
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="form-group-field">
                <label htmlFor="p_whatsapp" className="form-label">
                  WhatsApp (com DDD)
                </label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon-left" />
                  <input
                    type="text"
                    id="p_whatsapp"
                    className="styled-input-field"
                    placeholder="(11) 99999-9999"
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whatsapp: formatPhone(e.target.value)
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group-field">
                <label htmlFor="p_telefone" className="form-label">
                  Telefone Fixo / Alternativo
                </label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon-left" />
                  <input
                    type="text"
                    id="p_telefone"
                    className="styled-input-field"
                    placeholder="(11) 3333-3333"
                    value={formData.telefone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        telefone: formatPhone(e.target.value)
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 2: DADOS CLÍNICOS & METAS
           ========================================================================= */}
        {activeTab === 2 && (
          <div className="tab-pane animate-fade-in">
            <div className="tab-pane-title">
              <Activity size={20} color="var(--primary)" />
              <h3>2. Antropometria Inicial, Objetivos & Saúde</h3>
            </div>

            {/* Medidas Iniciais e IMC */}
            <div className="form-section-block">
              <span className="form-section-title">Medidas Corporais Iniciais</span>
              <div className="form-grid-2">
                <div className="form-group-field">
                  <label htmlFor="p_peso" className="form-label">
                    Peso Atual (kg)
                  </label>
                  <div className="input-with-suffix">
                    <Scale size={18} className="input-icon-left" />
                    <input
                      type="number"
                      step="0.1"
                      id="p_peso"
                      className="styled-input-field"
                      placeholder="Ex: 72.5"
                      value={formData.peso_inicial}
                      onChange={(e) =>
                        setFormData({ ...formData, peso_inicial: e.target.value })
                      }
                    />
                    <span className="input-suffix-tag">kg</span>
                  </div>
                </div>

                <div className="form-group-field">
                  <label htmlFor="p_altura" className="form-label">
                    Altura (cm)
                  </label>
                  <div className="input-with-suffix">
                    <Ruler size={18} className="input-icon-left" />
                    <input
                      type="number"
                      step="0.1"
                      id="p_altura"
                      className="styled-input-field"
                      placeholder="Ex: 175"
                      value={formData.altura}
                      onChange={(e) =>
                        setFormData({ ...formData, altura: e.target.value })
                      }
                    />
                    <span className="input-suffix-tag">cm</span>
                  </div>
                </div>
              </div>

              {/* Card de IMC em tempo real */}
              {imcCalculado ? (
                <div className="imc-calc-banner animate-fade-in">
                  <div
                    className="imc-calc-badge"
                    style={{
                      backgroundColor: `${imcCalculado.cor}18`,
                      color: imcCalculado.cor,
                      borderColor: imcCalculado.cor
                    }}
                  >
                    <Activity size={18} />
                    <span>
                      IMC Calculado: <strong>{imcCalculado.valor} kg/m²</strong> — {imcCalculado.classificacao}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="field-hint-text">
                  * Preencha o peso e a altura para o cálculo automático do IMC.
                </div>
              )}
            </div>

            {/* Objetivos */}
            <div className="form-section-block">
              <span className="form-section-title">Objetivos do Paciente</span>
              <div className="checkbox-chips-grid">
                {objetivosOpcoes.map((obj) => (
                  <button
                    key={obj}
                    type="button"
                    className={`checkbox-chip-btn ${
                      formData.objetivos.includes(obj) ? "selected" : ""
                    }`}
                    onClick={() => toggleArrayOption("objetivos", obj)}
                  >
                    <Target size={15} />
                    <span>{obj}</span>
                  </button>
                ))}
              </div>

              <div className="form-group-field" style={{ marginTop: "0.75rem" }}>
                <label htmlFor="p_objetivo_texto" className="form-label">
                  Objetivo Principal & Detalhes Adicionais
                </label>
                <input
                  type="text"
                  id="p_objetivo_texto"
                  className="styled-input-field"
                  placeholder="Ex: Redução de gordura abdominal, aumento de disposição e melhora do sono..."
                  value={formData.objetivo_texto}
                  onChange={(e) =>
                    setFormData({ ...formData, objetivo_texto: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Nível de Atividade Física */}
            <div className="form-group-field">
              <label htmlFor="p_nivel_atividade" className="form-label">
                Nível de Atividade Física
              </label>
              <div className="select-wrapper">
                <select
                  id="p_nivel_atividade"
                  className="styled-select-field"
                  value={formData.nivel_atividade}
                  onChange={(e) =>
                    setFormData({ ...formData, nivel_atividade: e.target.value })
                  }
                >
                  {nivelAtividadeOpcoes.map((niv) => (
                    <option key={niv} value={niv}>
                      {niv}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Patologias ou Condições de Saúde */}
            <div className="form-section-block">
              <span className="form-section-title">Patologias ou Condições de Saúde</span>
              <div className="checkbox-chips-grid">
                <button
                  type="button"
                  className={`checkbox-chip-btn none-chip ${
                    formData.patologias.includes("Nenhum") ? "selected" : ""
                  }`}
                  onClick={() => toggleArrayOption("patologias", "Nenhum")}
                >
                  <span>Nenhum</span>
                </button>

                {patologiasOpcoes.map((pat) => (
                  <button
                    key={pat}
                    type="button"
                    className={`checkbox-chip-btn ${
                      formData.patologias.includes(pat) ? "selected" : ""
                    }`}
                    onClick={() => toggleArrayOption("patologias", pat)}
                  >
                    <HeartPulse size={15} />
                    <span>{pat}</span>
                  </button>
                ))}

                {/* Tags customizadas */}
                {formData.patologias
                  .filter((p) => !patologiasOpcoes.includes(p) && p !== "Nenhum")
                  .map((custom) => (
                    <span key={custom} className="custom-tag-chip">
                      <span>{custom}</span>
                      <button
                        type="button"
                        onClick={() => removeTag("patologias", custom)}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
              </div>

              {/* Adicionar patologia livremente */}
              <div className="add-tag-inline-row">
                <input
                  type="text"
                  className="styled-input-field sm"
                  placeholder="Outra patologia ou diagnóstico..."
                  value={customPatologia}
                  onChange={(e) => setCustomPatologia(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomTag("patologias", customPatologia, setCustomPatologia);
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-add-tag"
                  onClick={() =>
                    addCustomTag("patologias", customPatologia, setCustomPatologia)
                  }
                >
                  <Plus size={16} /> Adicionar
                </button>
              </div>
            </div>

            {/* Restrições Alimentares */}
            <div className="form-section-block">
              <span className="form-section-title">Restrições Alimentares</span>
              <div className="checkbox-chips-grid">
                <button
                  type="button"
                  className={`checkbox-chip-btn none-chip ${
                    formData.restricoes_alimentares.includes("Nenhum")
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => toggleArrayOption("restricoes_alimentares", "Nenhum")}
                >
                  <span>Nenhum</span>
                </button>

                {restricoesOpcoes.map((rest) => (
                  <button
                    key={rest}
                    type="button"
                    className={`checkbox-chip-btn ${
                      formData.restricoes_alimentares.includes(rest) ? "selected" : ""
                    }`}
                    onClick={() => toggleArrayOption("restricoes_alimentares", rest)}
                  >
                    <Apple size={15} />
                    <span>{rest}</span>
                  </button>
                ))}

                {formData.restricoes_alimentares
                  .filter((r) => !restricoesOpcoes.includes(r) && r !== "Nenhum")
                  .map((custom) => (
                    <span key={custom} className="custom-tag-chip">
                      <span>{custom}</span>
                      <button
                        type="button"
                        onClick={() => removeTag("restricoes_alimentares", custom)}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
              </div>

              <div className="add-tag-inline-row">
                <input
                  type="text"
                  className="styled-input-field sm"
                  placeholder="Outra restrição alimentar..."
                  value={customRestricao}
                  onChange={(e) => setCustomRestricao(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomTag(
                        "restricoes_alimentares",
                        customRestricao,
                        setCustomRestricao
                      );
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-add-tag"
                  onClick={() =>
                    addCustomTag(
                      "restricoes_alimentares",
                      customRestricao,
                      setCustomRestricao
                    )
                  }
                >
                  <Plus size={16} /> Adicionar
                </button>
              </div>
            </div>

            {/* Alergias Alimentares */}
            <div className="form-section-block">
              <span className="form-section-title">Alergias Alimentares</span>
              <div className="checkbox-chips-grid">
                <button
                  type="button"
                  className={`checkbox-chip-btn none-chip ${
                    formData.alergias.includes("Nenhum") ? "selected" : ""
                  }`}
                  onClick={() => toggleArrayOption("alergias", "Nenhum")}
                >
                  <span>Nenhum</span>
                </button>

                {alergiasOpcoes.map((alg) => (
                  <button
                    key={alg}
                    type="button"
                    className={`checkbox-chip-btn ${
                      formData.alergias.includes(alg) ? "selected" : ""
                    }`}
                    onClick={() => toggleArrayOption("alergias", alg)}
                  >
                    <ShieldAlert size={15} />
                    <span>{alg}</span>
                  </button>
                ))}

                {formData.alergias
                  .filter((a) => !alergiasOpcoes.includes(a) && a !== "Nenhum")
                  .map((custom) => (
                    <span key={custom} className="custom-tag-chip">
                      <span>{custom}</span>
                      <button
                        type="button"
                        onClick={() => removeTag("alergias", custom)}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
              </div>

              <div className="add-tag-inline-row">
                <input
                  type="text"
                  className="styled-input-field sm"
                  placeholder="Outra alergia alimentar..."
                  value={customAlergia}
                  onChange={(e) => setCustomAlergia(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomTag("alergias", customAlergia, setCustomAlergia);
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-add-tag"
                  onClick={() =>
                    addCustomTag("alergias", customAlergia, setCustomAlergia)
                  }
                >
                  <Plus size={16} /> Adicionar
                </button>
              </div>
            </div>

            {/* Medicamentos e Suplementos */}
            <div className="form-grid-2">
              <div className="form-group-field">
                <label htmlFor="p_medicamentos" className="form-label">
                  Medicamentos Contínuos
                </label>
                <div className="input-with-icon">
                  <Pill size={18} className="input-icon-left" />
                  <input
                    type="text"
                    id="p_medicamentos"
                    className="styled-input-field"
                    placeholder="Ex: Levotiroxina 50mcg, Metformina 850mg..."
                    value={formData.medicamentos}
                    onChange={(e) =>
                      setFormData({ ...formData, medicamentos: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group-field">
                <label htmlFor="p_suplementos" className="form-label">
                  Suplementos em Uso
                </label>
                <div className="input-with-icon">
                  <Sparkles size={18} className="input-icon-left" />
                  <input
                    type="text"
                    id="p_suplementos"
                    className="styled-input-field"
                    placeholder="Ex: Whey protein, Creatina 5g, Vitamina D..."
                    value={formData.suplementos}
                    onChange={(e) =>
                      setFormData({ ...formData, suplementos: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 3: HÁBITOS & ROTINA
           ========================================================================= */}
        {activeTab === 3 && (
          <div className="tab-pane animate-fade-in">
            <div className="tab-pane-title">
              <Coffee size={20} color="var(--primary)" />
              <h3>3. Hábitos de Vida & Rotina Diária</h3>
            </div>

            <div className="form-grid-3">
              <div className="form-group-field">
                <label htmlFor="p_refeicoes" className="form-label">
                  Refeições por dia
                </label>
                <div className="input-with-icon">
                  <Utensils size={18} className="input-icon-left" />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    id="p_refeicoes"
                    className="styled-input-field"
                    placeholder="Ex: 4"
                    value={formData.refeicoes_por_dia}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        refeicoes_por_dia: e.target.value
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group-field">
                <label htmlFor="p_acorda" className="form-label">
                  Horário que Acorda
                </label>
                <div className="input-with-icon">
                  <Sun size={18} className="input-icon-left" />
                  <input
                    type="text"
                    id="p_acorda"
                    className="styled-input-field"
                    placeholder="Ex: 06:30"
                    value={formData.horario_acorda}
                    onChange={(e) =>
                      setFormData({ ...formData, horario_acorda: e.target.value })
                    }
                    onBlur={(e) =>
                      setFormData({
                        ...formData,
                        horario_acorda: formatTimeAuto(e.target.value)
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group-field">
                <label htmlFor="p_dorme" className="form-label">
                  Horário que Dorme
                </label>
                <div className="input-with-icon">
                  <Moon size={18} className="input-icon-left" />
                  <input
                    type="text"
                    id="p_dorme"
                    className="styled-input-field"
                    placeholder="Ex: 23:00"
                    value={formData.horario_dorme}
                    onChange={(e) =>
                      setFormData({ ...formData, horario_dorme: e.target.value })
                    }
                    onBlur={(e) =>
                      setFormData({
                        ...formData,
                        horario_dorme: formatTimeAuto(e.target.value)
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group-field">
                <label htmlFor="p_agua" className="form-label">
                  Consumo Diário de Água
                </label>
                <div className="input-with-suffix">
                  <Droplets size={18} className="input-icon-left" />
                  <input
                    type="number"
                    step="0.1"
                    id="p_agua"
                    className="styled-input-field"
                    placeholder="Ex: 2.5"
                    value={formData.litros_agua}
                    onChange={(e) =>
                      setFormData({ ...formData, litros_agua: e.target.value })
                    }
                  />
                  <span className="input-suffix-tag">litros/dia</span>
                </div>
              </div>

              {/* Atividade Física Sim / Não */}
              <div className="form-group-field">
                <label className="form-label">Pratica Atividade Física?</label>
                <div className="radio-group-row">
                  <label className={`radio-card ${formData.atividade_fisica ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="atividade_fisica"
                      checked={formData.atividade_fisica === true}
                      onChange={() =>
                        setFormData({ ...formData, atividade_fisica: true })
                      }
                    />
                    <Dumbbell size={16} />
                    <span>Sim</span>
                  </label>

                  <label className={`radio-card ${!formData.atividade_fisica ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="atividade_fisica"
                      checked={formData.atividade_fisica === false}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          atividade_fisica: false,
                          atividade_fisica_descricao: ""
                        })
                      }
                    />
                    <span>Não</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Campo condicional de atividade física */}
            {formData.atividade_fisica && (
              <div className="form-group-field animate-fade-in">
                <label htmlFor="p_atv_desc" className="form-label">
                  Qual atividade e frequência semanal?
                </label>
                <div className="input-with-icon">
                  <Dumbbell size={18} className="input-icon-left" />
                  <input
                    type="text"
                    id="p_atv_desc"
                    className="styled-input-field"
                    placeholder="Ex: Musculação 4x/semana + Corrida 2x/semana (45 min cada)"
                    value={formData.atividade_fisica_descricao}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        atividade_fisica_descricao: e.target.value
                      })
                    }
                  />
                </div>
              </div>
            )}

            {/* Observações Gerais */}
            <div className="form-group-field">
              <label htmlFor="p_obs" className="form-label">
                Observações Gerais & Anotações de Consulta
              </label>
              <div className="textarea-wrapper">
                <textarea
                  id="p_obs"
                  rows="4"
                  className="styled-textarea-field"
                  placeholder="Relato do paciente, preferências alimentares, histórico familiar de saúde ou qualquer informação relevante para o plano alimentar..."
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer com Navegação de Abas & Submissão */}
        <div className="cadastro-form-footer">
          <div className="footer-left">
            {activeTab > 1 ? (
              <button
                type="button"
                className="btn-prev-tab"
                onClick={() => setActiveTab((t) => t - 1)}
              >
                <ChevronLeft size={18} />
                <span>Voltar Aba</span>
              </button>
            ) : (
              <Link
                to={isEditMode ? `/pacientes/${id}` : "/pacientes"}
                className="btn-cancel-link"
              >
                Cancelar
              </Link>
            )}
          </div>

          <div className="footer-right">
            {activeTab < 3 && (
              <button
                type="button"
                className="btn-next-tab"
                onClick={() => setActiveTab((t) => t + 1)}
              >
                <span>Próxima Aba</span>
                <ChevronRight size={18} />
              </button>
            )}

            <button
              type="submit"
              className="btn-submit-paciente"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="spinner-sm" />
                  <span>{isEditMode ? "Salvando Alterações..." : "Salvando Paciente..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>{isEditMode ? "Salvar Alterações" : "Salvar Paciente"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
