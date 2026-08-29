import React, { useState, useMemo, useEffect } from "react";
import {
  Activity,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Minus,
  CheckCircle2,
  Sliders,
  User,
  ArrowRight,
  Maximize2,
  Info,
  Edit3,
  Save,
  X,
  Ruler,
  Scale,
  HeartPulse,
  Eye,
  Layers
} from "lucide-react";
import { sql } from "../db";
import { formatDate } from "../utils/helpers";

// Definição dos pontos anatômicos mapeados sobre a silhueta dinâmica (viewBox 320 x 680)
const PONTOS_ANATOMICOS = [
  {
    key: "torax",
    label: "Tórax / Peitoral",
    unit: "cm",
    desc: "Perímetro torácico e peitoral",
    yPct: 24,
    defaultMasc: 95,
    defaultFem: 90,
    goalType: "muscle"
  },
  {
    key: "braco",
    label: "Braço / Bíceps",
    unit: "cm",
    desc: "Perímetro do braço contraído/relaxado",
    yPct: 32,
    defaultMasc: 32,
    defaultFem: 28,
    goalType: "muscle"
  },
  {
    key: "cintura",
    label: "Cintura / Abdômen",
    unit: "cm",
    desc: "Circunferência na altura da cicatriz umbilical",
    yPct: 40,
    defaultMasc: 86,
    defaultFem: 70,
    goalType: "reduction"
  },
  {
    key: "quadril",
    label: "Quadril",
    unit: "cm",
    desc: "Maior perímetro da região glútea",
    yPct: 52,
    defaultMasc: 98,
    defaultFem: 96,
    goalType: "reduction"
  },
  {
    key: "coxa",
    label: "Coxa",
    unit: "cm",
    desc: "Perímetro medial da coxa",
    yPct: 66,
    defaultMasc: 58,
    defaultFem: 56,
    goalType: "muscle"
  },
  {
    key: "panturrilha",
    label: "Panturrilha",
    unit: "cm",
    desc: "Maior circunferência da perna",
    yPct: 85,
    defaultMasc: 38,
    defaultFem: 36,
    goalType: "muscle"
  }
];

/**
 * Gera o Traçado SVG Paramétrico da Silhueta Corporal
 * Deforma dinamicamente o corpo com base nas medidas reais de cada consulta.
 */
