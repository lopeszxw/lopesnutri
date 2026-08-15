import React, { useState, useMemo } from "react";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Scale,
  Calendar,
  Sparkles,
  Info,
  ArrowRight
} from "lucide-react";

export default function EvolucaoPesoChart({ pesoInicial, dataCadastro, consultas = [] }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // 1. Construir lista cronológica de dados de peso
  const timelineData = useMemo(() => {
    const points = [];

    // Ponto 0: Peso Inicial de Cadastro
    const pInicialNum = parseFloat(pesoInicial);
    if (!isNaN(pInicialNum) && pInicialNum > 0) {
      points.push({
        id: "inicial",
        data: dataCadastro ? dataCadastro.split("T")[0] : "Cadastro",
        peso: pInicialNum,
        label: "Peso Inicial (Cadastro)",
        isInitial: true,
        cintura: null,
        gordura: null
      });
    }

    // Pontos das consultas ordenadas cronologicamente
    const consultasComPeso = (consultas || [])
      .filter((c) => c.peso !== null && c.peso !== undefined && !isNaN(parseFloat(c.peso)))
      .sort((a, b) => new Date(a.data_consulta) - new Date(b.data_consulta));

    consultasComPeso.forEach((c, index) => {
      // Se a primeira consulta tiver a mesma data e peso do inicial, não duplicar ponto
      const cDate = c.data_consulta ? c.data_consulta.split("T")[0] : "";
      const cPeso = parseFloat(c.peso);

      if (
        points.length === 1 &&
        points[0].isInitial &&
        points[0].data === cDate &&
        points[0].peso === cPeso
      ) {
        points[0].cintura = c.cintura;
        points[0].gordura = c.percentual_gordura;
        return;
      }

      points.push({
        id: c.id || `consulta-${index}`,
        data: cDate,
        peso: cPeso,
        label: `Consulta ${index + 1}`,
        isInitial: false,
        cintura: c.cintura,
        gordura: c.percentual_gordura
      });
    });

    return points;
  }, [pesoInicial, dataCadastro, consultas]);

  // 2. Análise de métricas de evolução
  const metrics = useMemo(() => {
    if (timelineData.length === 0) return null;

    const firstWeight = timelineData[0].peso;
    const latestWeight = timelineData[timelineData.length - 1].peso;
    const diff = latestWeight - firstWeight;
    const percentDiff = firstWeight > 0 ? (diff / firstWeight) * 100 : 0;

    const minWeight = Math.min(...timelineData.map((d) => d.peso));
    const maxWeight = Math.max(...timelineData.map((d) => d.peso));

    let status = "Estável";
    let statusClass = "neutral";
    if (diff < -0.2) {
      status = "Emagrecimento / Redução";
      statusClass = "loss";
    } else if (diff > 0.2) {
      status = "Aumento / Ganho de Peso";
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

    const width = 640;
    const height = 220;
    const padding = { top: 25, right: 35, bottom: 45, left: 55 };

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const pesos = timelineData.map((d) => d.peso);
    let minVal = Math.min(...pesos);
    let maxVal = Math.max(...pesos);

    // Dar margem visual de 1kg a 2kg para a curva não encostar nos limites
    if (minVal === maxVal) {
      minVal -= 2;
      maxVal += 2;
    } else {
      const range = maxVal - minVal;
      minVal -= range * 0.15;
      maxVal += range * 0.15;
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

    // Construção de Caminho SVG (Line path e Area gradient path)
    const linePath = coordinates.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, "");

    const firstPt = coordinates[0];
    const lastPt = coordinates[coordinates.length - 1];
    const bottomY = padding.top + plotHeight;

    const areaPath = `
      ${linePath} 
      L ${lastPt.x} ${bottomY} 
      L ${firstPt.x} ${bottomY} 
      Z
    `;

    // 4 Linhas de Grade Horizontais
    const gridLines = [];
    const steps = 3;
    for (let i = 0; i <= steps; i++) {
      const val = minVal + (i / steps) * (maxVal - minVal);
      const y = getY(val);
      gridLines.push({
        val: val.toFixed(1),
        y
      });
    }

    return {
      width,
      height,
      padding,
      coordinates,
      linePath,
      areaPath,
      gridLines
    };
  }, [timelineData]);

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "Cadastro") return "Início";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}`;
      }
      const d = new Date(dateStr);
      return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    } catch {
      return dateStr;
    }
  };

  if (!metrics || timelineData.length === 0) {
    return (
      <div className="profile-card chart-card-wrapper">
        <div className="profile-card-title">
          <Scale size={18} color="var(--primary)" />
          <h3>Evolução de Peso & Composição</h3>
        </div>
        <div className="empty-chart-box">
          <Scale size={32} className="empty-icon-muted" />
          <p>Nenhum dado de peso registrado para gerar o gráfico de evolução.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-card chart-card-wrapper animate-fade-in">
      {/* Header do Card de Evolução */}
      <div className="card-header-flex" style={{ marginBottom: "1rem" }}>
        <div className="profile-card-title" style={{ marginBottom: 0 }}>
          <Scale size={18} color="var(--primary)" />
          <div>
            <h3>Evolução do Peso Corporal</h3>
            <span className="chart-subtitle">
              Acompanhamento cronológico de emagrecimento e ganho de massa
            </span>
          </div>
        </div>

        {/* Badge Resumo de Evolução */}
        <div className={`evolution-trend-badge ${metrics.statusClass}`}>
          {metrics.isLoss && <TrendingDown size={17} />}
          {metrics.isGain && <TrendingUp size={17} />}
          {metrics.isStable && <Minus size={17} />}
          <span>
            {metrics.isLoss && `Redução de ${metrics.diffAbs} kg (-${metrics.percentDiff}%)`}
            {metrics.isGain && `Aumento de +${metrics.diffAbs} kg (+${metrics.percentDiff}%)`}
            {metrics.isStable && `Peso Estável (Variação de ${metrics.diff} kg)`}
          </span>
        </div>
      </div>

      {/* Métricas Rápidas no Topo do Gráfico */}
      <div className="chart-stats-summary-row">
        <div className="chart-stat-box">
          <span className="chart-stat-label">Peso Inicial</span>
          <strong className="chart-stat-val">{metrics.firstWeight} kg</strong>
        </div>

        <div className="chart-stat-box accent-box">
          <span className="chart-stat-label">Peso Atual</span>
          <strong className="chart-stat-val primary-text">{metrics.latestWeight} kg</strong>
        </div>

        <div className="chart-stat-box">
          <span className="chart-stat-label">Variação Total</span>
          <strong
            className={`chart-stat-val ${
              metrics.isLoss ? "success-text" : metrics.isGain ? "info-text" : ""
            }`}
          >
            {metrics.diff > 0 ? `+${metrics.diff}` : metrics.diff} kg
          </strong>
        </div>

        <div className="chart-stat-box">
          <span className="chart-stat-label">Mínimo / Máximo</span>
          <span className="chart-stat-subtext">
            {metrics.minWeight} kg - {metrics.maxWeight} kg
          </span>
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
              {/* Gradiente Verde para Redução / Emagrecimento */}
              <linearGradient id="weightLossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
              </linearGradient>

              {/* Gradiente Ciano para Ganho */}
              <linearGradient id="weightGainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
              </linearGradient>

              {/* Filtro de Sombra para a Linha */}
              <filter id="glowShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow
                  dx="0"
                  dy="4"
                  stdDeviation="4"
                  floodColor={metrics.isLoss ? "rgba(13, 122, 107, 0.3)" : "rgba(14, 165, 233, 0.3)"}
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
                  strokeDasharray="3 3"
                  strokeWidth="1"
                  opacity="0.8"
                />
                <text
                  x={chartConfig.padding.left - 10}
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
            <path
              d={chartConfig.areaPath}
              fill={metrics.isLoss ? "url(#weightLossGradient)" : "url(#weightGainGradient)"}
            />

            {/* Linha Principal da Curva */}
            <path
              d={chartConfig.linePath}
              fill="none"
              stroke={metrics.isLoss ? "var(--primary)" : "#0284c7"}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glowShadow)"
            />

            {/* Eixo X: Rótulos de Datas */}
            {chartConfig.coordinates.map((pt, idx) => (
              <text
                key={idx}
                x={pt.x}
                y={chartConfig.height - 15}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="var(--text-muted)"
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
                  {/* Círculo de Pulse no Ponto Atual */}
                  {isLast && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="10"
                      fill={metrics.isLoss ? "var(--primary)" : "#0284c7"}
                      opacity="0.25"
                      className="pulse-circle"
                    />
                  )}

                  {/* Círculo Externo */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? "7" : isLast ? "6" : "4.5"}
                    fill="var(--surface)"
                    stroke={metrics.isLoss ? "var(--primary)" : "#0284c7"}
                    strokeWidth={isHovered ? "3.5" : "2.5"}
                    style={{ transition: "all 0.2s ease" }}
                  />

                  {/* Valor acima do ponto se hover ou último */}
                  {(isHovered || isLast) && (
                    <g transform={`translate(${pt.x}, ${pt.y - 12})`}>
                      <rect
                        x="-24"
                        y="-16"
                        width="48"
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
                        fontSize="10.5"
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

        {/* Tooltip Dinâmico Informativo ao passar o mouse */}
        {hoveredPoint && (
          <div
            className="chart-tooltip-bubble animate-fade-in"
            style={{
              left: `${(hoveredPoint.x / chartConfig.width) * 100}%`,
              top: `${(hoveredPoint.y / chartConfig.height) * 100}%`
            }}
          >
            <div className="tooltip-header">
              <Calendar size={12} />
              <span>{hoveredPoint.data}</span>
              <strong>{hoveredPoint.label}</strong>
            </div>
            <div className="tooltip-body">
              <div className="tooltip-row">
                <span>Peso registrado:</span>
                <strong>{hoveredPoint.peso} kg</strong>
              </div>
              {hoveredPoint.cintura && (
                <div className="tooltip-row">
                  <span>Cintura:</span>
                  <strong>{hoveredPoint.cintura} cm</strong>
                </div>
              )}
              {hoveredPoint.gordura && (
                <div className="tooltip-row">
                  <span>% Gordura:</span>
                  <strong>{hoveredPoint.gordura}%</strong>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dica ou feedback de progresso */}
      <div className="chart-footer-note">
        <Sparkles size={14} color="var(--primary)" />
        <span>
          {timelineData.length > 1
            ? `Curva calculada a partir de ${timelineData.length} registros antropométricos.`
            : "Cadastre novas consultas e evoluções para acompanhar a curva gráfica completa ao longo do tempo."}
        </span>
      </div>
    </div>
  );
}
