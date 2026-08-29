import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Utensils,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  Printer,
  FileText,
  Sun,
  Coffee,
  Apple,
  Salad,
  Sandwich,
  Soup,
  Info,
  Edit3,
  User,
  Droplets,
  Target
} from "lucide-react";
import { sql } from "../db";

// Mapeamento de ícones e nomes amigáveis para as 5 refeições diárias
const REFEICOES_CONFIG = [
  { key: "cafe_da_manha", label: "Café da Manhã", icon: Coffee, desc: "Primeira refeição do dia", color: "#f59e0b" },
  { key: "lanche_manha", label: "Lanche da Manhã", icon: Apple, desc: "Lanche intermediário matutino", color: "#10b981" },
  { key: "almoco", label: "Almoço", icon: Salad, desc: "Refeição principal equilibrada", color: "#3b82f6" },
  { key: "lanche_tarde", label: "Lanche da Tarde", icon: Sandwich, desc: "Lanche intermediário vespertino", color: "#8b5cf6" },
  { key: "jantar", label: "Jantar", icon: Soup, desc: "Refeição leve noturna", color: "#ec4899" }
];

const DIAS_SEMANA = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo"
];

// Gerador de Plano Base / Fallback Manual com culinária brasileira saudável
function gerarPlanoBaseManual(paciente = {}) {
  const restricoes = (paciente.restricoes_alimentares || []).map(r => r.toLowerCase());
  const semLactose = restricoes.some(r => r.includes("lactose") || r.includes("leite"));
  const semGluten = restricoes.some(r => r.includes("glúten") || r.includes("celíaco"));

  const cafePadrao = [
    semLactose ? "1 xícara de café preto com canela + 2 ovos mexidos com azeite" : "1 xícara de café com leite desnatado ou vegetal + 2 ovos mexidos",
    semGluten ? "1 tapioca pequena com queijo branco ou cottage e orégano" : "2 fatias de pão 100% integral com queijo branco ou ricota",
    "1 porção de fruta fresca (mamão papaia ou maçã) com 1 colher de sementes de chia",
    "1 copo de água morna com meio limão espremido em jejum",
    "Vitamina de frutas com leite vegetal e 1 colher de aveia sem glúten"
  ];

  const lancheManhaPadrao = [
    "1 fruta fresca (banana, maçã ou pera)",
    "1 punhado pequeno (20g) de castanhas-do-pará ou nozes",
    "1 pote de iogurte natural desnatado ou de coco",
    "3 biscoitos de arroz integral com pasta de amendoim integral",
    "1 xícara de chá verde ou chá de camomila sem açúcar"
  ];

  const almocoPadrao = [
    "Salada colorida à vontade (alface, rúcula, tomate, pepino e cenoura ralada) temperada com azeite extravirgem e limão",
    "3 colheres de sopa de arroz integral ou batata-doce assada",
    "1 concha pequena de feijão carioca ou feijão-preto",
    "1 filé de peito de frango grelhado (120g) ou peixe assado com ervas",
    "Legumes no vapor (brócolis, abobrinha e cenoura com azeite)"
  ];

  const lancheTardePadrao = [
    "1 fatia de pão integral com pasta de atum ou ovo cozido",
    "1 tigela de salada de frutas com aveia em flocos e sementes de linhaça",
    "1 iogurte proteico ou smoothie de frutas vermelhas com água de coco",
    "2 torradas integrais com queijo minas frescal",
    "1 xícara de chá de hortelã ou hibisco sem açúcar"
  ];

  const jantarPadrao = [
    "Prato fundo de sopa de legumes com frango desfiado",
    "Salada verde completa com folhas escuras, tomate-cereja e sementes de girassol",
    "Omelete de 2 ovos com espinafre, tomate e queijo branco",
    "1 filé de peixe grelhado ou frango assado acompanhado de purê de abóbora cabotiá",
    "Wrap integral ou de couve recheado com frango desfiado e ricota temperada"
  ];

  return DIAS_SEMANA.map((dia) => ({
    dia,
    refeicoes: {
      cafe_da_manha: [...cafePadrao],
      lanche_manha: [...lancheManhaPadrao],
      almoco: [...almocoPadrao],
      lanche_tarde: [...lancheTardePadrao],
      jantar: [...jantarPadrao]
    }
  }));
}