function getParametricSilhouettePath({
  isFeminino,
  scaleTorax = 1,
  scaleBraco = 1,
  scaleCintura = 1,
  scaleQuadril = 1,
  scaleCoxa = 1,
  scalePanturrilha = 1
}) {
  const cx = 160;

  // Aplica fator de amplificação visual suave para tornar variações anatômicas perceptíveis no desenho
  const amp = (sc, factor = 2.4) => 1 + (sc - 1) * factor;

  const st = amp(scaleTorax, 2.0);
  const sb = amp(scaleBraco, 2.2);
  const sc = amp(scaleCintura, 2.5);
  const sq = amp(scaleQuadril, 2.3);
  const sco = amp(scaleCoxa, 2.2);
  const sp = amp(scalePanturrilha, 2.2);

  if (isFeminino) {
    const shoulderW = Math.max(42, Math.min(68, 54 * st));
    const chestW = Math.max(38, Math.min(64, 48 * st));
    const waistW = Math.max(26, Math.min(54, 35 * sc));
    const hipW = Math.max(46, Math.min(78, 62 * sq));
    const armW = Math.max(8, Math.min(22, 13 * sb));
    const thighW = Math.max(18, Math.min(38, 26 * sco));
    const calfW = Math.max(12, Math.min(26, 17 * sp));

    return `
      M ${cx - 12} 66
      C ${cx - shoulderW} 72, ${cx - shoulderW - 12} 90, ${cx - shoulderW - 18 - armW} 125
      C ${cx - shoulderW - 22 - armW} 165, ${cx - shoulderW - 18 - armW} 215, ${cx - shoulderW - 14 - armW} 265
      C ${cx - shoulderW - 10} 275, ${cx - shoulderW - 2} 270, ${cx - shoulderW + 2} 260
      C ${cx - shoulderW + 8} 205, ${cx - chestW - 4} 160, ${cx - chestW} 140
      C ${cx - chestW + 2} 170, ${cx - waistW - 2} 210, ${cx - waistW} 265
      C ${cx - waistW} 305, ${cx - hipW} 335, ${cx - hipW} 358
      C ${cx - hipW + 4} 395, ${cx - 18 - thighW} 440, ${cx - 16 - thighW} 490
      C ${cx - 14 - calfW} 530, ${cx - 12 - calfW} 580, ${cx - 10 - calfW} 630
      C ${cx - 8} 645, ${cx - 1} 645, ${cx - 3} 630
      C ${cx - 5} 580, ${cx - 7} 530, ${cx - 9} 490
      L ${cx} 385
      L ${cx + 9} 490
      C ${cx + 7} 530, ${cx + 5} 580, ${cx + 3} 630
      C ${cx + 1} 645, ${cx + 8} 645, ${cx + 10 + calfW} 630
      C ${cx + 12 + calfW} 580, ${cx + 14 + calfW} 530, ${cx + 16 + thighW} 490
      C ${cx + 18 + thighW} 440, ${cx + hipW - 4} 395, ${cx + hipW} 358
      C ${cx + hipW} 335, ${cx + waistW} 305, ${cx + waistW} 265
      C ${cx + waistW - 2} 210, ${cx + chestW - 2} 170, ${cx + chestW} 140
      C ${cx + chestW - 4} 160, ${cx + shoulderW - 8} 205, ${cx + shoulderW - 2} 260
      C ${cx + shoulderW + 2} 270, ${cx + shoulderW + 10} 275, ${cx + shoulderW + 14 + armW} 265
      C ${cx + shoulderW + 18 + armW} 215, ${cx + shoulderW + 22 + armW} 165, ${cx + shoulderW + 18 + armW} 125
      C ${cx + shoulderW + 12} 90, ${cx + shoulderW} 72, ${cx + 12} 66
      Z
    `;
  } else {
    // Masculino
    const shoulderW = Math.max(54, Math.min(84, 68 * st));
    const chestW = Math.max(48, Math.min(76, 60 * st));
    const waistW = Math.max(34, Math.min(62, 44 * sc));
    const hipW = Math.max(42, Math.min(70, 54 * sq));
    const armW = Math.max(10, Math.min(26, 16 * sb));
    const thighW = Math.max(20, Math.min(42, 28 * sco));
    const calfW = Math.max(14, Math.min(30, 19 * sp));

    return `
      M ${cx - 15} 66
      C ${cx - shoulderW} 72, ${cx - shoulderW - 14} 92, ${cx - shoulderW - 20 - armW} 130
      C ${cx - shoulderW - 24 - armW} 170, ${cx - shoulderW - 20 - armW} 225, ${cx - shoulderW - 16 - armW} 272
      C ${cx - shoulderW - 12} 282, ${cx - shoulderW - 4} 278, ${cx - shoulderW + 1} 268
      C ${cx - shoulderW + 6} 212, ${cx - chestW - 6} 165, ${cx - chestW} 146
      C ${cx - chestW + 4} 176, ${cx - waistW - 2} 216, ${cx - waistW} 265
      C ${cx - waistW} 305, ${cx - hipW} 330, ${cx - hipW} 355
      C ${cx - hipW + 4} 390, ${cx - 20 - thighW} 440, ${cx - 18 - thighW} 490
      C ${cx - 16 - calfW} 530, ${cx - 14 - calfW} 580, ${cx - 12 - calfW} 630
      C ${cx - 10} 645, ${cx - 2} 645, ${cx - 4} 630
      C ${cx - 6} 580, ${cx - 8} 530, ${cx - 10} 490
      L ${cx} 390
      L ${cx + 10} 490
      C ${cx + 8} 530, ${cx + 6} 580, ${cx + 4} 630
      C ${cx + 2} 645, ${cx + 10} 645, ${cx + 12 + calfW} 630
      C ${cx + 14 + calfW} 580, ${cx + 16 + calfW} 530, ${cx + 18 + thighW} 490
      C ${cx + 20 + thighW} 440, ${cx + hipW - 4} 390, ${cx + hipW} 355
      C ${cx + hipW} 330, ${cx + waistW} 305, ${cx + waistW} 265
      C ${cx + waistW - 2} 216, ${cx + chestW - 4} 176, ${cx + chestW} 146
      C ${cx + chestW - 6} 165, ${cx + shoulderW - 6} 212, ${cx + shoulderW - 1} 268
      C ${cx + shoulderW + 4} 278, ${cx + shoulderW + 12} 282, ${cx + shoulderW + 16 + armW} 272
      C ${cx + shoulderW + 20 + armW} 225, ${cx + shoulderW + 24 + armW} 170, ${cx + shoulderW + 20 + armW} 130
      C ${cx + shoulderW + 14} 92, ${cx + shoulderW} 72, ${cx + 15} 66
      Z
    `;
  }
}

