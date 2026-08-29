import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Gera plano alimentar padrão estruturado caso ocorra erro ou timeout na IA.
 */
function gerarPlanoFallbackLocal(paciente = {}) {
  const dias = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
    "Domingo"
  ];

  return dias.map((dia, idx) => ({
    dia,
    refeicoes: {
      cafe_da_manha: [
        "1 xícara de café preto com canela ou chá verde",
        "2 ovos mexidos ou cozidos com azeite extravirgem",
        "2 fatias de pão 100% integral com queijo branco ou cottage",
        "1 porção de fruta fresca (mamão papaia ou banana com aveia)",
        "1 copo de água morna com limão em jejum"
      ],
      lanche_manha: [
        "1 fruta fresca da estação (maçã, pera ou kiwi)",
        "1 punhado (20g) de castanhas ou nozes selecionadas",
        "1 pote de iogurte natural desnatado sem açúcar",
        "3 biscoitos de arroz integral com pasta de amendoim",
        "1 xícara de chá de hortelã ou camomila"
      ],
      almoco: [
        "Salada verde abundante (alface, rúcula, tomate, pepino) com azeite e limão",
        "3 colheres de sopa de arroz integral ou purê de mandioca",
        "1 concha média de feijão carioca ou feijão-preto",
        "1 filé de frango grelhado (130g) ou peixe assado com ervas",
        "Legumes cozidos no vapor (brócolis, cenoura e abobrinha)"
      ],
      lanche_tarde: [
        "1 fatia de pão integral com pasta de atum ou ricota temperada",
        "1 tigela de salada de frutas com sementes de chia e linhaça",
        "1 copo de vitamina de frutas com leite vegetal e aveia",
        "2 torradas integrais com queijo minas e orégano",
        "1 xícara de chá de hibisco gelado ou água de coco"
      ],
      jantar: [
        "Prato fundo de sopa de legumes com frango desfiado",
        "Salada colorida completa com folhas escuras e tomate-cereja",
        "Omelete nutritivo de 2 ovos com espinafre e queijo branco",
        "1 filé de peixe grelhado com purê de abóbora cabotiá assada",
        "Wrap integral leve com frango desfiado, ricota e cenoura ralada"
      ]
    }
  }));
}