export default function PlanoAlimentarManager({ paciente, planos = [], onPlanoSaved }) {
  const [planoAtual, setPlanoAtual] = useState(null);
  const [tituloPlano, setTituloPlano] = useState("");
  const [descricaoPlano, setDescricaoPlano] = useState("");
  const [diaAtivoIndex, setDiaAtivoIndex] = useState(0);

  // Estados de IA e Carregamento
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [planoVisualizando, setPlanoVisualizando] = useState(null);
  const [planoParaImprimir, setPlanoParaImprimir] = useState(null);

  // Mensagens dinâmicas de loading
  const loadingSteps = useMemo(() => [
    `Buscando dados e metas clínicas de ${paciente?.nome || "paciente"}...`,
    `Verificando alergias, restrições (${Array.isArray(paciente?.restricoes_alimentares) && paciente.restricoes_alimentares.length > 0 ? paciente.restricoes_alimentares.join(", ") : "Nenhuma restrição severa"})...`,
    "Inteligência Artificial (Google Gemini) calculando cardápio semanal variado...",
    "Estruturando 5 opções equilibradas para cada refeição brasileira...",
    "Finalizando formatação do plano nutricional personalizado..."
  ], [paciente]);

  // Efeito de ciclo de mensagens de loading
  useEffect(() => {
    let interval = null;
    if (isGeneratingIA) {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev + 1) % loadingSteps.length);
      }, 1800);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGeneratingIA, loadingSteps.length]);

  // Função para acionar geração via IA
  const handleGerarPlanoComIA = async () => {
    setIsGeneratingIA(true);
    setFeedbackMsg(null);

    try {
      const response = await fetch("/api/gerar-plano", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paciente })
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.plano_semanal) {
        throw new Error(data.error || "Não foi possível gerar o plano com IA.");
      }

      setPlanoAtual(data.plano_semanal);
      setTituloPlano(
        `Plano Nutricional ${paciente?.nome ? `— ${paciente.nome}` : ""} (IA)`
      );
      setDescricaoPlano(
        `Cardápio semanal balanceado gerado com IA considerando metas de ${
          Array.isArray(paciente?.objetivos) ? paciente.objetivos.join(", ") : "saúde"
        }.`
      );
      setDiaAtivoIndex(0);
      setFeedbackMsg({
        type: "success",
        text: "✨ Plano alimentar semanal gerado com sucesso pelo Gemini! Você pode revisar e editar cada refeição abaixo."
      });
    } catch (err) {
      console.warn("Falha na chamada da IA, aplicando plano base resiliente:", err);
      const planoFallback = gerarPlanoBaseManual(paciente);
      setPlanoAtual(planoFallback);
      setTituloPlano(`Plano Alimentar Personalizado — ${paciente?.nome || "Paciente"}`);
      setDescricaoPlano("Cardápio semanal baseado nas preferências e rotina do paciente.");
      setDiaAtivoIndex(0);

      setFeedbackMsg({
        type: "error",
        text: `Não foi possível conectar com o Gemini (${err.message}). Carregamos um modelo semanal padrão para você editar e salvar manualmente.`
      });
    } finally {
      setIsGeneratingIA(false);
    }
  };

  // Criar Plano Manualmente do Zero / Modelo Padrão
  const handleCriarPlanoManual = () => {
    const novoPlano = gerarPlanoBaseManual(paciente);
    setPlanoAtual(novoPlano);
    setTituloPlano(`Plano Alimentar — ${paciente?.nome || "Paciente"}`);
    setDescricaoPlano("Prescrição nutricional estruturada manualmente.");
    setDiaAtivoIndex(0);
    setFeedbackMsg({
      type: "info",
      text: "Modelo de plano semanal carregado. Altere as opções conforme necessário e clique em Salvar."
    });
  };

  // Atualizar uma opção de refeição específica no estado
  const handleOptionChange = (diaIdx, refeicaoKey, optionIdx, value) => {
    if (!planoAtual) return;
    const novoPlano = [...planoAtual];
    const diaObj = { ...novoPlano[diaIdx] };
    const refeicoesObj = { ...diaObj.refeicoes };
    const optionsArray = [...(refeicoesObj[refeicaoKey] || [])];

    optionsArray[optionIdx] = value;
    refeicoesObj[refeicaoKey] = optionsArray;
    diaObj.refeicoes = refeicoesObj;
    novoPlano[diaIdx] = diaObj;

    setPlanoAtual(novoPlano);
  };

  // Salvar Plano Alimentar no Banco Neon
  const handleSalvarPlano = async (e) => {
    if (e) e.preventDefault();
    if (!planoAtual || !paciente?.id) return;

    setIsSaving(true);
    setFeedbackMsg(null);

    try {
      const conteudoPlano = {
        titulo: tituloPlano.trim() || `Plano Alimentar #${planos.length + 1}`,
        descricao: descricaoPlano.trim(),
        plano_semanal: planoAtual,
        criado_com_ia: !feedbackMsg?.text?.includes("manualmente"),
        data_geracao: new Date().toISOString()
      };

      await sql`
        INSERT INTO planos_alimentares (paciente_id, conteudo)
        VALUES (${paciente.id}, ${JSON.stringify(conteudoPlano)})
      `;

      setFeedbackMsg({
        type: "success",
        text: "✅ Plano alimentar salvo com sucesso no prontuário do paciente!"
      });

      if (onPlanoSaved) {
        await onPlanoSaved();
      }
    } catch (err) {
      console.error("Erro ao salvar plano alimentar:", err);
      setFeedbackMsg({
        type: "error",
        text: `Erro ao salvar plano no banco de dados: ${err.message}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Imprimir ou Exportar Plano Atual ou Histórico em PDF limpo
  const handleImprimirPlano = (planoCustom = null) => {
    const dadosImpressao = planoCustom || {
      titulo: tituloPlano || "Plano Alimentar Semanal",
      descricao: descricaoPlano || "Prescrição dietética individualizada.",
      plano_semanal: planoAtual,
      data_geracao: new Date().toISOString()
    };

    setPlanoParaImprimir(dadosImpressao);

    // Timeout sutil para garantir que o DOM de impressão seja montado antes do print dialog
    setTimeout(() => {
      window.print();
    }, 120);
  };

  // Visualizar plano antigo do histórico
  const handleVisualizarHistorico = (plano) => {
    if (planoVisualizando?.id === plano.id) {
      setPlanoVisualizando(null);
    } else {
      setPlanoVisualizando(plano);
    }
  };

  // Carregar plano antigo para edição
  const handleEditarPlanoHistorico = (plano) => {
    if (plano?.conteudo?.plano_semanal) {
      setPlanoAtual(plano.conteudo.plano_semanal);
      setTituloPlano(plano.conteudo.titulo || `Plano Alimentar`);
      setDescricaoPlano(plano.conteudo.descricao || "");
      setDiaAtivoIndex(0);
      setFeedbackMsg({
        type: "info",
        text: "Plano do histórico carregado no editor. Faça as alterações desejadas e clique em Salvar."
      });
      window.scrollTo({ top: 300, behavior: "smooth" });
    }
  };

  const diaAtivoObj = planoAtual && planoAtual[diaAtivoIndex] ? planoAtual[diaAtivoIndex] : null;

  // Plano ativo para documento de impressão
  const planoAtivoParaPrint = planoParaImprimir || (planoAtual ? {
    titulo: tituloPlano || "Plano Alimentar Semanal",
    descricao: descricaoPlano || "Prescrição dietética individualizada.",
    plano_semanal: planoAtual,
    data_geracao: new Date().toISOString()
  } : null);

  return (
    <div className="plano-alimentar-manager-wrapper">
      {/* =========================================================================
          DOCUMENTO EXCLUSIVO DE IMPRESSÃO / PDF (Visível estritamente ao imprimir)
          ========================================================================= */}
      {planoAtivoParaPrint && planoAtivoParaPrint.plano_semanal && (
        <div id="plano-alimentar-print-document" className="plano-print-only">
          {/* Cabeçalho Oficial LopesNutri */}
          <div className="print-header-top">
            <div className="print-brand">
              <div className="print-logo-icon">🌿</div>
              <div>
                <h1 className="print-clinic-name">LopesNutri</h1>
                <span className="print-clinic-tagline">Nutrição Clínica & Performance Individualizada</span>
              </div>
            </div>
            <div className="print-doc-badge">
              <span>PRESCRIÇÃO DIETÉTICA</span>
            </div>
          </div>

          {/* Dados do Paciente e Prescrição */}
          <div className="print-patient-card">
            <div className="print-patient-grid">
              <div className="print-patient-item">
                <span className="print-label">Paciente:</span>
                <strong className="print-value">{paciente?.nome || "Paciente"}</strong>
              </div>
              <div className="print-patient-item">
                <span className="print-label">Data de Emissão:</span>
                <strong className="print-value">
                  {new Date(planoAtivoParaPrint.data_geracao || Date.now()).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  })}
                </strong>
              </div>
              <div className="print-patient-item">
                <span className="print-label">Objetivo:</span>
                <strong className="print-value">
                  {Array.isArray(paciente?.objetivos) ? paciente.objetivos.join(", ") : (paciente?.objetivos || "Reeducação Alimentar")}
                </strong>
              </div>
              <div className="print-patient-item">
                <span className="print-label">Meta de Hidratação:</span>
                <strong className="print-value">{paciente?.litros_agua ? `${paciente.litros_agua}L de água / dia` : "2.5L de água / dia"}</strong>
              </div>
              {paciente?.restricoes_alimentares && (
                <div className="print-patient-item" style={{ gridColumn: "span 2" }}>
                  <span className="print-label">Restrições / Alergias:</span>
                  <strong className="print-value">
                    {Array.isArray(paciente.restricoes_alimentares)
                      ? paciente.restricoes_alimentares.join(", ")
                      : paciente.restricoes_alimentares}
                  </strong>
                </div>
              )}
            </div>
          </div>

          {/* Título do Plano e Orientações */}
          <div className="print-title-section">
            <h2 className="print-plan-title">{planoAtivoParaPrint.titulo || "Plano Alimentar Semanal"}</h2>
            {planoAtivoParaPrint.descricao && (
              <p className="print-plan-desc">{planoAtivoParaPrint.descricao}</p>
            )}
          </div>

          {/* Grade Semanal Completa das Refeições (7 Dias) */}
          <div className="print-days-container">
            {planoAtivoParaPrint.plano_semanal.map((diaItem, dIdx) => (
              <div key={dIdx} className="print-day-block">
                <div className="print-day-header">
                  <h3>{diaItem.dia}</h3>
                </div>

                <div className="print-meals-grid">
                  {REFEICOES_CONFIG.map((ref) => {
                    const options = diaItem.refeicoes?.[ref.key] || [];
                    if (options.length === 0) return null;
                    return (
                      <div key={ref.key} className="print-meal-box">
                        <div className="print-meal-name">
                          <span>{ref.label}</span>
                        </div>
                        <ul className="print-meal-options">
                          {options.map((opt, oIdx) => (
                            <li key={oIdx}>
                              <span className="print-opt-bullet">•</span>
                              <span>{opt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Orientações Finais & Assinatura */}
          <div className="print-footer-section">
            <div className="print-guidelines-box">
              <h4>Orientações Nutricionais Gerais</h4>
              <ul>
                <li>Mastigue os alimentos devagar e faça suas refeições em ambiente tranquilo.</li>
                <li>Mantenha a hidratação distribuída ao longo do dia, evitando líquidos em excesso durante as refeições principais.</li>
                <li>Dúvidas ou ajustes no cardápio devem ser comunicados diretamente ao seu nutricionista.</li>
              </ul>
            </div>

            <div className="print-signature-wrap">
              <div className="print-signature-line" />
              <strong>Nutricionista Responsável</strong>
              <span>LopesNutri · CRN Ativo</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          INTERFACE DE TELA (NÃO IMPRESSA)
          ========================================================================= */}
      <div className="card-header-flex" style={{ alignItems: "center" }}>
        <div className="profile-card-title" style={{ marginBottom: 0 }}>
          <div className="icon-badge-round" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
            <Utensils size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Prescrição & Planos Alimentares</h3>
            <span className="chart-subtitle">
              Elabore e personalize cardápios semanais completos com inteligência artificial
            </span>
          </div>
        </div>

        {/* Botões de Ação do Topo */}
        <div className="plano-top-actions" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {!planoAtual && (
            <button
              type="button"
              className="btn-secondary-action"
              onClick={handleCriarPlanoManual}
              disabled={isGeneratingIA}
              title="Criar cardápio manualmente usando modelo padrão"
            >
              <Edit3 size={15} />
              <span>Plano Manual</span>
            </button>
          )}

          <button
            type="button"
            className="btn-primary-action btn-ai-pulse"
            onClick={handleGerarPlanoComIA}
            disabled={isGeneratingIA}
            title="Gera um cardápio semanal completo personalizado com Google Gemini"
          >
            {isGeneratingIA ? (
              <>
                <RefreshCw size={16} className="spin-animation" />
                <span>Gerando com IA...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>✨ Gerar Plano com IA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Banner de Feedback / Alertas */}
      {feedbackMsg && (
        <div
          className={`plano-feedback-banner ${feedbackMsg.type} animate-fade-in`}
          style={{
            marginTop: "1rem",
            padding: "0.85rem 1.15rem",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "0.88rem",
            fontWeight: 500,
            backgroundColor:
              feedbackMsg.type === "success"
                ? "var(--success-bg)"
                : feedbackMsg.type === "error"
                ? "var(--error-bg)"
                : "var(--info-bg)",
            border: `1px solid ${
              feedbackMsg.type === "success"
                ? "var(--success-border)"
                : feedbackMsg.type === "error"
                ? "var(--error-border)"
                : "var(--info-border)"
            }`,
            color:
              feedbackMsg.type === "success"
                ? "var(--success)"
                : feedbackMsg.type === "error"
                ? "var(--error)"
                : "var(--info)"
          }}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          ) : feedbackMsg.type === "error" ? (
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
          ) : (
            <Info size={18} style={{ flexShrink: 0 }} />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Estado Visual de Loading da IA com Mensagens Dinâmicas */}
      {isGeneratingIA && (
        <div className="plano-ai-loading-box animate-fade-in" style={{ margin: "1.5rem 0" }}>
          <div className="loading-card-inner">
            <div className="ai-spinner-orb">
              <Sparkles size={26} className="spin-slow" />
            </div>
            <div className="loading-text-stack">
              <h4>Elaborando Plano Nutricional com IA</h4>
              <p className="loading-dynamic-step">{loadingSteps[loadingStepIndex]}</p>
            </div>
            <div className="loading-progress-bar">
              <div
                className="loading-progress-fill"
                style={{ width: `${((loadingStepIndex + 1) / loadingSteps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDITOR INTERATIVO DE PLANO ALIMENTAR (EM FORMATO DE ABAS)
          ========================================================================= */}
      {planoAtual && !isGeneratingIA && (
        <div className="plano-editor-card animate-fade-in" style={{ marginTop: "1.25rem" }}>
          {/* Cabeçalho do Editor com Título e Descrição Editáveis */}
          <div className="editor-meta-header">
            <div className="editor-meta-fields">
              <div className="form-group-field" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Título da Prescrição Dietética
                </label>
                <input
                  type="text"
                  className="styled-input-field"
                  value={tituloPlano}
                  onChange={(e) => setTituloPlano(e.target.value)}
                  placeholder="Ex: Plano de Emagrecimento e Reeducação Alimentar"
                  style={{ fontWeight: 700, fontSize: "1.05rem" }}
                />
              </div>

              <div className="form-group-field" style={{ flex: 1.5 }}>
                <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Diretrizes & Observações Gerais do Cardápio
                </label>
                <input
                  type="text"
                  className="styled-input-field"
                  value={descricaoPlano}
                  onChange={(e) => setDescricaoPlano(e.target.value)}
                  placeholder="Ex: Beber 2,5L de água/dia. Evitar frituras e açúcares simples."
                />
              </div>
            </div>

            {/* Ações Rápidas do Editor */}
            <div className="editor-header-actions">
              <button
                type="button"
                className="btn-refresh"
                onClick={() => handleImprimirPlano()}
                title="Imprimir prescrição limpa ou salvar em PDF"
              >
                <Printer size={15} />
                <span>Imprimir / PDF</span>
              </button>

              <button
                type="button"
                className="btn-primary-action"
                onClick={handleSalvarPlano}
                disabled={isSaving}
                title="Salvar plano alimentar no banco de dados do paciente"
              >
                {isSaving ? (
                  <>
                    <div className="spinner-sm" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Salvar Plano Alimentar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Barra de Navegação por Abas (Dias da Semana) */}
          <div className="plano-days-tabs-nav">
            {planoAtual.map((diaObj, index) => {
              const isActive = index === diaAtivoIndex;
              return (
                <button
                  key={diaObj.dia || index}
                  type="button"
                  className={`plano-day-tab-btn ${isActive ? "active" : ""}`}
                  onClick={() => setDiaAtivoIndex(index)}
                >
                  <span className="tab-day-name">{diaObj.dia}</span>
                  {isActive && <span className="tab-active-dot" />}
                </button>
              );
            })}
          </div>

          {/* Corpo do Dia Ativo — 5 Refeições com 5 Opções Editáveis Cada */}
          {diaAtivoObj && (
            <div className="plano-day-content animate-fade-in" key={diaAtivoIndex}>
              <div className="day-content-header">
                <div className="day-header-badge">
                  <Calendar size={15} />
                  <span>Cardápio de {diaAtivoObj.dia}</span>
                </div>
                <span className="day-header-hint">
                  Edite qualquer uma das 5 opções de cada refeição diretamente nos campos abaixo.
                </span>
              </div>

              <div className="meals-grid-stack">
                {REFEICOES_CONFIG.map((refConfig) => {
                  const RefIcon = refConfig.icon;
                  const optionsList =
                    diaAtivoObj.refeicoes && diaAtivoObj.refeicoes[refConfig.key]
                      ? diaAtivoObj.refeicoes[refConfig.key]
                      : ["", "", "", "", ""];

                  return (
                    <div key={refConfig.key} className="meal-card-block">
                      {/* Cabeçalho da Refeição */}
                      <div className="meal-card-header">
                        <div className="meal-title-group">
                          <div
                            className="meal-icon-pill"
                            style={{
                              backgroundColor: "var(--primary-light)",
                              color: "var(--primary)"
                            }}
                          >
                            <RefIcon size={16} />
                          </div>
                          <div>
                            <h4 className="meal-title">{refConfig.label}</h4>
                            <span className="meal-desc">{refConfig.desc}</span>
                          </div>
                        </div>

                        <span className="meal-options-count">5 opções recomendadas</span>
                      </div>

                      {/* 5 Inputs Editáveis para as Opções de Alimentos */}
                      <div className="meal-options-inputs-list">
                        {optionsList.map((opcaoTexto, optIdx) => (
                          <div key={optIdx} className="meal-option-row">
                            <span className="opt-number-badge">#{optIdx + 1}</span>
                            <input
                              type="text"
                              className="styled-input-field meal-input-field"
                              value={opcaoTexto || ""}
                              onChange={(e) =>
                                handleOptionChange(
                                  diaAtivoIndex,
                                  refConfig.key,
                                  optIdx,
                                  e.target.value
                                )
                              }
                              placeholder={`Opção ${optIdx + 1} para ${refConfig.label}...`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botão de Salvar no Fim do Cardápio */}
              <div className="day-content-footer" style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  className="btn-refresh"
                  onClick={() => {
                    if (diaAtivoIndex < planoAtual.length - 1) {
                      setDiaAtivoIndex(diaAtivoIndex + 1);
                    } else {
                      setDiaAtivoIndex(0);
                    }
                  }}
                >
                  <span>Próximo Dia</span>
                  <ChevronRight size={14} />
                </button>

                <button
                  type="button"
                  className="btn-refresh"
                  onClick={() => handleImprimirPlano()}
                  title="Imprimir prescrição ou salvar em PDF"
                >
                  <Printer size={15} />
                  <span>Imprimir / PDF</span>
                </button>

                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={handleSalvarPlano}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="spinner-sm" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Salvar Plano Alimentar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          HISTÓRICO DE PLANOS ALIMENTARES ANTERIORES
          ========================================================================= */}
      <div className="planos-historico-section" style={{ marginTop: "2rem" }}>
        <div className="section-sub-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Clock size={16} color="var(--text-muted)" />
            <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)" }}>
              Histórico de Planos Prescritos ({planos.length})
            </h4>
          </div>
          {planos.length > 0 && (
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Planos gravados no prontuário do paciente
            </span>
          )}
        </div>

        {planos.length === 0 ? (
          <div className="empty-state-box" style={{ padding: "2.25rem 1.5rem" }}>
            <Utensils size={36} className="empty-icon-muted" />
            <h4 style={{ margin: "0.5rem 0 0.25rem", fontSize: "1rem" }}>Nenhum plano alimentar prescrito</h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "450px" }}>
              Clique em <strong>"✨ Gerar Plano com IA"</strong> para criar um cardápio semanal completo sob medida para {paciente?.nome || "este paciente"}.
            </p>
          </div>
        ) : (
          <div className="planos-history-list" style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {planos.map((plano, index) => {
              const conteudo = plano.conteudo || {};
              const titulo = conteudo.titulo || `Plano Alimentar #${planos.length - index}`;
              const isExpanded = planoVisualizando?.id === plano.id;
              const dataFormatada = plano.created_at
                ? new Date(plano.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  })
                : "Recente";

              return (
                <div key={plano.id || index} className="plano-history-card">
                  <div
                    className="plano-history-header"
                    onClick={() => handleVisualizarHistorico(plano)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="plano-history-left">
                      <div className="history-icon-circle">
                        {conteudo.criado_com_ia ? (
                          <Sparkles size={16} color="var(--primary)" />
                        ) : (
                          <Utensils size={16} color="var(--primary)" />
                        )}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <strong className="plano-history-title">{titulo}</strong>
                          {conteudo.criado_com_ia && (
                            <span className="badge-ai-pill">Gemini IA</span>
                          )}
                        </div>
                        {conteudo.descricao && (
                          <p className="plano-history-sub">{conteudo.descricao}</p>
                        )}
                      </div>
                    </div>

                    <div className="plano-history-right">
                      <span className="plano-date-badge">
                        <Calendar size={13} />
                        {dataFormatada}
                      </span>
                      <button
                        type="button"
                        className="btn-toggle-expand"
                        aria-label="Expandir ou recolher plano"
                      >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Visualizador de Detalhes Expansível */}
                  {isExpanded && conteudo.plano_semanal && (
                    <div className="plano-expanded-viewer animate-fade-in">
                      <div className="expanded-actions-bar">
                        <span className="expanded-hint">
                          Visualização do cardápio semanal salvo em {dataFormatada}
                        </span>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            type="button"
                            className="btn-refresh"
                            onClick={() => handleImprimirPlano(conteudo)}
                            style={{ padding: "0.45rem 0.85rem", fontSize: "0.82rem" }}
                          >
                            <Printer size={14} />
                            <span>Imprimir PDF</span>
                          </button>
                          <button
                            type="button"
                            className="btn-secondary-action"
                            onClick={() => handleEditarPlanoHistorico(plano)}
                            style={{ padding: "0.45rem 0.95rem", fontSize: "0.82rem" }}
                          >
                            <Edit3 size={14} />
                            <span>Carregar no Editor</span>
                          </button>
                        </div>
                      </div>

                      <div className="expanded-days-grid">
                        {conteudo.plano_semanal.map((diaItem, dIdx) => (
                          <div key={dIdx} className="expanded-day-card">
                            <div className="expanded-day-title">
                              <strong>{diaItem.dia}</strong>
                            </div>
                            <div className="expanded-meals-list">
                              {REFEICOES_CONFIG.map((ref) => {
                                const items = diaItem.refeicoes?.[ref.key] || [];
                                if (items.length === 0) return null;
                                return (
                                  <div key={ref.key} className="expanded-meal-item">
                                    <span className="expanded-meal-label">{ref.label}:</span>
                                    <ul className="expanded-options-bullet">
                                      {items.map((opt, oIdx) => (
                                        <li key={oIdx}>{opt}</li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
