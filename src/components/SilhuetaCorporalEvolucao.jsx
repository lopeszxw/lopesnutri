import React, { useState, useMemo } from "react";
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
  Info
} from "lucide-react";
import { formatDate } from "../utils/helpers";

// Definição dos pontos anatômicos mapeados sobre a silhueta exata (viewBox 330 x 700)
const PONTOS_ANATOMICOS = [
  {
    key: "torax",
    label: "Tórax / Peitoral",
    unit: "cm",
    desc: "Perímetro torácico e peitoral",
    xMasc: 50,
    yMasc: 27.5,
    xFem: 50,
    yFem: 29.5,
    goalType: "muscle"
  },
  {
    key: "braco",
    label: "Braço / Bíceps",
    unit: "cm",
    desc: "Perímetro do braço contraído/relaxado",
    xMasc: 19,
    yMasc: 35,
    xFem: 20,
    yFem: 35,
    goalType: "muscle"
  },
  {
    key: "cintura",
    label: "Cintura / Abdômen",
    unit: "cm",
    desc: "Circunferência na altura da cicatriz umbilical",
    xMasc: 50,
    yMasc: 42,
    xFem: 50,
    yFem: 41,
    goalType: "reduction"
  },
  {
    key: "quadril",
    label: "Quadril",
    unit: "cm",
    desc: "Maior perímetro da região glútea",
    xMasc: 50,
    yMasc: 52,
    xFem: 50,
    yFem: 52,
    goalType: "reduction"
  },
  {
    key: "coxa",
    label: "Coxa",
    unit: "cm",
    desc: "Perímetro medial da coxa",
    xMasc: 38,
    yMasc: 66,
    xFem: 38,
    yFem: 66,
    goalType: "muscle"
  },
  {
    key: "panturrilha",
    label: "Panturrilha",
    unit: "cm",
    desc: "Maior circunferência da perna",
    xMasc: 37,
    yMasc: 85,
    xFem: 37,
    yFem: 85,
    goalType: "muscle"
  }
];

export default function SilhuetaCorporalEvolucao({ paciente = {}, consultas = [] }) {
  // Ordena consultas por data crescente
  const consultasOrdenadas = useMemo(() => {
    return [...(consultas || [])]
      .filter((c) => c && c.data_consulta)
      .sort((a, b) => new Date(a.data_consulta) - new Date(b.data_consulta));
  }, [consultas]);

  const [indiceConsultaBase, setIndiceConsultaBase] = useState(0);
  const [indiceConsultaAtiva, setIndiceConsultaAtiva] = useState(
    consultasOrdenadas.length > 0 ? consultasOrdenadas.length - 1 : 0
  );
  const [pontoAtivoKey, setPontoAtivoKey] = useState("cintura");
  const [sexoVisualizacao, setSexoVisualizacao] = useState(
    (paciente.sexo || "").toLowerCase().includes("fem") ? "Feminino" : "Masculino"
  );

  const consultaBase = consultasOrdenadas[indiceConsultaBase] || null;
  const consultaAtiva = consultasOrdenadas[indiceConsultaAtiva] || null;
  const isFeminino = sexoVisualizacao === "Feminino";

  // Cálculo de evolução das medidas corporais
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

      const x = isFeminino ? ponto.xFem : ponto.xMasc;
      const y = isFeminino ? ponto.yFem : ponto.yMasc;

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
  }, [consultaBase, consultaAtiva, isFeminino]);

  const medidaSelecionada = useMemo(() => {
    return evolucaoMedidas.find((m) => m.key === pontoAtivoKey) || evolucaoMedidas[0];
  }, [evolucaoMedidas, pontoAtivoKey]);

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
              Visualização anatômica oficial da evolução de circunferências e composição corporal
            </span>
          </div>
        </div>

        {/* Seletor de Consultas */}
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
        </div>
      </div>

      {/* Grid Principal */}
      <div className="silhueta-main-grid">
        {/* Painel da Silhueta */}
        <div className="silhueta-viewport-container">
          <div className="silhueta-viewport-header">
            <div className="silhueta-gender-toggle">
              <button
                type="button"
                className={`gender-pill-btn ${!isFeminino ? "active" : ""}`}
                onClick={() => setSexoVisualizacao("Masculino")}
              >
                Masculino
              </button>
              <button
                type="button"
                className={`gender-pill-btn ${isFeminino ? "active" : ""}`}
                onClick={() => setSexoVisualizacao("Feminino")}
              >
                Feminino
              </button>
            </div>
            <span className="silhueta-click-hint">Clique nos pontos para detalhes</span>
          </div>

          <div className="silhueta-canvas-wrapper">
            <svg
              viewBox="0 0 330 700"
              className="silhueta-vector-svg"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <filter id="silhouetteGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(16, 185, 129, 0.35)" />
                </filter>
              </defs>

              {/* Silhueta Oficial com Alta Definição */}
              <image
                href={isFeminino ? "/silhueta-feminina.png" : "/silhueta-masculina.png"}
                x="0"
                y="0"
                width="330"
                height="700"
                filter="url(#silhouetteGlow)"
                className="exact-user-silhouette-image"
              />

              {/* Linha Central Guia Sutil */}
              <line x1="165" y1="120" x2="165" y2="400" stroke="var(--primary)" strokeDasharray="3 3" strokeWidth="1" opacity="0.35" />

              {/* Hotspots Anatômicos Interativos */}
              {evolucaoMedidas.map((medida) => {
                const isSelected = medida.key === pontoAtivoKey;
                const posX = (medida.x / 100) * 330;
                const posY = (medida.y / 100) * 700;

                return (
                  <g
                    key={medida.key}
                    className={`silhouette-hotspot-group ${isSelected ? "active" : ""}`}
                    onClick={() => setPontoAtivoKey(medida.key)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Alvo invisível amplo para toque */}
                    <circle cx={posX} cy={posY} r="26" fill="transparent" />

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

                    {/* Badge Flutuante */}
                    <g transform={`translate(${posX > 165 ? posX + 14 : posX - 76}, ${posY - 14})`}>
                      <rect
                        width="62"
                        height="26"
                        rx="13"
                        fill="var(--surface)"
                        stroke={isSelected ? medida.diffColor : "var(--border)"}
                        strokeWidth={isSelected ? "1.8" : "1"}
                        filter="drop-shadow(0 2px 8px rgba(0,0,0,0.15))"
                      />
                      <text
                        x="31"
                        y="17"
                        textAnchor="middle"
                        fontSize="10.5"
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
        </div>

        {/* Painel Lateral: Métricas Detalhadas */}
        <div className="silhueta-details-panel">
          {medidaSelecionada && (
            <div className="focused-measure-card animate-fade-in">
              <div className="focused-card-top">
                <div className="focused-badge-label">
                  <span className="focused-dot" style={{ backgroundColor: medidaSelecionada.diffColor }} />
                  <strong>{medidaSelecionada.label}</strong>
                </div>
                <span className="focused-desc-muted">{medidaSelecionada.desc}</span>
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
                  <span className="focused-metric-title">Variação Total</span>
                  <div className="focused-variation-wrap" style={{ color: medidaSelecionada.diffColor }}>
                    <medidaSelecionada.icon size={18} />
                    <strong className="focused-variation-val">{medidaSelecionada.diffStr}</strong>
                  </div>
                  <span className="focused-metric-date">
                    {medidaSelecionada.isGood ? "Evolução Positiva" : "Necessita Atenção"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Grid de Circunferências */}
          <div className="all-measures-grid-section">
            <h4 className="all-measures-title">Painel de Circunferências Antropométricas</h4>
            
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
    </div>
  );
}