/**
 * Função Serverless /api/gerar-plano
 * Gera plano alimentar semanal com IA (Google Gemini) baseado nos dados clínicos do paciente.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido. Use POST." });
  }

  const { paciente } = req.body || {};

  if (!paciente) {
    return res.status(400).json({ error: "Dados do paciente são obrigatórios." });
  }

  const apiKey = process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    console.warn("GOOGLE_API_KEY não configurada. Retornando plano fallback estruturado.");
    return res.status(200).json({
      success: true,
      plano_semanal: gerarPlanoFallbackLocal(paciente),
      origem: "fallback-local",
      aviso: "Chave de IA não configurada. Plano base gerado com sucesso."
    });
  }

  try {
    const dadosPacienteFormatados = `
Nome: ${paciente.nome || "Não informado"}
Sexo: ${paciente.sexo || "Não informado"}
Data de Nascimento: ${paciente.data_nascimento || "Não informado"}
Peso Atual / Inicial: ${paciente.ultimo_peso || paciente.peso_inicial || "Não informado"} kg
Altura: ${paciente.altura || "Não informado"} cm
Objetivos Clínicos: ${Array.isArray(paciente.objetivos) ? paciente.objetivos.join(", ") : (paciente.objetivos || "Saúde e reeducação alimentar")}
Descrição do Objetivo: ${paciente.objetivo_texto || "Melhora na saúde geral e qualidade de vida"}
Nível de Atividade Física: ${paciente.nivel_atividade || "Sedentário"}
Pratica Atividade Física: ${paciente.atividade_fisica ? `Sim (${paciente.atividade_fisica_descricao || "Frequente"})` : "Não"}
Patologias Diagnosticadas: ${Array.isArray(paciente.patologias) ? paciente.patologias.join(", ") : (paciente.patologias || "Nenhuma")}
Restrições Alimentares: ${Array.isArray(paciente.restricoes_alimentares) ? paciente.restricoes_alimentares.join(", ") : (paciente.restricoes_alimentares || "Nenhuma")}
Alergias Alimentares: ${Array.isArray(paciente.alergias) ? paciente.alergias.join(", ") : (paciente.alergias || "Nenhuma")}
Medicamentos em Uso: ${paciente.medicamentos || "Nenhum"}
Suplementação: ${paciente.suplementos || "Nenhuma"}
Refeições por dia habituais: ${paciente.refeicoes_por_dia || 4}
Horário que acorda / dorme: Acorda às ${paciente.horario_acorda || "07:00"} e dorme às ${paciente.horario_dorme || "23:00"}
Consumo de Água: ${paciente.litros_agua ? `${paciente.litros_agua}L/dia` : "Não informado"}
Observações Clínicas Adicionais: ${paciente.observacoes || "Nenhuma"}
    `.trim();

    const systemPrompt = `
Você é um nutricionista clínico profissional especialista na culinária e rotina brasileira.
Gere um plano alimentar semanal completo, saudável e diversificado com base nos dados do paciente fornecidos abaixo.

Dados do Paciente (Metas, Alergias, Restrições e Histórico):
${dadosPacienteFormatados}

# Regras Críticas de Execução:
- Você deve responder APENAS e estritamente o objeto JSON solicitado.
- Não inclua blocos de código markdown (como \`\`\`json ... \`\`\`), explicações, introduções ou textos complementares.
- Adapte o cardápio rigorosamente a quaisquer alergias ou restrições descritas nos dados.
- Utilize alimentos comuns, acessíveis e culturalmente aceitos no Brasil.
- Evite repetições monótonas de alimentos nos dias seguidos.
- Inclua todos os 7 dias da semana: Segunda-feira, Terça-feira, Quarta-feira, Quinta-feira, Sexta-feira, Sábado, Domingo.
- Para cada uma das 5 refeições (cafe_da_manha, lanche_manha, almoco, lanche_tarde, jantar), forneça exatamente 5 opções de itens/alimentos variados e equilibrados.

O formato do JSON retornado deve seguir exatamente esta estrutura:
{
  "plano_semanal": [
    {
      "dia": "Segunda-feira",
      "refeicoes": {
        "cafe_da_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "almoco": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_tarde": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "jantar": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"]
      }
    },
    {
      "dia": "Terça-feira",
      "refeicoes": {
        "cafe_da_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "almoco": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_tarde": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "jantar": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"]
      }
    },
    {
      "dia": "Quarta-feira",
      "refeicoes": {
        "cafe_da_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "almoco": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_tarde": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "jantar": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"]
      }
    },
    {
      "dia": "Quinta-feira",
      "refeicoes": {
        "cafe_da_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "almoco": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_tarde": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "jantar": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"]
      }
    },
    {
      "dia": "Sexta-feira",
      "refeicoes": {
        "cafe_da_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "almoco": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_tarde": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "jantar": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"]
      }
    },
    {
      "dia": "Sábado",
      "refeicoes": {
        "cafe_da_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "almoco": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_tarde": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "jantar": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"]
      }
    },
    {
      "dia": "Domingo",
      "refeicoes": {
        "cafe_da_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "almoco": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_tarde": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "jantar": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"]
      }
    }
  ]
}
    `.trim();

    const genAI = new GoogleGenerativeAI(apiKey);

    // Timeout de 15 segundos para chamada da IA
    const callGeminiWithTimeout = async () => {
      const model = genAI.getGenerativeModel({
        model: "gemini-3.6-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });

      const result = await model.generateContent(systemPrompt);
      return result.response.text();
    };

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout: Gemini demorou mais de 15s")), 15000)
    );

    const responseText = await Promise.race([callGeminiWithTimeout(), timeoutPromise]);

    if (!responseText) {
      throw new Error("Resposta vazia da API do Gemini.");
    }

    const cleanJson = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsedData = JSON.parse(cleanJson);

    if (!parsedData.plano_semanal || !Array.isArray(parsedData.plano_semanal)) {
      throw new Error("Formato inválido retornado pela IA.");
    }

    return res.status(200).json({
      success: true,
      plano_semanal: parsedData.plano_semanal,
      origem: "gemini-ai"
    });
  } catch (error) {
    console.warn("Aviso na geração com IA, acionando fallback estruturado:", error.message);
    return res.status(200).json({
      success: true,
      plano_semanal: gerarPlanoFallbackLocal(paciente),
      origem: "fallback-resiliente",
      aviso: "IA indisponível no momento. Plano semanal gerado via modelo clínico para edição imediata."
    });
  }
}