export default function SilhuetaCorporalEvolucao({ paciente = {}, consultas = [], onConsultaUpdated }) {
  const consultasOrdenadas = useMemo(() => {
    return [...(consultas || [])]
      .filter((c) => c && c.data_consulta)
      .sort((a, b) => new Date(a.data_consulta) - new Date(b.data_consulta));
  }, [consultas]);

  const [indiceConsultaBase, setIndiceConsultaBase] = useState(0);
  const [indiceConsultaAtiva, setIndiceConsultaAtiva] = useState(
    consultasOrdenadas.length > 0 ? consultasOrdenadas.length - 1 : 0
  );
  const [pontoAtivoKey, setPontoAtivoKey] = useState("quadril");
  const [mostrarSobreposicaoBase, setMostrarSobreposicaoBase] = useState(true);

  // Modal de edição
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [savingMedidas, setSavingMedidas] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({
    peso: "",
    percentual_gordura: "",
    torax: "",
    braco: "",
    cintura: "",
    quadril: "",
    coxa: "",
    panturrilha: ""
  });

  const isFeminino = (paciente.sexo || "").toLowerCase().includes("fem");
  const consultaBase = consultasOrdenadas[indiceConsultaBase] || null;
  const consultaAtiva = consultasOrdenadas[indiceConsultaAtiva] || null;

  useEffect(() => {
    if (consultaAtiva) {
      setEditForm({
        peso: consultaAtiva.peso ? String(consultaAtiva.peso) : "",
        percentual_gordura: consultaAtiva.percentual_gordura ? String(consultaAtiva.percentual_gordura) : "",
        torax: consultaAtiva.torax ? String(consultaAtiva.torax) : "",
        braco: consultaAtiva.braco ? String(consultaAtiva.braco) : "",
        cintura: consultaAtiva.cintura ? String(consultaAtiva.cintura) : "",
        quadril: consultaAtiva.quadril ? String(consultaAtiva.quadril) : "",
        coxa: consultaAtiva.coxa ? String(consultaAtiva.coxa) : "",
        panturrilha: consultaAtiva.panturrilha ? String(consultaAtiva.panturrilha) : ""
      });
    }
  }, [consultaAtiva]);

  // Cálculo de escalas anatômicas da Consulta Atual em relação à Consulta 1 (Base)
  const morphScales = useMemo(() => {
    const getScale = (key, defaultVal) => {
      const vBase = consultaBase && parseFloat(consultaBase[key]) > 0 ? parseFloat(consultaBase[key]) : defaultVal;
      const vAtivo = consultaAtiva && parseFloat(consultaAtiva[key]) > 0 ? parseFloat(consultaAtiva[key]) : vBase;
      return vAtivo / vBase;
    };

    return {
      scaleTorax: getScale("torax", isFeminino ? 90 : 95),
      scaleBraco: getScale("braco", isFeminino ? 28 : 32),
      scaleCintura: getScale("cintura", isFeminino ? 70 : 86),
      scaleQuadril: getScale("quadril", isFeminino ? 96 : 98),
      scaleCoxa: getScale("coxa", isFeminino ? 56 : 58),
      scalePanturrilha: getScale("panturrilha", isFeminino ? 36 : 38)
    };
  }, [consultaBase, consultaAtiva, isFeminino]);

  // Traçado da Silhueta Atual (Mórfica com base nas medidas)
  const currentSilhouettePath = useMemo(() => {
    return getParametricSilhouettePath({
      isFeminino,
      ...morphScales
    });
  }, [isFeminino, morphScales]);

  // Traçado da Silhueta Base / 1ª Consulta (Ghost contour)
  const baseSilhouettePath = useMemo(() => {
    return getParametricSilhouettePath({
      isFeminino,
      scaleTorax: 1,
      scaleBraco: 1,
      scaleCintura: 1,
      scaleQuadril: 1,
      scaleCoxa: 1,
      scalePanturrilha: 1
    });
  }, [isFeminino]);

  // Cálculo de evolução de cada medida anatômica
  const evolucaoMedidas = useMemo(() => {
    if (!consultaAtiva) return [];

    return PONTOS_ANATOMICOS.map((ponto) => {
      const valBase = consultaBase ? parseFloat(consultaBase[ponto.key]) : null;
      const valAtivo = parseFloat(consultaAtiva[ponto.key]);

      let diff = null;
      let diffStr = "0.0";
      let diffColor = "var(--text-muted)";
      let icon = Minus;
      let isGood = true;

      if (!isNaN(valBase) && !isNaN(valAtivo) && valBase > 0) {
        diff = valAtivo - valBase;
        diffStr = (diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)) + " " + ponto.unit;

        if (ponto.goalType === "reduction") {
          if (diff < -0.3) {
            diffColor = "#10b981";
            icon = TrendingDown;
            isGood = true;
          } else if (diff > 0.3) {
            diffColor = "#f59e0b";
            icon = TrendingUp;
            isGood = false;
          }
        } else {
          if (diff > 0.3) {
            diffColor = "#10b981";
            icon = TrendingUp;
            isGood = true;
          } else if (diff < -0.3) {
            diffColor = "#3b82f6";
            icon = TrendingDown;
            isGood = true;
          }
        }
      }

      const x = 50; // Centralizado no eixo x
      const y = ponto.yPct;

      return {
        ...ponto,
        valBase: !isNaN(valBase) ? valBase.toFixed(1) : null,
        valAtivo: !isNaN(valAtivo) ? valAtivo.toFixed(1) : null,
        diff,
        diffStr,
        diffColor,
        icon,
        isGood,
        x,
        y
      };
    });
  }, [consultaBase, consultaAtiva]);

  const medidaSelecionada = useMemo(() => {
    return evolucaoMedidas.find((m) => m.key === pontoAtivoKey) || evolucaoMedidas[0];
  }, [evolucaoMedidas, pontoAtivoKey]);

  // Histórico completo de todas as consultas para a medida em foco
  const historicoMedidaFoco = useMemo(() => {
    if (!medidaSelecionada) return [];
    return consultasOrdenadas.map((c, idx) => ({
      idx: idx + 1,
      data: c.data_consulta,
      valor: parseFloat(c[medidaSelecionada.key]) || null
    })).filter((item) => item.valor !== null);
  }, [consultasOrdenadas, medidaSelecionada]);

  // Salvar edições das medidas diretamente no banco
  const handleSalvarEdicaoMedidas = async (e) => {
    e?.preventDefault();
    if (!consultaAtiva?.id) return;

    setSavingMedidas(true);
    setEditError("");
    setSaveSuccess(false);

    try {
      await sql`
        UPDATE consultas SET
          peso = ${editForm.peso ? parseFloat(editForm.peso) : null},
          percentual_gordura = ${editForm.percentual_gordura ? parseFloat(editForm.percentual_gordura) : null},
          torax = ${editForm.torax ? parseFloat(editForm.torax) : null},
          braco = ${editForm.braco ? parseFloat(editForm.braco) : null},
          cintura = ${editForm.cintura ? parseFloat(editForm.cintura) : null},
          quadril = ${editForm.quadril ? parseFloat(editForm.quadril) : null},
          coxa = ${editForm.coxa ? parseFloat(editForm.coxa) : null},
          panturrilha = ${editForm.panturrilha ? parseFloat(editForm.panturrilha) : null}
        WHERE id = ${consultaAtiva.id}
      `;

      setSaveSuccess(true);
      if (onConsultaUpdated) {
        await onConsultaUpdated();
      }

      setTimeout(() => {
        setSaveSuccess(false);
        setModalEditOpen(false);
      }, 700);
    } catch (err) {
      console.error("Erro ao salvar medidas:", err);
      setEditError("Erro ao salvar alterações no banco de dados.");
    } finally {
      setSavingMedidas(false);
    }
  };

  if (consultasOrdenadas.length === 0) {
    return null;
  }

  return (
    <div className="silhueta-evolucao-card animate-fade-in">
      {/* Cabeçalho do Card */}
      <div className="silhueta-card-header">
        <div className="profile-card-title" style={{ marginBottom: 0 }}>
          <div className="icon-badge-round" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
            <Activity size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Mapeamento Antropométrico & Silhueta Corporal</h3>
            <span className="chart-subtitle">
              Morfologia corporal dinâmica e evolução de perímetros ({paciente.sexo || "Paciente"})
            </span>
          </div>
        </div>

        {/* Seletor de Consultas & Ação de Editar */}
        <div className="silhueta-header-actions">
          <div className="consultas-pill-selector">
            <span className="pill-selector-label">Consulta:</span>
            {consultasOrdenadas.map((c, idx) => {
              const isActive = idx === indiceConsultaAtiva;
              return (
                <button
                  key={c.id || idx}
                  type="button"
                  className={`consulta-badge-btn ${isActive ? "active" : ""}`}
                  onClick={() => setIndiceConsultaAtiva(idx)}
                >
                  <span>C{idx + 1}</span>
                  <span className="badge-btn-date">{formatDate(c.data_consulta)}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="btn-edit-medidas-pill"
            onClick={() => setModalEditOpen(true)}
            title="Editar as medidas desta consulta"
          >
            <Edit3 size={14} />
            <span>Editar Medidas (C{indiceConsultaAtiva + 1})</span>
          </button>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="silhueta-main-grid">
        {/* Painel da Silhueta Dinâmica com Morphing e Sobreposição */}
        <div className="silhueta-viewport-container">
          <div className="silhueta-viewport-header">
            <span className="silhueta-model-badge">
              Silhueta {isFeminino ? "Feminina" : "Masculina"} · {paciente.nome}
            </span>

            {/* Toggle de Comparativo de Sobreposição */}
            <button
              type="button"
              className={`btn-ghost-toggle ${mostrarSobreposicaoBase ? "active" : ""}`}
              onClick={() => setMostrarSobreposicaoBase(!mostrarSobreposicaoBase)}
              title="Alternar sobreposição do contorno da 1ª Consulta"
            >
              <Layers size={13} />
              <span>Comparar C1</span>
            </button>
          </div>

          <div className="silhueta-canvas-wrapper">
            <svg
              viewBox="0 0 320 680"
              className="silhueta-vector-svg"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Gradiente Corporal Esmeralda */}
                <linearGradient id="morphBodyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.88" />
                  <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.60" />
                </linearGradient>

                <filter id="silhouetteGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(16, 185, 129, 0.35)" />
                </filter>
              </defs>

              {/* 1. Silhueta de Sobreposição Fantasma da 1ª Consulta (Linha Tracejada) */}
              {mostrarSobreposicaoBase && indiceConsultaAtiva > 0 && (
                <g className="base-ghost-silhouette">
                  {/* Cabeça Base */}
                  <ellipse cx="160" cy="38" rx={isFeminino ? 22 : 24} ry={isFeminino ? 26 : 28} fill="none" stroke="var(--text-muted)" strokeDasharray="3 3" strokeWidth="1.5" opacity="0.4" />
                  {/* Tronco Base */}
                  <path
                    d={baseSilhouettePath}
                    fill="none"
                    stroke="var(--text-muted)"
                    strokeDasharray="4 4"
                    strokeWidth="1.8"
                    opacity="0.45"
                  />
                </g>
              )}

              {/* 2. Silhueta Corporal Atual com Deformação Anatômica Dinâmica */}
              <g className="current-dynamic-silhouette" filter="url(#silhouetteGlow)">
                {/* Cabeça */}
                <ellipse
                  cx="160"
                  cy="38"
                  rx={isFeminino ? 22 : 24}
                  ry={isFeminino ? 26 : 28}
                  fill="url(#morphBodyGradient)"
                />

                {/* Tronco e Membros com Morphing em Tempo Real */}
                <path
                  d={currentSilhouettePath}
                  fill="url(#morphBodyGradient)"
                  className="morphing-body-path"
                />
              </g>

              {/* Linha Central Guia Sutil */}
              <line x1="160" y1="120" x2="160" y2="390" stroke="#ffffff" strokeDasharray="3 3" strokeWidth="1" opacity="0.3" />

              {/* 3. Hotspots Anatômicos Interativos com Variação */}
              {evolucaoMedidas.map((medida) => {
                const isSelected = medida.key === pontoAtivoKey;
                const posX = 160;
                const posY = (medida.y / 100) * 680;

                return (
                  <g
                    key={medida.key}
                    className={`silhouette-hotspot-group ${isSelected ? "active" : ""}`}
                    onClick={() => setPontoAtivoKey(medida.key)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Alvo invisível amplo para toque */}
                    <circle cx={posX} cy={posY} r="28" fill="transparent" />

                    {/* Halo de Pulso */}
                    <circle
                      cx={posX}
                      cy={posY}
                      r={isSelected ? "16" : "11"}
                      fill={medida.diffColor}
                      opacity={isSelected ? "0.45" : "0.25"}
                      className="hotspot-pulse"
                    />

                    {/* Círculo do Ponto */}
                    <circle
                      cx={posX}
                      cy={posY}
                      r={isSelected ? "8" : "6"}
                      fill="var(--surface)"
                      stroke={medida.diffColor}
                      strokeWidth={isSelected ? "3.5" : "2.5"}
                    />

                    {isSelected && (
                      <circle cx={posX} cy={posY} r="3.5" fill={medida.diffColor} />
                    )}

                    {/* Badge Flutuante com Medida + Delta de Evolução */}
                    <g transform={`translate(${posX > 160 ? posX + 16 : posX - 92}, ${posY - 14})`}>
                      <rect
                        width="76"
                        height="26"
                        rx="13"
                        fill="var(--surface)"
                        stroke={isSelected ? medida.diffColor : "var(--border)"}
                        strokeWidth={isSelected ? "1.8" : "1"}
                        filter="drop-shadow(0 2px 8px rgba(0,0,0,0.15))"
                      />
                      <text
                        x="38"
                        y="17"
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="800"
                        fill="var(--text-main)"
                      >
                        {medida.valAtivo ? `${medida.valAtivo} ${medida.unit}` : "--"}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="silhueta-viewport-footer">
            <span className="silhueta-morph-caption">
              ✨ A silhueta se deforma dinamicamente conforme as medidas evoluem.
            </span>
          </div>
        </div>

        {/* Painel Lateral: Métricas Detalhadas, Gráfico de Evolução da Medida & Edição */}
        <div className="silhueta-details-panel">
          {medidaSelecionada && (
            <div className="focused-measure-card animate-fade-in">
              <div className="focused-card-top">
                <div className="focused-badge-label">
                  <span className="focused-dot" style={{ backgroundColor: medidaSelecionada.diffColor }} />
                  <strong>{medidaSelecionada.label}</strong>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="focused-desc-muted">{medidaSelecionada.desc}</span>
                  <button
                    type="button"
                    className="btn-quick-edit-measure"
                    onClick={() => setModalEditOpen(true)}
                    title="Editar esta medida"
                  >
                    <Edit3 size={13} />
                    <span>Editar</span>
                  </button>
                </div>
              </div>

              <div className="focused-metrics-grid">
                <div className="focused-metric-box">
                  <span className="focused-metric-title">1ª Consulta (Base)</span>
                  <strong className="focused-metric-val">
                    {medidaSelecionada.valBase ? `${medidaSelecionada.valBase} ${medidaSelecionada.unit}` : "Sem registro"}
                  </strong>
                  <span className="focused-metric-date">{consultaBase ? formatDate(consultaBase.data_consulta) : ""}</span>
                </div>

                <div className="focused-metric-divider">
                  <ArrowRight size={18} color="var(--text-muted)" />
                </div>

                <div className="focused-metric-box highlight-box">
                  <span className="focused-metric-title">Consulta Atual</span>
                  <strong className="focused-metric-val" style={{ color: "var(--text-main)" }}>
                    {medidaSelecionada.valAtivo ? `${medidaSelecionada.valAtivo} ${medidaSelecionada.unit}` : "Sem registro"}
                  </strong>
                  <span className="focused-metric-date">{consultaAtiva ? formatDate(consultaAtiva.data_consulta) : ""}</span>
                </div>

                <div className="focused-metric-box variation-box">
                  <span className="focused-metric-title">Variação no Período</span>
                  <div className="focused-variation-wrap" style={{ color: medidaSelecionada.diffColor }}>
                    <medidaSelecionada.icon size={18} />
                    <strong className="focused-variation-val">{medidaSelecionada.diffStr}</strong>
                  </div>
                  <span className="focused-metric-date">
                    {medidaSelecionada.diff && Math.abs(medidaSelecionada.diff) > 0
                      ? (medidaSelecionada.isGood ? "Evolução Positiva" : "Variação Registrada")
                      : "Sem alteração"}
                  </span>
                </div>
              </div>

              {/* Mini Histórico Cronológico de Evolução da Medida */}
              {historicoMedidaFoco.length > 1 && (
                <div className="measure-timeline-strip">
                  <span className="timeline-strip-title">Evolução por Consulta:</span>
                  <div className="timeline-strip-items">
                    {historicoMedidaFoco.map((item, idx) => {
                      const isCurrent = idx === indiceConsultaAtiva;
                      const diffFirst = (item.valor - historicoMedidaFoco[0].valor).toFixed(1);
                      return (
                        <div
                          key={item.idx}
                          className={`strip-item ${isCurrent ? "active" : ""}`}
                          onClick={() => setIndiceConsultaAtiva(idx)}
                          style={{ cursor: "pointer" }}
                        >
                          <span className="strip-c-label">C{item.idx}</span>
                          <strong className="strip-val">{item.valor} cm</strong>
                          {idx > 0 && (
                            <span className={`strip-diff ${parseFloat(diffFirst) <= 0 ? "loss" : "gain"}`}>
                              {parseFloat(diffFirst) > 0 ? `+${diffFirst}` : diffFirst}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Grid de Circunferências */}
          <div className="all-measures-grid-section">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h4 className="all-measures-title">Painel de Circunferências Antropométricas</h4>
              <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                Consulta #{indiceConsultaAtiva + 1} ({consultaAtiva ? formatDate(consultaAtiva.data_consulta) : ""})
              </span>
            </div>
            
            <div className="measures-cards-stack">
              {evolucaoMedidas.map((medida) => {
                const isSelected = medida.key === pontoAtivoKey;
                return (
                  <div
                    key={medida.key}
                    className={`measure-row-item ${isSelected ? "selected" : ""}`}
                    onClick={() => setPontoAtivoKey(medida.key)}
                  >
                    <div className="measure-item-left">
                      <span className="measure-item-dot" style={{ backgroundColor: medida.diffColor }} />
                      <div>
                        <strong className="measure-item-name">{medida.label}</strong>
                        <span className="measure-item-sub">
                          Base: {medida.valBase ? `${medida.valBase} ${medida.unit}` : "--"}
                        </span>
                      </div>
                    </div>

                    <div className="measure-item-right">
                      <strong className="measure-item-current">
                        {medida.valAtivo ? `${medida.valAtivo} ${medida.unit}` : "--"}
                      </strong>
                      <span
                        className="measure-item-diff-badge"
                        style={{
                          backgroundColor: `${medida.diffColor}18`,
                          color: medida.diffColor,
                          borderColor: `${medida.diffColor}35`
                        }}
                      >
                        {medida.diffStr}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Informações Extras de Composição */}
          <div className="silhueta-extra-metrics-row">
            <div className="extra-metric-card">
              <span className="extra-metric-lbl">% Gordura Corporal</span>
              <strong className="extra-metric-num">
                {consultaAtiva?.percentual_gordura ? `${consultaAtiva.percentual_gordura}%` : "--"}
              </strong>
              {consultaBase?.percentual_gordura && consultaAtiva?.percentual_gordura && (
                <span className="extra-metric-delta" style={{ color: "#10b981" }}>
                  {(parseFloat(consultaAtiva.percentual_gordura) - parseFloat(consultaBase.percentual_gordura)).toFixed(1)}% vs 1ª Consulta
                </span>
              )}
            </div>

            <div className="extra-metric-card">
              <span className="extra-metric-lbl">Peso Corporal</span>
              <strong className="extra-metric-num">
                {consultaAtiva?.peso ? `${consultaAtiva.peso} kg` : "--"}
              </strong>
              {consultaBase?.peso && consultaAtiva?.peso && (
                <span className="extra-metric-delta" style={{ color: "var(--primary)" }}>
                  {(parseFloat(consultaAtiva.peso) - parseFloat(consultaBase.peso) > 0 ? "+" : "") +
                    (parseFloat(consultaAtiva.peso) - parseFloat(consultaBase.peso)).toFixed(1)} kg no período
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição Direta de Todas as Medidas */}
      {modalEditOpen && (
        <div className="modal-overlay-custom animate-fade-in" onClick={() => setModalEditOpen(false)}>
          <div className="modal-content-card animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="modal-header-custom">
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div className="modal-icon-badge">
                  <Ruler size={20} color="var(--primary)" />
                </div>
                <div>
                  <h2 className="modal-title-heading">
                    Editar Medidas · Consulta #{indiceConsultaAtiva + 1}
                  </h2>
                  <span className="modal-subtitle-text">
                    {formatDate(consultaAtiva?.data_consulta)} · {paciente.nome}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setModalEditOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarEdicaoMedidas} className="modal-form-body">
              {editError && (
                <div className="feedback-alert error animate-shake">
                  <Info size={16} />
                  <span>{editError}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="feedback-alert success animate-fade-in">
                  <CheckCircle2 size={16} />
                  <span>Medidas salvas com sucesso!</span>
                </div>
              )}

              <div className="form-section-block">
                <div className="form-section-header">
                  <div className="form-section-icon">
                    <Scale size={15} />
                  </div>
                  <span className="form-section-title">Peso & Composição</span>
                </div>

                <div className="form-grid-2">
                  <div className="form-group-field">
                    <label className="form-label">Peso Atual (kg)</label>
                    <div className="input-with-icon">
                      <Scale size={17} className="input-icon-left" />
                      <input
                        type="number"
                        step="0.1"
                        className="styled-input-field"
                        placeholder="Ex: 64.5"
                        value={editForm.peso}
                        onChange={(e) => setEditForm({ ...editForm, peso: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group-field">
                    <label className="form-label">% Gordura Corporal</label>
                    <div className="input-with-icon">
                      <HeartPulse size={17} className="input-icon-left" />
                      <input
                        type="number"
                        step="0.1"
                        className="styled-input-field"
                        placeholder="Ex: 20.5"
                        value={editForm.percentual_gordura}
                        onChange={(e) => setEditForm({ ...editForm, percentual_gordura: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section-block" style={{ marginTop: "1rem" }}>
                <div className="form-section-header">
                  <div className="form-section-icon">
                    <Ruler size={15} />
                  </div>
                  <span className="form-section-title">Circunferências Anatômicas (cm)</span>
                </div>

                <div className="form-grid-2">
                  <div className="form-group-field">
                    <label className="form-label">Tórax / Peitoral (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="styled-input-field"
                      placeholder="Ex: 94.5"
                      value={editForm.torax}
                      onChange={(e) => setEditForm({ ...editForm, torax: e.target.value })}
                    />
                  </div>

                  <div className="form-group-field">
                    <label className="form-label">Braço / Bíceps (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="styled-input-field"
                      placeholder="Ex: 31.5"
                      value={editForm.braco}
                      onChange={(e) => setEditForm({ ...editForm, braco: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginTop: "0.75rem" }}>
                  <div className="form-group-field">
                    <label className="form-label">Cintura / Abdômen (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="styled-input-field"
                      placeholder="Ex: 68.5"
                      value={editForm.cintura}
                      onChange={(e) => setEditForm({ ...editForm, cintura: e.target.value })}
                    />
                  </div>

                  <div className="form-group-field">
                    <label className="form-label">Quadril (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="styled-input-field"
                      placeholder="Ex: 97.0"
                      value={editForm.quadril}
                      onChange={(e) => setEditForm({ ...editForm, quadril: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginTop: "0.75rem" }}>
                  <div className="form-group-field">
                    <label className="form-label">Coxa (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="styled-input-field"
                      placeholder="Ex: 58.5"
                      value={editForm.coxa}
                      onChange={(e) => setEditForm({ ...editForm, coxa: e.target.value })}
                    />
                  </div>

                  <div className="form-group-field">
                    <label className="form-label">Panturrilha (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="styled-input-field"
                      placeholder="Ex: 37.0"
                      value={editForm.panturrilha}
                      onChange={(e) => setEditForm({ ...editForm, panturrilha: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions-footer" style={{ marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setModalEditOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={savingMedidas}
                >
                  <Save size={16} />
                  <span>{savingMedidas ? "Salvando..." : "Salvar Medidas"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
