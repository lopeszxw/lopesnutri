import React, { useState, useMemo } from "react";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Scale,
  Calendar,
  Sparkles,
  Target,
  Activity,
  Flame,
  CheckCircle2
} from "lucide-react";
import { safeDateString, formatDate } from "../utils/helpers";

/**
 * Gera curva Bézier ultra-suave (Spline) passando pelos pontos
 */
function getSmoothPath(coordinates) {
  if (!coordinates || coordinates.length === 0) return "";
  if (coordinates.length === 1) return `M ${coordinates[0].x} ${coordinates[0].y}`;
  
  if (coordinates.length === 2) {
    const [p0, p1] = coordinates;
    const dx = p1.x - p0.x;
    return `M ${p0.x} ${p0.y} C ${p0.x + dx * 0.4} ${p0.y}, ${p1.x - dx * 0.4} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  let d = `M ${coordinates[0].x} ${coordinates[0].y}`;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const p0 = coordinates[i === 0 ? 0 : i - 1];
    const p1 = coordinates[i];
    const p2 = coordinates[i + 1];
    const p3 = coordinates[i + 2 < coordinates.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export default function EvolucaoPesoChart({ consultas = [] }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // 1. Construir lista cronológica de dados de peso a partir das consultas
  const timelineData = useMemo(() => {
    const consultasComPeso = (consultas || [])
      .filter((c) => c && c.peso !== null && c.peso !== undefined && !isNaN(parseFloat(c.peso)))
      .sort((a, b) => new Date(a.data_consulta) - new Date(b.data_consulta));

    return consultasComPeso.map((c, index) => ({
      id: c.id || `consulta-${index}`,
      data: c.data_consulta ? safeDateString(c.data_consulta) : "",
      peso: parseFloat(c.peso),
      label: `Consulta ${index + 1}`,
      cintura: c.cintura,
      quadril: c.quadril,
      gordura: c.percentual_gordura
    }));
  }, [consultas]);

  // 2. Análise de métricas de evolução
  const metrics = useMemo(() => {
    if (timelineData.length === 0) return null;

    const firstWeight = timelineData[0].peso;
    const latestWeight = timelineData[timelineData.length - 1].peso;
    const diff = latestWeight - firstWeight;
    const percentDiff = firstWeight > 0 ? (diff / firstWeight) * 100 : 0;

    const minWeight = Math.min(...timelineData.map((d) => d.peso));
    const maxWeight = Math.max(...timelineData.map((d) => d.peso));

    if (timelineData.length === 1) {
      return {
        firstWeight: firstWeight.toFixed(1),
        latestWeight: latestWeight.toFixed(1),
        diff: "0.0",
        diffAbs: "0.0",
        percentDiff: "0.0",
        isLoss: false,
        isGain: false,
        isStable: true,
        isSingle: true,
        minWeight: minWeight.toFixed(1),
        maxWeight: maxWeight.toFixed(1),
        status: "Ponto de Partida",
        statusClass: "neutral",
        totalPoints: 1
      };
    }

    let status = "Peso Estável";
    let statusClass = "neutral";
    if (diff < -0.2) {
      status = "Emagrecimento Saudável";
      statusClass = "loss";
    } else if (diff > 0.2) {
      status = "Ganho de Peso / Massa";
      statusClass = "gain";
    }

    return {
      firstWeight: firstWeight.toFixed(1),
      latestWeight: latestWeight.toFixed(1),
      diff: diff.toFixed(1),
      diffAbs: Math.abs(diff).toFixed(1),
      percentDiff: Math.abs(percentDiff).toFixed(1),
      isLoss: diff < -0.2,
      isGain: diff > 0.2,
      isStable: Math.abs(diff) <= 0.2,
      isSingle: false,
      minWeight: minWeight.toFixed(1),
      maxWeight: maxWeight.toFixed(1),
      status,
      statusClass,
      totalPoints: timelineData.length
    };
  }, [timelineData]);

  // 3. Cálculos de Coordenadas SVG
  const chartConfig = useMemo(() => {
    if (timelineData.length === 0) return null;

    const width = 740;
    const height = 240;
    const padding = { top: 30, right: 45, bottom: 40, left: 60 };

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const pesos = timelineData.map((d) => d.peso);
    let minVal = Math.min(...pesos);
    let maxVal = Math.max(...pesos);

    if (minVal === maxVal) {
      minVal -= 2;
      maxVal += 2;
    } else {
      const range = maxVal - minVal;
      minVal -= range * 0.2;
      maxVal += range * 0.2;
    }

    const getX = (index) => {
      if (timelineData.length === 1) return padding.left + plotWidth / 2;
      return padding.left + (index / (timelineData.length - 1)) * plotWidth;
    };

    const getY = (val) => {
      const normalized = (val - minVal) / (maxVal - minVal);
      return padding.top + plotHeight - normalized * plotHeight;
    };

    const coordinates = timelineData.map((d, i) => ({
      ...d,
      x: getX(i),
      y: getY(d.peso)
    }));

    let linePath = "";
    let areaPath = "";

    if (timelineData.length >= 2) {
      linePath = getSmoothPath(coordinates);

      const firstPt = coordinates[0];
      const lastPt = coordinates[coordinates.length - 1];
      const bottomY = padding.top + plotHeight;

      areaPath = `
        ${linePath} 
        L ${lastPt.x} ${bottomY} 
        L ${firstPt.x} ${bottomY} 
        Z
      `;
    }

    // Linhas de Grade Y (4 linhas niveladas)
    const gridCount = 4;
    const gridLines = [];
    for (let i = 0; i <= gridCount; i++) {
      const val = minVal + (i / gridCount) * (maxVal - minVal);
      const y = getY(val);
      gridLines.push({ y, val: val.toFixed(1) });
    }

    return {
      width,
      height,
      padding,
      plotWidth,
      plotHeight,
      coordinates,
      linePath,
      areaPath,
      gridLines,
      bottomY: padding.top + plotHeight
    };
  }, [timelineData]);

  // 4. Posicionamento Inteligente do Tooltip (nunca vaza da tela / nunca corta)
  const tooltipStyle = useMemo(() => {
    if (!hoveredPoint || !chartConfig) return null;
    const xPct = (hoveredPoint.x / chartConfig.width) * 100;
    const yPct = (hoveredPoint.y / chartConfig.height) * 100;

    let transformX = "-50%";
    let arrowAlign = "center";
    if (xPct > 70) {
      transformX = "-88%";
      arrowAlign = "right";
    } else if (xPct < 30) {
      transformX = "-12%";
      arrowAlign = "left";
    }

    let transformY = "calc(-100% - 15px)";
    let isFlippedBottom = false;
    if (yPct < 35) {
      transformY = "18px";
      isFlippedBottom = true;
    }

    return {
      left: `${xPct}%`,
      top: `${yPct}%`,
      transform: `translate(${transformX}, ${transformY})`,
      arrowAlign,
      isFlippedBottom
    };
  }, [hoveredPoint, chartConfig]);

  if (!metrics || timelineData.length === 0) {
    return (
      <div className="profile-card chart-card-wrapper animate-fade-in">
        <div className="card-header-flex">
          <div className="profile-card-title" style={{ marginBottom: 0 }}>
            <Scale size={18} color="var(--primary)" />
            <div>
              <h3>Evolução do Peso Corporal</h3>
              <span className="chart-subtitle">Histórico de pesagem e composição corporal</span>
            </div>
          </div>
        </div>
        <div className="empty-state-box" style={{ padding: "2.5rem 1.5rem" }}>
          <Scale size={36} className="empty-icon-muted" />
          <h4 style={{ margin: "0.5rem 0 0.25rem" }}>Sem pesagens registradas</h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Registre as consultas antropométricas para visualizar a curva de evolução do paciente.
          </p>
        </div>
      </div>
    );
  }

  const isLossTheme = metrics.isLoss;
  const isGainTheme = metrics.isGain;
  const mainStrokeColor = isLossTheme ? "#10b981" : isGainTheme ? "#3b82f6" : "var(--primary)";

  return (
    <div className="profile-card chart-card-wrapper animate-fade-in">
      {/* Header do Card de Evolução */}
      <div className="card-header-flex" style={{ alignItems: "center", marginBottom: "1.25rem" }}>
        <div className="profile-card-title" style={{ marginBottom: 0 }}>
          <div className="icon-badge-round" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
            <Scale size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Evolução do Peso Corporal</h3>
            <span className="chart-subtitle">
              Acompanhamento cronológico de emagrecimento e composição corporal
            </span>
          </div>
        </div>

        {/* Badge Resumo de Evolução */}
        <div className={`evolution-trend-badge ${isLossTheme ? "trend-loss" : isGainTheme ? "trend-gain" : "trend-stable"}`}>
          {isLossTheme && <TrendingDown size={16} />}
          {isGainTheme && <TrendingUp size={16} />}
          {metrics.isStable && <Minus size={16} />}
          <span>
            {metrics.isSingle && `1ª Consulta (Peso: ${metrics.latestWeight} kg)`}
            {!metrics.isSingle && metrics.isLoss && `Redução de ${metrics.diffAbs} kg (-${metrics.percentDiff}%)`}
            {!metrics.isSingle && metrics.isGain && `Aumento de +${metrics.diffAbs} kg (+${metrics.percentDiff}%)`}
            {!metrics.isSingle && metrics.isStable && `Peso Estável (${metrics.diff} kg)`}
          </span>
        </div>
      </div>

      {/* Métricas Rápidas no Topo do Gráfico */}
      <div className="chart-stats-summary-row">
        <div className="chart-stat-box">
          <div className="stat-icon-micro">
            <Calendar size={14} />
          </div>
          <div>
            <span className="chart-stat-label">Peso Inicial</span>
            <strong className="chart-stat-val">{metrics.firstWeight} <span className="stat-unit">kg</span></strong>
          </div>
        </div>

        <div className="chart-stat-box accent-box">
          <div className="stat-icon-micro accent-icon">
            <Target size={14} />
          </div>
          <div>
            <span className="chart-stat-label">Peso Atual</span>
            <strong className="chart-stat-val primary-text">{metrics.latestWeight} <span className="stat-unit">kg</span></strong>
          </div>
        </div>

        <div className="chart-stat-box">
          <div className="stat-icon-micro">
            <Activity size={14} />
          </div>
          <div>
            <span className="chart-stat-label">Variação Total</span>
            <strong
              className={`chart-stat-val ${
                isLossTheme ? "success-text" : isGainTheme ? "info-text" : ""
              }`}
            >
              {metrics.isSingle ? "0.0" : (parseFloat(metrics.diff) > 0 ? `+${metrics.diff}` : metrics.diff)} <span className="stat-unit">kg</span>
            </strong>
          </div>
        </div>

        <div className="chart-stat-box">
          <div className="stat-icon-micro">
            <Flame size={14} />
          </div>
          <div>
            <span className="chart-stat-label">Mínimo / Máximo</span>
            <span className="chart-stat-subtext">
              {metrics.minWeight} - {metrics.maxWeight} kg
            </span>
          </div>
        </div>
      </div>

      {/* Área do Gráfico SVG Responsivo */}
      <div className="svg-chart-container">
        {chartConfig && (
          <svg
            viewBox={`0 0 ${chartConfig.width} ${chartConfig.height}`}
            className="evolution-svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Gradiente Suave Esmeralda / Verde */}
              <linearGradient id="glowAreaEmerald" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                <stop offset="60%" stopColor="#10b981" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>

              {/* Gradiente Suave Safira / Azul */}
              <linearGradient id="glowAreaBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
                <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>

              {/* Gradiente Neutro Elegante */}
              <linearGradient id="glowAreaNeutral" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
              </linearGradient>

              {/* Filtro de Sombra Suave para a Linha */}
              <filter id="softGlowLine" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="4"
                  stdDeviation="3.5"
                  floodColor={isLossTheme ? "rgba(16, 185, 129, 0.45)" : isGainTheme ? "rgba(59, 130, 246, 0.45)" : "rgba(0, 0, 0, 0.15)"}
                />
              </filter>
            </defs>

            {/* Linhas de Grade Horizontais */}
            {chartConfig.gridLines.map((grid, idx) => (
              <g key={idx} className="chart-grid-group">
                <line
                  x1={chartConfig.padding.left}
                  y1={grid.y}
                  x2={chartConfig.width - chartConfig.padding.right}
                  y2={grid.y}
                  stroke="var(--border)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <text
                  x={chartConfig.padding.left - 12}
                  y={grid.y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fontWeight="600"
                  fill="var(--text-light)"
                >
                  {grid.val} kg
                </text>
              </g>
            ))}

            {/* Área sob a Curva com Gradiente Suave */}
            {chartConfig.areaPath && (
              <path
                d={chartConfig.areaPath}
                fill={isLossTheme ? "url(#glowAreaEmerald)" : isGainTheme ? "url(#glowAreaBlue)" : "url(#glowAreaNeutral)"}
              />
            )}

            {/* Linha Guia Vertical no Hover */}
            {hoveredPoint && (
              <line
                x1={hoveredPoint.x}
                y1={chartConfig.padding.top}
                x2={hoveredPoint.x}
                y2={chartConfig.bottomY}
                stroke={mainStrokeColor}
                strokeDasharray="3 3"
                strokeWidth="1.5"
                opacity="0.5"
              />
            )}

            {/* Linha Curva Principal Fluida */}
            {chartConfig.linePath && (
              <path
                d={chartConfig.linePath}
                fill="none"
                stroke={mainStrokeColor}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#softGlowLine)"
              />
            )}

            {/* Eixo X: Rótulos de Datas */}
            {chartConfig.coordinates.map((pt, idx) => (
              <text
                key={idx}
                x={pt.x}
                y={chartConfig.height - 12}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill={hoveredPoint?.id === pt.id ? "var(--text-main)" : "var(--text-muted)"}
              >
                {formatDate(pt.data)}
              </text>
            ))}

            {/* Pontos Interativos (Nodes) */}
            {chartConfig.coordinates.map((pt, idx) => {
              const isLast = idx === chartConfig.coordinates.length - 1;
              const isHovered = hoveredPoint?.id === pt.id;

              return (
                <g
                  key={pt.id}
                  className="chart-point-node"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Área invisível expandida para captura de hover suave */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="22"
                    fill="transparent"
                    pointerEvents="all"
                  />

                  {/* Círculo de Pulse no Ponto Atual / Único */}
                  {(isLast || metrics.isSingle) && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="12"
                      fill={mainStrokeColor}
                      opacity="0.25"
                      className="pulse-circle"
                    />
                  )}

                  {/* Halo do Nó */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? "8" : isLast ? "6" : "4.5"}
                    fill="var(--surface)"
                    stroke={mainStrokeColor}
                    strokeWidth={isHovered ? "3.5" : "2.5"}
                    style={{ transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
                  />

                  {/* Ponto Central Sólido no Hover */}
                  {isHovered && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="3.5"
                      fill={mainStrokeColor}
                    />
                  )}

                  {/* Rótulo Estático Flutuante (exibido apenas quando NÃO estiver em hover) */}
                  {!isHovered && (isLast || metrics.isSingle) && (
                    <g transform={`translate(${pt.x}, ${pt.y - 14})`}>
                      <rect
                        x="-26"
                        y="-16"
                        width="52"
                        height="18"
                        rx="4"
                        fill="var(--surface)"
                        stroke="var(--border)"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="-4"
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="800"
                        fill="var(--text-main)"
                      >
                        {pt.peso} kg
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {/* Tooltip Dinâmico Informativo com Posicionamento Anti-Corte */}
        {hoveredPoint && tooltipStyle && (
          <div
            className={`chart-tooltip-bubble animate-fade-in ${
              tooltipStyle.isFlippedBottom ? "tooltip-flipped" : ""
            } arrow-${tooltipStyle.arrowAlign}`}
            style={{
              left: tooltipStyle.left,
              top: tooltipStyle.top,
              transform: tooltipStyle.transform
            }}
          >
            <div className="tooltip-header">
              <Calendar size={12} />
              <span>{formatDate(hoveredPoint.data)}</span>
              <strong>{hoveredPoint.label}</strong>
            </div>
            <div className="tooltip-body">
              <div className="tooltip-row-highlight">
                <span className="tooltip-label">Peso na Consulta</span>
                <strong className="tooltip-weight-big" style={{ color: mainStrokeColor }}>
                  {hoveredPoint.peso} <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>kg</span>
                </strong>
              </div>

              {(hoveredPoint.cintura || hoveredPoint.quadril || hoveredPoint.gordura) && (
                <div className="tooltip-submetrics-grid">
                  {hoveredPoint.cintura && (
                    <div className="tooltip-sub-item">
                      <span>Cintura</span>
                      <strong>{hoveredPoint.cintura} cm</strong>
                    </div>
                  )}
                  {hoveredPoint.quadril && (
                    <div className="tooltip-sub-item">
                      <span>Quadril</span>
                      <strong>{hoveredPoint.quadril} cm</strong>
                    </div>
                  )}
                  {hoveredPoint.gordura && (
                    <div className="tooltip-sub-item">
                      <span>% Gordura</span>
                      <strong>{hoveredPoint.gordura}%</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Rodapé Informativo */}
      <div className="chart-footer-note">
        <Sparkles size={14} color="var(--primary)" />
        <span>
          {timelineData.length === 1
            ? "1 registro antropométrico registrado. A curva de tendência será calculada a partir da 2ª consulta."
            : `Curva fluida traçada com precisão a partir de ${timelineData.length} consultas antropométricas.`}
        </span>
      </div>
    </div>
  );
}
