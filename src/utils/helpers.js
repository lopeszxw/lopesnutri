/**
 * Utilitários seguros para manipulação e formatação de dados do banco de dados (Neon / PostgreSQL)
 */

export const safeDateString = (val) => {
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
  return String(val);
};

export const formatDate = (dateVal) => {
  if (!dateVal) return "-";
  try {
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return String(dateVal);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return String(dateVal);
  }
};

export const parsePgArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // Fallback
      }
    }
    const clean = trimmed.replace(/^\{|\}$/g, "").trim();
    if (!clean) return [];
    return clean
      .split(",")
      .map((s) => s.replace(/^"|"$/g, "").trim())
      .filter(Boolean);
  }
  return [];
};

/**
 * Formata o nome do nutricionista para saudação evitando "Dra. !" ou repetições
 */
export const formatNutriGreeting = (rawName) => {
  if (!rawName || typeof rawName !== "string") return "Nutricionista";
  const clean = rawName.trim();
  if (!clean) return "Nutricionista";

  const parts = clean.split(/\s+/);

  // Se já começa com Dr. / Dra. / Dr / Dra
  if (/^dr\.?$/i.test(parts[0]) || /^dra\.?$/i.test(parts[0])) {
    const title = /^dra/i.test(parts[0]) ? "Dra." : "Dr.";
    const firstName = parts[1] || "";
    return firstName ? `${title} ${firstName}` : "Nutricionista";
  }

  return parts[0] || "Nutricionista";
};
