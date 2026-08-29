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

// Definição dos pontos anatômicos corporais mapeados na silhueta SVG (coordenadas percentuais x, y)
const PONTOS_ANATOMICOS = [
  {
    key: "torax",
    label: "Tórax / Peitoral",
    unit: "cm",
    desc: "Perímetro torácico e peitoral",
    xMasc: 50,
    yMasc: 28,
    xFem: 50,
    yFem: 29,
    goalType: "muscle" // ganho é positivo
  },
  {
    key: "braco",
    label: "Braço / Bíceps",
    unit: "cm",
    desc: "Perímetro do braço contraído/relaxado",
    xMasc: 23,
    yMasc: 34,
    xFem: 24,
    yFem: 34,
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
    goalType: "reduction" // redução é positivo
  },
  {
    key: "quadril",
    label: "Quadril",
    unit: "cm",
    desc: "Maior perímetro da região glútea",
    xMasc: 50,
    yMasc: 53,
    xFem: 50,
    yFem: 53,
    goalType: "reduction"
  },
  {
    key: "coxa",
    label: "Coxa",
    unit: "cm",
    desc: "Perímetro medial da coxa",
    xMasc: 38,
    yMasc: 66,
    xFem: 37,
    yFem: 66,
    goalType: "muscle"
  },
  {
    key: "panturrilha",
    label: "Panturrilha",
    unit: "cm",
    desc: "Maior circunferência da perna",
    xMasc: 36,
    yMasc: 84,
    xFem: 36,
    yFem: 84,
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

  const [indiceConsultaBase, setIndiceConsultaBase] = useState(0); // Geralmente a 1ª consulta
  const [indiceConsultaAtiva, setIndiceConsultaAtiva] = useState(
    consultasOrdenadas.length > 0 ? consultasOrdenadas.length - 1 : 0
  );
  const [pontoAtivoKey, setPontoAtivoKey] = useState("cintura");

  // Consulta inicial e consulta comparada
  const consultaBase = consultasOrdenadas[indiceConsultaBase] || null;
  const consultaAtiva = consultasOrdenadas[indiceConsultaAtiva] || null;

  const isFeminino = (paciente.sexo || "").toLowerCase().includes("fem");

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
          // Para cintura e quadril: perda é ótimo
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
          // Para braço, coxa, tórax: ganho ou manutenção é ótimo
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

  // Medida selecionada atualmente em destaque
  const medidaSelecionada = useMemo(() => {
    return evolucaoMedidas.find((m) => m.key === pontoAtivoKey) || evolucaoMedidas[0];
  }, [evolucaoMedidas, pontoAtivoKey]);

  if (consultasOrdenadas.length === 0) {
    return null;
  }

  return (
    <div className="silhueta-evolucao-card animate-fade-in">
      {/* Cabeçalho da Seção */}
      <div className="silhueta-card-header">
        <div className="profile-card-title" style={{ marginBottom: 0 }}>
          <div className="icon-badge-round" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
            <Activity size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Mapeamento Antropométrico & Silhueta Corporal</h3>
            <span className="chart-subtitle">
              Visualização anatômica interativa da evolução de circunferências e composição corporal
            </span>
          </div>
        </div>

        {/* Seletor de Comparativo / Consultas */}
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

      {/* Grid Principal: Silhueta Interativa à Esquerda + Painel de Métricas e Evolução à Direita */}
      <div className="silhueta-main-grid">
        {/* Painel da Silhueta Corporal com Hotspots */}
        <div className="silhueta-viewport-container">
          <div className="silhueta-viewport-header">
            <span className="silhueta-model-badge">
              Silhueta {isFeminino ? "Feminina" : "Masculina"} · {paciente.nome || "Paciente"}
            </span>
            <span className="silhueta-click-hint">Clique nos pontos para detalhes</span>
          </div>

          <div className="silhueta-canvas-wrapper">
            {/* Silhueta Anatômica SVG Vetorial Elegante */}
            <svg
              viewBox="0 0 280 480"
              className="silhueta-vector-svg"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Gradiente do Corpo */}
                <linearGradient id="bodyMeshGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.32" />
                  <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.08" />
                </linearGradient>

                <filter id="silhouetteGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(16, 185, 129, 0.25)" />
                </filter>
              </defs>

              {/* Traçado Anatômico do Corpo */}
              {isFeminino ? (
                // Silhueta Feminina
                <g className="body-silhouette-shape" filter="url(#silhouetteGlow)">
                  {/* Cabeça e Pescoço */}
                  <ellipse cx="140" cy="42" rx="22" ry="26" fill="url(#bodyMeshGradient)" stroke="var(--primary)" strokeWidth="2.2" />
                  <path d="M 133 66 L 133 80 L 147 80 L 147 66" fill="url(#bodyMeshGradient)" stroke="var(--primary)" strokeWidth="2" />
                  
                  {/* Tronco Feminino (Ampulheta Suave) */}
                  <path
                    d="M 120 82 
                       C 95 85, 78 105, 68 135 
                       C 60 160, 56 195, 52 235
                       C 50 250, 56 255, 64 252
                       C 72 245, 82 205, 92 170
                       C 98 150, 105 130, 114 135
                       C 118 160, 120 185, 122 200
                       C 114 220, 106 242, 102 265
                       C 96 300, 104 330, 108 360
                       C 112 390, 110 425, 112 455
                       C 114 465, 124 465, 126 455
                       C 130 420, 132 375, 136 325
                       L 140 280
                       L 144 325
                       C 148 375, 150 420, 154 455
                       C 156 465, 166 465, 168 455
                       C 170 425, 168 390, 172 360
                       C 176 330, 184 300, 178 265
                       C 174 242, 166 220, 158 200
                       C 160 185, 162 160, 166 135
                       C 175 130, 182 150, 188 170
                       C 198 205, 208 245, 216 252
                       C 224 255, 230 250, 228 235
                       C 224 195, 220 160, 212 135
                       C 202 105, 185 85, 160 82
                       Z"
                    fill="url(#bodyMeshGradient)"
                    stroke="var(--primary)"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                  />
                </g>
              ) : (
                // Silhueta Masculina (Ombros Largos em V)
                <g className="body-silhouette-shape" filter="url(#silhouetteGlow)">
                  {/* Cabeça e Pescoço */}
                  <ellipse cx="140" cy="40" rx="23" ry="28" fill="url(#bodyMeshGradient)" stroke="var(--primary)" strokeWidth="2.2" />
                  <path d="M 132 66 L 132 82 L 148 82 L 148 66" fill="url(#bodyMeshGradient)" stroke="var(--primary)" strokeWidth="2" />

                  {/* Tronco Masculino */}
                  <path
                    d="M 115 84 
                       C 85 88, 68 110, 56 142 
                       C 48 168, 44 205, 40 245
                       C 38 258, 46 262, 54 256
                       C 62 248, 74 205, 84 165
                       C 92 145, 102 128, 114 135
                       C 118 165, 122 195, 124 210
                       C 118 230, 112 250, 108 275
                       C 102 310, 108 340, 112 370
                       C 116 400, 114 430, 116 458
                       C 118 468, 128 468, 130 458
                       C 134 425, 135 380, 138 330
                       L 140 285
                       L 142 330
                       C 145 380, 146 425, 150 458
                       C 152 468, 162 468, 164 458
                       C 166 430, 164 400, 168 370
                       C 172 340, 178 310, 172 275
                       C 168 250, 162 230, 156 210
                       C 158 195, 162 165, 166 135
                       C 178 128, 188 145, 196 165
                       C 206 205, 218 248, 226 256
                       C 234 262, 242 258, 240 245
                       C 236 205, 232 168, 224 142
                       C 212 110, 195 88, 165 84
                       Z"
                    fill="url(#bodyMeshGradient)"
                    stroke="var(--primary)"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                  />
                </g>
              )}

              {/* Linhas Anatômicas Internas Sutis */}
              <line x1="140" y1="88" x2="140" y2="275" stroke="var(--primary)" strokeDasharray="3 3" strokeWidth="1" opacity="0.3" />
              <line x1="105" y1="135" x2="175" y2="135" stroke="var(--primary)" strokeDasharray="2 2" strokeWidth="1" opacity="0.25" />
              <line x1="116" y1="200" x2="164" y2="200" stroke="var(--primary)" strokeDasharray="2 2" strokeWidth="1" opacity="0.25" />
              <line x1="108" y1="255" x2="172" y2="255" stroke="var(--primary)" strokeDasharray="2 2" strokeWidth="1" opacity="0.25" />

              {/* Hotspots Anatômicos Pulsantes com Tooltips Integrados */}
              {evolucaoMedidas.map((medida) => {
                const isSelected = medida.key === pontoAtivoKey;
                const posX = (medida.x / 100) * 280;
                const posY = (medida.y / 100) * 480;

                return (
                  <g
                    key={medida.key}
                    className={`silhouette-hotspot-group ${isSelected ? "active" : ""}`}
                    onClick={() => setPontoAtivoKey(medida.key)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Alvo invisível amplo para clique fácil */}
                    <circle cx={posX} cy={posY} r="22" fill="transparent" />

                    {/* Halo de Pulso */}
                    <circle
                      cx={posX}
                      cy={posY}
                      r={isSelected ? "14" : "10"}
                      fill={medida.diffColor}
                      opacity={isSelected ? "0.4" : "0.2"}
                      className="hotspot-pulse"
                    />

                    {/* Círculo do Nó */}
                    <circle
                      cx={posX}
                      cy={posY}
                      r={isSelected ? "7" : "5"}
                      fill="var(--surface)"
                      stroke={medida.diffColor}
                      strokeWidth={isSelected ? "3" : "2"}
                    />

                    {/* Ponto Central */}
                    {isSelected && (
                      <circle cx={posX} cy={posY} r="3" fill={medida.diffColor} />
                    )}

                    {/* Badge Flutuante ao Lado do Ponto */}
                    <g transform={`translate(${posX > 140 ? posX + 12 : posX - 68}, ${posY - 12})`}>
                      <rect
                        width="56"
                        height="24"
                        rx="12"
                        fill="var(--surface)"
                        stroke={isSelected ? medida.diffColor : "var(--border)"}
                        strokeWidth={isSelected ? "1.5" : "1"}
                        filter="drop-shadow(0 2px 6px rgba(0,0,0,0.12))"
                      />
                      <text
                        x="28"
                        y="15"
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
        </div>

        {/* Painel Lateral: Métricas Detalhadas & Comparativo Evolutivo */}
        <div className="silhueta-details-panel">
          {/* Card da Medida Ativa em Foco */}
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

          {/* Grid de Todas as Circunferências Corporais */}
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

          {/* Informações Extras de Composição (Gordura & Peso) */}
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
