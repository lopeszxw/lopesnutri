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
  Flame
} from "lucide-react";
import { safeDateString, formatDate } from "../utils/helpers";

/**
 * Interpolação Cúbica Monotônica (Fritsch-Carlson)
 * Garante curvas suaves, naturais e sem distorções/ondulações artificiais.
 */
function getMonotoneSplinePath(points) {
  if (!points || points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  
  if (points.length === 2) {
    const [p0, p1] = points;
    const dx = p1.x - p0.x;
    return `M ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} C ${(p0.x + dx * 0.35).toFixed(1)} ${p0.y.toFixed(1)}, ${(p1.x - dx * 0.35).toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }

  const n = points.length;
  const d = [];
  const m = [];

  for (let i = 0; i < n - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    d.push(dx === 0 ? 0 : dy / dx);
  }

  m.push(d[0]);
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] <= 0) {
      m.push(0);
    } else {
      m.push((d[i - 1] + d[i]) / 2);
    }
  }
  m.push(d[n - 2]);

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const dx = (p1.x - p0.x) / 3;
    const cp1x = p0.x + dx;
    const cp1y = p0.y + m[i] * dx;
    const cp2x = p1.x - dx;
    const cp2y = p1.y - m[i + 1] * dx;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }
  return path;
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
      consultaIndex: index + 1,
      label: `Consulta #${index + 1}`,
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
      status = "Emagrecimento / Redução";
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

    const width = 760;
    const height = 240;
    const padding = { top: 35, right: 60, bottom: 45, left: 60 };

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
      minVal -= range * 0.18;
      maxVal += range * 0.18;
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
      linePath = getMonotoneSplinePath(coordinates);

      const firstPt = coordinates[0];
      const lastPt = coordinates[coordinates.length - 1];
      const bottomY = padding.top + plotHeight;

      areaPath = `
        ${linePath} 
        L ${lastPt.x.toFixed(1)} ${bottomY} 
        L ${firstPt.x.toFixed(1)} ${bottomY} 
        Z
      `;
    }

    // Linhas de Grade Y
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
              {/* Gradiente Suave Esmeralda */}
              <linearGradient id="glowAreaEmerald" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                <stop offset="70%" stopColor="#10b981" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>

              {/* Gradiente Suave Safira */}
              <linearGradient id="glowAreaBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
                <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>

              {/* Gradiente Neutro */}
              <linearGradient id="glowAreaNeutral" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
              </linearGradient>

              {/* Sombra Suave para a Linha */}
              <filter id="softGlowLine" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="3"
                  stdDeviation="3"
                  floodColor={isLossTheme ? "rgba(16, 185, 129, 0.35)" : isGainTheme ? "rgba(59, 130, 246, 0.35)" : "rgba(0, 0, 0, 0.12)"}
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
                  opacity="0.5"
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

            {/* Área sob a Curva com Gradiente */}
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
                opacity="0.6"
              />
            )}

            {/* Linha Curva Fluida Monotônica */}
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
            {chartConfig.coordinates.map((pt, idx) => {
              // Se houver consultas com datas idênticas, inclui o índice da consulta para clareza
              const isDuplicateDate = chartConfig.coordinates.some(
                (other, otherIdx) => otherIdx !== idx && other.data === pt.data
              );
              const labelDate = isDuplicateDate
                ? `${formatDate(pt.data)} (#${pt.consultaIndex})`
                : formatDate(pt.data);

              return (
                <text
                  key={idx}
                  x={pt.x}
                  y={chartConfig.height - 12}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill={hoveredPoint?.id === pt.id ? "var(--text-main)" : "var(--text-muted)"}
                >
                  {labelDate}
                </text>
              );
            })}

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
                    r="24"
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

                  {/* Rótulo Estático Flutuante (apenas se NÃO hover) */}
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

        {/* Tooltip Dinâmico Informativo Anti-Corte (Posicionamento Lateral Inteligente) */}
        {hoveredPoint && chartConfig && (
          <div
            className={`chart-tooltip-bubble animate-fade-in ${
              hoveredPoint.x > chartConfig.width * 0.52 ? "dock-left" : "dock-right"
            }`}
            style={{
              left: `${(hoveredPoint.x / chartConfig.width) * 100}%`,
              top: `${(hoveredPoint.y / chartConfig.height) * 100}%`
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
