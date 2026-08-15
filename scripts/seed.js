import { createAuthClient } from "@neondatabase/neon-js/auth";
import { neon } from "@neondatabase/serverless";

const authUrl = process.env.VITE_NEON_AUTH_URL;
const dbUrl = process.env.NEON_DB_URL || process.env.VITE_NEON_DB_URL;

if (!authUrl || !dbUrl) {
  console.error("❌ ERRO: VITE_NEON_AUTH_URL e NEON_DB_URL/VITE_NEON_DB_URL são obrigatórias.");
  process.exit(1);
}

const authClient = createAuthClient(authUrl, {
  fetchOptions: {
    headers: {
      Origin: "http://localhost:5173",
      Referer: "http://localhost:5173/"
    }
  }
});
const sql = neon(dbUrl);

const defaultPassword = "Nutri@123456";

const nutricionistasData = [
  {
    nome: "Dra. Camila Duarte",
    email: "camila.duarte@lopesnutri.com",
    especialidade: "Nutrição Clínica e Emagrecimento",
    pacientes: [
      {
        nome: "Mariana Costa Silva",
        email: "mariana.costa@gmail.com",
        whatsapp: "(11) 98765-4321",
        sexo: "Feminino",
        data_nascimento: "1994-05-12",
        peso_inicial: 78.5,
        altura: 165,
        objetivos: ["Emagrecer", "Reeducação alimentar"],
        objetivo_texto: "Redução de gordura corporal com foco em reeducação alimentar sustentável.",
        nivel_atividade: "Moderadamente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Açúcar"],
        alergias: ["Nenhum"],
        medicamentos: "",
        suplementos: "Vitamina D 2000UI",
        refeicoes_por_dia: 4,
        horario_acorda: "06:30",
        horario_dorme: "22:30",
        litros_agua: 2.5,
        atividade_fisica: true,
        atividade_fisica_descricao: "Musculação 3x/semana e Pilates 2x/semana",
        observacoes: "Paciente motivada. Relata ansiedade no período noturno com vontade de doces.",
        consultas: [
          {
            data_consulta: "2026-06-10",
            peso: 78.5,
            cintura: 84,
            quadril: 106,
            percentual_gordura: 31.2,
            proximo_retorno: "2026-07-10",
            observacoes: "Primeira consulta. Plano hipocalórico ajustado para 1600 kcal."
          },
          {
            data_consulta: "2026-07-10",
            peso: 75.8,
            cintura: 81,
            quadril: 104,
            percentual_gordura: 29.4,
            proximo_retorno: "2026-08-20",
            observacoes: "Ótima adesão ao plano alimentar. Redução de 2,7kg e melhora na digestão."
          }
        ]
      },
      {
        nome: "Rafael Antunes Martins",
        email: "rafael.antunes@yahoo.com.br",
        whatsapp: "(11) 97654-3210",
        sexo: "Masculino",
        data_nascimento: "1988-11-20",
        peso_inicial: 94.0,
        altura: 178,
        objetivos: ["Emagrecer", "Saúde geral"],
        objetivo_texto: "Perda de peso para controle do colesterol e redução da gordura visceral.",
        nivel_atividade: "Sedentário",
        patologias: ["Colesterol alto", "Hipertensão"],
        restricoes_alimentares: ["Carne vermelha"],
        alergias: ["Frutos do mar"],
        medicamentos: "Losartana 50mg, Rosuvastatina 10mg",
        suplementos: "Ômega 3 1000mg",
        refeicoes_por_dia: 3,
        horario_acorda: "07:00",
        horario_dorme: "23:30",
        litros_agua: 2.0,
        atividade_fisica: false,
        atividade_fisica_descricao: "",
        observacoes: "Rotina corporativa estressante com consumo frequente de café e ultraprocessados.",
        consultas: [
          {
            data_consulta: "2026-05-15",
            peso: 94.0,
            cintura: 102,
            quadril: 108,
            percentual_gordura: 28.5,
            proximo_retorno: null, // Sem retorno agendado há > 30 dias (Alerta Dashboard!)
            observacoes: "Primeira consulta. Orientado a aumentar ingestão de fibras e caminhadas diárias."
          }
        ]
      },
      {
        nome: "Carolina Mendes Rocha",
        email: "carol.mendes@outlook.com",
        whatsapp: "(11) 96543-2109",
        sexo: "Feminino",
        data_nascimento: "1997-03-08",
        peso_inicial: 62.0,
        altura: 160,
        objetivos: ["Reeducação alimentar", "Saúde geral"],
        objetivo_texto: "Aprender a comer melhor, organizar marmitas semanais e melhorar energia diária.",
        nivel_atividade: "Levemente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Lactose"],
        alergias: ["Nenhum"],
        medicamentos: "",
        suplementos: "Multivitamínico",
        refeicoes_por_dia: 4,
        horario_acorda: "06:00",
        horario_dorme: "22:00",
        litros_agua: 2.2,
        atividade_fisica: true,
        atividade_fisica_descricao: "Yoga 3x/semana",
        observacoes: "Sensibilidade digestiva a laticínios.",
        consultas: [
          {
            data_consulta: "2026-08-14",
            peso: 61.2,
            cintura: 69,
            quadril: 95,
            percentual_gordura: 24.0,
            proximo_retorno: "2026-09-15",
            observacoes: "Consulta recente. Adaptação com leites vegetais aprovada."
          }
        ]
      },
      {
        nome: "Bruno Henrique Nogueira",
        email: "bruno.nogueira@gmail.com",
        whatsapp: "(11) 95432-1098",
        sexo: "Masculino",
        data_nascimento: "1991-09-14",
        peso_inicial: 88.0,
        altura: 182,
        objetivos: ["Emagrecer", "Performance esportiva"],
        objetivo_texto: "Definição muscular e preparação para corrida de 10km.",
        nivel_atividade: "Muito ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Nenhum"],
        alergias: ["Amendoim"],
        medicamentos: "",
        suplementos: "Whey Protein Isolado, Creatina 5g",
        refeicoes_por_dia: 5,
        horario_acorda: "05:30",
        horario_dorme: "22:30",
        litros_agua: 3.5,
        atividade_fisica: true,
        atividade_fisica_descricao: "Corrida de rua 4x/semana + Funcional 2x",
        observacoes: "Excelente disciplina com horários de treinos e alimentação.",
        consultas: [
          {
            data_consulta: "2026-08-11",
            peso: 85.5,
            cintura: 82,
            quadril: 98,
            percentual_gordura: 16.2,
            proximo_retorno: "2026-09-10",
            observacoes: "Consulta da semana. Plano com distribuição de carboidratos em torno do treino."
          }
        ]
      },
      {
        nome: "Juliana Barreto Pires",
        email: "juliana.pires@hotmail.com",
        whatsapp: "(11) 94321-0987",
        sexo: "Feminino",
        data_nascimento: "1985-07-25",
        peso_inicial: 73.0,
        altura: 158,
        objetivos: ["Controlar diabetes", "Emagrecer"],
        objetivo_texto: "Controle de pré-diabetes e emagrecimento orientado.",
        nivel_atividade: "Sedentário",
        patologias: ["Diabetes", "Hipertensão"],
        restricoes_alimentares: ["Açúcar"],
        alergias: ["Nenhum"],
        medicamentos: "Metformina 500mg",
        suplementos: "",
        refeicoes_por_dia: 3,
        horario_acorda: "07:30",
        horario_dorme: "23:00",
        litros_agua: 1.8,
        atividade_fisica: false,
        atividade_fisica_descricao: "",
        observacoes: "Paciente relata cansaço matinal e picos de glicemia pós-almoço.",
        consultas: [
          {
            data_consulta: "2026-06-01",
            peso: 73.0,
            cintura: 89,
            quadril: 105,
            percentual_gordura: 34.0,
            proximo_retorno: null, // > 30 dias sem retorno (Alerta!)
            observacoes: "Orientação sobre índice glicêmico dos alimentos."
          }
        ]
      },
      {
        nome: "Thiago Vasconcelos Lima",
        email: "thiago.lima@gmail.com",
        whatsapp: "(11) 93210-9876",
        sexo: "Masculino",
        data_nascimento: "2000-01-18",
        peso_inicial: 68.0,
        altura: 175,
        objetivos: ["Ganhar massa"],
        objetivo_texto: "Hipertrofia muscular limpa sem ganho de gordura.",
        nivel_atividade: "Muito ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Nenhum"],
        alergias: ["Nenhum"],
        medicamentos: "",
        suplementos: "Creatina, Beta-alanina, Whey",
        refeicoes_por_dia: 5,
        horario_acorda: "06:00",
        horario_dorme: "23:00",
        litros_agua: 3.0,
        atividade_fisica: true,
        atividade_fisica_descricao: "Musculação 5x/semana (ABCDE)",
        observacoes: "Dificuldade em bater metas de calorias devido à rotina de faculdade.",
        consultas: [
          {
            data_consulta: "2026-08-12",
            peso: 70.2,
            cintura: 76,
            quadril: 94,
            percentual_gordura: 12.8,
            proximo_retorno: "2026-09-12",
            observacoes: "Consulta da semana. Ganho de 2,2kg de massa magra comprovado."
          }
        ]
      },
      {
        nome: "Fernanda Albuquerque Dias",
        email: "fernanda.dias@yahoo.com",
        whatsapp: "(11) 92109-8765",
        sexo: "Feminino",
        data_nascimento: "1993-12-05",
        peso_inicial: 81.0,
        altura: 168,
        objetivos: ["Emagrecer", "Reeducação alimentar"],
        objetivo_texto: "Perda de 10kg pós-gestação.",
        nivel_atividade: "Levemente ativo",
        patologias: ["Hipotireoidismo"],
        restricoes_alimentares: ["Glúten"],
        alergias: ["Nenhum"],
        medicamentos: "Puran T4 50mcg",
        suplementos: "Complexo B, Ferro Quelato",
        refeicoes_por_dia: 4,
        horario_acorda: "06:30",
        horario_dorme: "22:00",
        litros_agua: 2.5,
        atividade_fisica: true,
        atividade_fisica_descricao: "Caminhadas diárias 40 minutos",
        observacoes: "Metabolismo mais lento devido à tireoide.",
        consultas: [
          {
            data_consulta: "2026-07-28",
            peso: 78.4,
            cintura: 82,
            quadril: 104,
            percentual_gordura: 29.8,
            proximo_retorno: "2026-08-28",
            observacoes: "Excelente evolução. Menor retenção de líquidos."
          }
        ]
      },
      {
        nome: "Lucas Farias Siqueira",
        email: "lucas.farias@gmail.com",
        whatsapp: "(11) 91098-7654",
        sexo: "Masculino",
        data_nascimento: "1986-04-30",
        peso_inicial: 105.0,
        altura: 180,
        objetivos: ["Emagrecer", "Saúde geral"],
        objetivo_texto: "Tratamento de obesidade grau I e esteatose hepática.",
        nivel_atividade: "Sedentário",
        patologias: ["Colesterol alto"],
        restricoes_alimentares: ["Carne vermelha", "Açúcar"],
        alergias: ["Ovo"],
        medicamentos: "Atorvastatina 20mg",
        suplementos: "Silimarina, Coenzima Q10",
        refeicoes_por_dia: 3,
        horario_acorda: "08:00",
        horario_dorme: "00:00",
        litros_agua: 2.0,
        atividade_fisica: false,
        atividade_fisica_descricao: "",
        observacoes: "Histórico familiar de doenças cardiovasculares.",
        consultas: [
          {
            data_consulta: "2026-05-20",
            peso: 105.0,
            cintura: 112,
            quadril: 116,
            percentual_gordura: 32.5,
            proximo_retorno: null, // > 30 dias sem retorno (Alerta!)
            observacoes: "Planejamento inicial focado em desinflamação hepática."
          }
        ]
      },
      {
        nome: "Amanda Ribeiro Soares",
        email: "amanda.soares@uol.com.br",
        whatsapp: "(11) 90987-6543",
        sexo: "Feminino",
        data_nascimento: "1999-08-19",
        peso_inicial: 56.0,
        altura: 163,
        objetivos: ["Ganhar massa", "Performance esportiva"],
        objetivo_texto: "Ganho de massa muscular nos membros inferiores e melhora da flexibilidade.",
        nivel_atividade: "Moderadamente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Lactose"],
        alergias: ["Leite"],
        medicamentos: "",
        suplementos: "Proteína vegetal de ervilha, BCAA",
        refeicoes_por_dia: 4,
        horario_acorda: "07:00",
        horario_dorme: "23:00",
        litros_agua: 2.4,
        atividade_fisica: true,
        atividade_fisica_descricao: "Crossfit 3x/semana + Natação 1x",
        observacoes: "Intolerância severa à lactose.",
        consultas: [
          {
            data_consulta: "2026-08-13",
            peso: 57.5,
            cintura: 66,
            quadril: 96,
            percentual_gordura: 19.5,
            proximo_retorno: "2026-09-14",
            observacoes: "Consulta da semana. Ótima resposta muscular."
          }
        ]
      },
      {
        nome: "Guilherme Castro Azevedo",
        email: "guilherme.castro@gmail.com",
        whatsapp: "(11) 99876-5432",
        sexo: "Masculino",
        data_nascimento: "1995-10-10",
        peso_inicial: 82.0,
        altura: 177,
        objetivos: ["Saúde geral", "Reeducação alimentar"],
        objetivo_texto: "Melhora do perfil lipídico e regularidade intestinal.",
        nivel_atividade: "Levemente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Glúten"],
        alergias: ["Trigo"],
        medicamentos: "",
        suplementos: "Probióticos 10 cepas, Psyllium",
        refeicoes_por_dia: 3,
        horario_acorda: "06:45",
        horario_dorme: "22:45",
        litros_agua: 2.8,
        atividade_fisica: true,
        atividade_fisica_descricao: "Bicicleta 3x/semana (30 min)",
        observacoes: "Diagnóstico recente de sensibilidade não-celíaca ao glúten.",
        consultas: [
          {
            data_consulta: "2026-08-01",
            peso: 80.8,
            cintura: 85,
            quadril: 99,
            percentual_gordura: 21.0,
            proximo_retorno: "2026-09-01",
            observacoes: "Sintomas de inchaço abdominal reduzidos em 90%."
          }
        ]
      }
    ]
  },
  {
    nome: "Dr. Felipe Albuquerque",
    email: "felipe.albuquerque@lopesnutri.com",
    especialidade: "Nutrição Esportiva e Alta Performance",
    pacientes: [
      {
        nome: "Gabriel Souza Ramos",
        email: "gabriel.ramos@gmail.com",
        whatsapp: "(21) 98888-1111",
        sexo: "Masculino",
        data_nascimento: "1992-06-15",
        peso_inicial: 84.0,
        altura: 180,
        objetivos: ["Performance esportiva", "Ganhar massa"],
        objetivo_texto: "Preparação para campeonato regional de Jiu-Jitsu.",
        nivel_atividade: "Extremamente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Nenhum"],
        alergias: ["Nenhum"],
        medicamentos: "",
        suplementos: "Creatina, Beta-Alanina, Maltodextrina intra-treino",
        refeicoes_por_dia: 6,
        horario_acorda: "05:30",
        horario_dorme: "22:00",
        litros_agua: 4.0,
        atividade_fisica: true,
        atividade_fisica_descricao: "Jiu-jitsu 5x/semana + Musculação 3x",
        observacoes: "Necessita de corte de peso controlado 1 semana antes da competição.",
        consultas: [
          {
            data_consulta: "2026-08-14",
            peso: 83.2,
            cintura: 79,
            quadril: 98,
            percentual_gordura: 11.5,
            proximo_retorno: "2026-08-28",
            observacoes: "Consulta da semana. Excelente rendimento nos treinos intensos."
          }
        ]
      },
      {
        nome: "Larissa Prado Carvalho",
        email: "larissa.prado@yahoo.com",
        whatsapp: "(21) 97777-2222",
        sexo: "Feminino",
        data_nascimento: "1996-09-22",
        peso_inicial: 58.0,
        altura: 164,
        objetivos: ["Performance esportiva", "Ganhar massa"],
        objetivo_texto: "Atleta de vôlei de praia, foco em potência e resistência.",
        nivel_atividade: "Muito ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Nenhum"],
        alergias: ["Frutos do mar"],
        medicamentos: "",
        suplementos: "Whey Isolado, Eletrólitos",
        refeicoes_por_dia: 5,
        horario_acorda: "06:00",
        horario_dorme: "22:30",
        litros_agua: 3.5,
        atividade_fisica: true,
        atividade_fisica_descricao: "Treino de vôlei na areia 4x + Musculação 3x",
        observacoes: "Alta taxa de sudorese nos treinos sob o sol.",
        consultas: [
          {
            data_consulta: "2026-05-10",
            peso: 58.0,
            cintura: 65,
            quadril: 94,
            percentual_gordura: 17.0,
            proximo_retorno: null, // > 30 dias sem retorno (Alerta!)
            observacoes: "Estratégia de hidratação isotônica introduzida."
          }
        ]
      },
      {
        nome: "Leonardo Xavier Fontes",
        email: "leonardo.fontes@gmail.com",
        whatsapp: "(21) 96666-3333",
        sexo: "Masculino",
        data_nascimento: "1989-12-01",
        peso_inicial: 92.0,
        altura: 185,
        objetivos: ["Emagrecer", "Performance esportiva"],
        objetivo_texto: "Redução do percentual de gordura para ciclismo de estrada.",
        nivel_atividade: "Muito ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Lactose"],
        alergias: ["Nenhum"],
        medicamentos: "",
        suplementos: "Géis de carboidrato, Palatinose, Cafeína",
        refeicoes_por_dia: 4,
        horario_acorda: "05:00",
        horario_dorme: "21:30",
        litros_agua: 3.8,
        atividade_fisica: true,
        atividade_fisica_descricao: "Ciclismo 4x/semana (longões de 80km aos sábados)",
        observacoes: "Reclama de fadiga aos 60km de pedal.",
        consultas: [
          {
            data_consulta: "2026-08-10",
            peso: 89.4,
            cintura: 84,
            quadril: 100,
            percentual_gordura: 15.5,
            proximo_retorno: "2026-09-10",
            observacoes: "Consulta da semana. Adequação da ingestão de 60g carboidrato/hora no pedal."
          }
        ]
      },
      {
        nome: "Isabela Franco Vasques",
        email: "isabela.franco@gmail.com",
        whatsapp: "(21) 95555-4444",
        sexo: "Feminino",
        data_nascimento: "1998-02-14",
        peso_inicial: 64.0,
        altura: 167,
        objetivos: ["Ganhar massa"],
        objetivo_texto: "Hipertrofia de quadríceps e glúteos com percentual de gordura controlado.",
        nivel_atividade: "Muito ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Nenhum"],
        alergias: ["Soja"],
        medicamentos: "",
        suplementos: "Creatina, Whey, Glutamina",
        refeicoes_por_dia: 4,
        horario_acorda: "06:30",
        horario_dorme: "22:30",
        litros_agua: 2.8,
        atividade_fisica: true,
        atividade_fisica_descricao: "Musculação pesada 5x/semana",
        observacoes: "Adesão exemplar à dieta.",
        consultas: [
          {
            data_consulta: "2026-07-15",
            peso: 65.5,
            cintura: 67,
            quadril: 101,
            percentual_gordura: 18.2,
            proximo_retorno: "2026-08-25",
            observacoes: "Ganho sólido de massa magra."
          }
        ]
      },
      {
        nome: "Matheus Borges Rezende",
        email: "matheus.rezende@gmail.com",
        whatsapp: "(21) 94444-5555",
        sexo: "Masculino",
        data_nascimento: "1994-08-03",
        peso_inicial: 76.0,
        altura: 174,
        objetivos: ["Performance esportiva"],
        objetivo_texto: "Corredor de maratona (42km). Foco em glicogênio muscular.",
        nivel_atividade: "Extremamente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Nenhum"],
        alergias: ["Nenhum"],
        medicamentos: "",
        suplementos: "Nitrato de beterraba, Cápsulas de sal",
        refeicoes_por_dia: 5,
        horario_acorda: "04:45",
        horario_dorme: "21:00",
        litros_agua: 4.2,
        atividade_fisica: true,
        atividade_fisica_descricao: "Corrida 5x/semana + Fortalecimento 2x",
        observacoes: "Carga de treinos semanal ultrapassa 70km.",
        consultas: [
          {
            data_consulta: "2026-04-20",
            peso: 76.0,
            cintura: 76,
            quadril: 92,
            percentual_gordura: 10.2,
            proximo_retorno: null, // > 30 dias sem retorno (Alerta!)
            observacoes: "Periodização nutricional para fase de volume."
          }
        ]
      },
      {
        nome: "Priscila Antunes Maia",
        email: "priscila.maia@gmail.com",
        whatsapp: "(21) 93333-6666",
        sexo: "Feminino",
        data_nascimento: "1990-10-18",
        peso_inicial: 70.0,
        altura: 170,
        objetivos: ["Emagrecer", "Performance esportiva"],
        objetivo_texto: "Crossfit competitiva e perda de 4kg de gordura.",
        nivel_atividade: "Muito ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Glúten"],
        alergias: ["Nenhum"],
        medicamentos: "",
        suplementos: "Whey Protein, BCAA, Ômega 3",
        refeicoes_por_dia: 4,
        horario_acorda: "06:00",
        horario_dorme: "22:00",
        litros_agua: 3.0,
        atividade_fisica: true,
        atividade_fisica_descricao: "Crossfit 5x/semana",
        observacoes: "Requer atenção na recuperação muscular e sono.",
        consultas: [
          {
            data_consulta: "2026-08-11",
            peso: 67.8,
            cintura: 72,
            quadril: 98,
            percentual_gordura: 19.8,
            proximo_retorno: "2026-09-11",
            observacoes: "Consulta da semana. Ganho de força nos movimentos de LPO."
          }
        ]
      },
      {
        nome: "Rodrigo Toledo Brandão",
        email: "rodrigo.brandao@gmail.com",
        whatsapp: "(21) 92222-7777",
        sexo: "Masculino",
        data_nascimento: "1983-05-29",
        peso_inicial: 98.0,
        altura: 181,
        objetivos: ["Emagrecer", "Saúde geral"],
        objetivo_texto: "Retorno aos esportes após cirurgia de menisco.",
        nivel_atividade: "Levemente ativo",
        patologias: ["Hipertensão"],
        restricoes_alimentares: ["Carne vermelha"],
        alergias: ["Nenhum"],
        medicamentos: "Enalapril 10mg",
        suplementos: "Colágeno tipo II, Cúrcuma",
        refeicoes_por_dia: 3,
        horario_acorda: "07:00",
        horario_dorme: "23:00",
        litros_agua: 2.5,
        atividade_fisica: true,
        atividade_fisica_descricao: "Natação e fisioterapia 3x/semana",
        observacoes: "Paciente dedicado à recuperação do joelho.",
        consultas: [
          {
            data_consulta: "2026-07-22",
            peso: 95.1,
            cintura: 98,
            quadril: 106,
            percentual_gordura: 26.0,
            proximo_retorno: "2026-08-22",
            observacoes: "Menos dores articulares e peso diminuindo de forma consistente."
          }
        ]
      },
      {
        nome: "Tatiana Silveira Ramos",
        email: "tatiana.silveira@gmail.com",
        whatsapp: "(21) 91111-8888",
        sexo: "Feminino",
        data_nascimento: "1995-03-12",
        peso_inicial: 61.0,
        altura: 162,
        objetivos: ["Ganhar massa", "Reeducação alimentar"],
        objetivo_texto: "Aumento de massa muscular sem desconforto gastrointestinal.",
        nivel_atividade: "Moderadamente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Lactose", "Glúten"],
        alergias: ["Leite", "Trigo"],
        medicamentos: "",
        suplementos: "Enzimas digestivas, Whey Hidrolisado",
        refeicoes_por_dia: 4,
        horario_acorda: "06:30",
        horario_dorme: "22:30",
        litros_agua: 2.2,
        atividade_fisica: true,
        atividade_fisica_descricao: "Musculação 4x/semana",
        observacoes: "Muito sensível a alimentos fermentáveis (FODMAPs).",
        consultas: [
          {
            data_consulta: "2026-08-05",
            peso: 62.4,
            cintura: 68,
            quadril: 96,
            percentual_gordura: 21.5,
            proximo_retorno: "2026-09-05",
            observacoes: "Dieta low FODMAP com excelentes resultados na disposição."
          }
        ]
      },
      {
        nome: "Vinícius Peixoto Correa",
        email: "vinicius.correa@gmail.com",
        whatsapp: "(21) 90000-9999",
        sexo: "Masculino",
        data_nascimento: "2001-11-09",
        peso_inicial: 72.0,
        altura: 176,
        objetivos: ["Ganhar massa"],
        objetivo_texto: "Estudante de Educação Física buscando ganho muscular expressivo.",
        nivel_atividade: "Muito ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Nenhum"],
        alergias: ["Nenhum"],
        medicamentos: "",
        suplementos: "Hipercalórico caseiro, Creatina, Multivitamínico",
        refeicoes_por_dia: 5,
        horario_acorda: "06:00",
        horario_dorme: "23:00",
        litros_agua: 3.2,
        atividade_fisica: true,
        atividade_fisica_descricao: "Musculação 6x/semana (Push/Pull/Legs)",
        observacoes: "Metabolismo muito acelerado.",
        consultas: [
          {
            data_consulta: "2026-08-13",
            peso: 74.5,
            cintura: 77,
            quadril: 96,
            percentual_gordura: 12.0,
            proximo_retorno: "2026-09-13",
            observacoes: "Consulta da semana. Ganho de 2,5kg de peso com manutenção do percentual de gordura."
          }
        ]
      },
      {
        nome: "Renata Lemos Medeiros",
        email: "renata.medeiros@gmail.com",
        whatsapp: "(21) 98765-1234",
        sexo: "Feminino",
        data_nascimento: "1987-07-04",
        peso_inicial: 66.0,
        altura: 165,
        objetivos: ["Saúde geral", "Emagrecer"],
        objetivo_texto: "Melhora do condicionamento para corrida e controle de peso.",
        nivel_atividade: "Moderadamente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Açúcar"],
        alergias: ["Amendoim"],
        medicamentos: "",
        suplementos: "Vitamina C, Zinco, Magnésio",
        refeicoes_por_dia: 4,
        horario_acorda: "06:15",
        horario_dorme: "22:15",
        litros_agua: 2.6,
        atividade_fisica: true,
        atividade_fisica_descricao: "Corrida 3x/semana + Treino funcional 2x",
        observacoes: "Rotina equilibrada, busca longevidade e energia.",
        consultas: [
          {
            data_consulta: "2026-06-15",
            peso: 64.2,
            cintura: 73,
            quadril: 99,
            percentual_gordura: 23.4,
            proximo_retorno: "2026-07-15", // Retorno vencido > 30 dias (Alerta!)
            observacoes: "Consulta anterior com boa evolução."
          }
        ]
      }
    ]
  },
  {
    nome: "Dra. Beatriz Guimarães",
    email: "beatriz.guimaraes@lopesnutri.com",
    especialidade: "Saúde da Mulher, Fertilidade e SOP",
    pacientes: [
      {
        nome: "Camila Viana Montenegro",
        email: "camila.viana@gmail.com",
        whatsapp: "(31) 98888-2222",
        sexo: "Feminino",
        data_nascimento: "1996-04-18",
        peso_inicial: 72.0,
        altura: 163,
        objetivos: ["Controlar diabetes", "Emagrecer"],
        objetivo_texto: "Tratamento nutricional para Síndrome do Ovário Policístico (SOP) e resistência à insulina.",
        nivel_atividade: "Moderadamente ativo",
        patologias: ["Síndrome do ovário policístico"],
        restricoes_alimentares: ["Açúcar", "Glúten"],
        alergias: ["Nenhum"],
        medicamentos: "Inositol 2g, Metformina 500mg",
        suplementos: "Coenzima Q10, Ômega 3, Vitamina D",
        refeicoes_por_dia: 4,
        horario_acorda: "06:45",
        horario_dorme: "22:30",
        litros_agua: 2.7,
        atividade_fisica: true,
        atividade_fisica_descricao: "Musculação 4x/semana",
        observacoes: "Queixas de acne e ciclo menstrual desregulado.",
        consultas: [
          {
            data_consulta: "2026-08-12",
            peso: 69.5,
            cintura: 78,
            quadril: 102,
            percentual_gordura: 27.5,
            proximo_retorno: "2026-09-12",
            observacoes: "Consulta da semana. Ciclo menstrual regularizado após 60 dias de plano anti-inflamatório."
          }
        ]
      },
      {
        nome: "Débora Esteves Prado",
        email: "debora.esteves@gmail.com",
        whatsapp: "(31) 97777-3333",
        sexo: "Feminino",
        data_nascimento: "1991-01-28",
        peso_inicial: 65.0,
        altura: 160,
        objetivos: ["Saúde geral", "Reeducação alimentar"],
        objetivo_texto: "Preparação nutricional para gestação (tentante).",
        nivel_atividade: "Levemente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Carne vermelha"],
        alergias: ["Nenhum"],
        medicamentos: "",
        suplementos: "Metilfolato 800mcg, Ferro Quelato, DHA",
        refeicoes_por_dia: 4,
        horario_acorda: "07:00",
        horario_dorme: "22:00",
        litros_agua: 2.5,
        atividade_fisica: true,
        atividade_fisica_descricao: "Pilates 2x/semana",
        observacoes: "Exames de sangue pré-concepcionais excelentes.",
        consultas: [
          {
            data_consulta: "2026-07-20",
            peso: 64.2,
            cintura: 72,
            quadril: 98,
            percentual_gordura: 25.0,
            proximo_retorno: "2026-08-20",
            observacoes: "Ajuste na oferta de colina e micronutrientes pré-natais."
          }
        ]
      },
      {
        nome: "Juliana Peçanha Bastos",
        email: "juliana.bastos@gmail.com",
        whatsapp: "(31) 96666-4444",
        sexo: "Feminino",
        data_nascimento: "1984-11-15",
        peso_inicial: 77.0,
        altura: 166,
        objetivos: ["Emagrecer", "Saúde geral"],
        objetivo_texto: "Manejo de sintomas do climatério e prevenção de osteoporose.",
        nivel_atividade: "Sedentário",
        patologias: ["Hipotireoidismo"],
        restricoes_alimentares: ["Lactose"],
        alergias: ["Nenhum"],
        medicamentos: "Levotiroxina 75mcg",
        suplementos: "Cálcio Citrato Malato, Vitamina K2, Magnésio Dimalato",
        refeicoes_por_dia: 3,
        horario_acorda: "06:30",
        horario_dorme: "23:00",
        litros_agua: 2.0,
        atividade_fisica: false,
        atividade_fisica_descricao: "",
        observacoes: "Fogachos noturnos e retenção hídrica.",
        consultas: [
          {
            data_consulta: "2026-05-08",
            peso: 77.0,
            cintura: 86,
            quadril: 107,
            percentual_gordura: 33.0,
            proximo_retorno: null, // > 30 dias sem retorno (Alerta!)
            observacoes: "Introdução de fitoestrógenos naturais na dieta (linhaça e tofu)."
          }
        ]
      },
      {
        nome: "Larissa Bueno Antunes",
        email: "larissa.bueno@gmail.com",
        whatsapp: "(31) 95555-5555",
        sexo: "Feminino",
        data_nascimento: "1999-07-22",
        peso_inicial: 59.0,
        altura: 162,
        objetivos: ["Reeducação alimentar"],
        objetivo_texto: "Alívio de sintomas de TPM intensa e enxaqueca hormonal.",
        nivel_atividade: "Moderadamente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Açúcar"],
        alergias: ["Amendoim"],
        medicamentos: "",
        suplementos: "Óleo de Prímula, Complexo B, Vitamina E",
        refeicoes_por_dia: 4,
        horario_acorda: "07:00",
        horario_dorme: "22:30",
        litros_agua: 2.3,
        atividade_fisica: true,
        atividade_fisica_descricao: "Musculação 3x/semana + Dança 2x",
        observacoes: "Picos de compulsão por chocolate na fase lútea.",
        consultas: [
          {
            data_consulta: "2026-08-14",
            peso: 58.1,
            cintura: 67,
            quadril: 95,
            percentual_gordura: 22.0,
            proximo_retorno: "2026-09-14",
            observacoes: "Consulta da semana. Melhora expressiva da enxaqueca com cacau 85% e magnésio."
          }
        ]
      },
      {
        nome: "Marina Sampaio Valente",
        email: "marina.valente@gmail.com",
        whatsapp: "(31) 94444-6666",
        sexo: "Feminino",
        data_nascimento: "1993-09-09",
        peso_inicial: 84.0,
        altura: 168,
        objetivos: ["Emagrecer", "Controlar diabetes"],
        objetivo_texto: "Tratamento de SOP associado a esteatose hepática grau I.",
        nivel_atividade: "Sedentário",
        patologias: ["Síndrome do ovário policístico", "Colesterol alto"],
        restricoes_alimentares: ["Glúten", "Açúcar"],
        alergias: ["Nenhum"],
        medicamentos: "Metformina 850mg",
        suplementos: "Berberina 500mg, Silimarina",
        refeicoes_por_dia: 3,
        horario_acorda: "07:30",
        horario_dorme: "23:30",
        litros_agua: 2.0,
        atividade_fisica: false,
        atividade_fisica_descricao: "",
        observacoes: "Dificuldade de perder peso na região abdominal.",
        consultas: [
          {
            data_consulta: "2026-04-15",
            peso: 84.0,
            cintura: 94,
            quadril: 112,
            percentual_gordura: 35.8,
            proximo_retorno: null, // > 30 dias sem retorno (Alerta!)
            observacoes: "Primeira consulta de diagnóstico integrativo."
          }
        ]
      },
      {
        nome: "Natália Rezende Furtado",
        email: "natalia.furtado@gmail.com",
        whatsapp: "(31) 93333-7777",
        sexo: "Feminino",
        data_nascimento: "1997-12-30",
        peso_inicial: 54.0,
        altura: 159,
        objetivos: ["Saúde geral", "Reeducação alimentar"],
        objetivo_texto: "Tratamento de gastrite nervosa e constipação crônica.",
        nivel_atividade: "Levemente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Lactose"],
        alergias: ["Nenhum"],
        medicamentos: "",
        suplementos: "Glutamina, Probióticos, Fibras prebióticas",
        refeicoes_por_dia: 4,
        horario_acorda: "06:30",
        horario_dorme: "22:00",
        litros_agua: 2.8,
        atividade_fisica: true,
        atividade_fisica_descricao: "Caminhadas diárias e Yoga",
        observacoes: "Sensibilidade estomacal a café e alimentos ácidos.",
        consultas: [
          {
            data_consulta: "2026-07-29",
            peso: 54.8,
            cintura: 64,
            quadril: 91,
            percentual_gordura: 21.0,
            proximo_retorno: "2026-08-29",
            observacoes: "Função intestinal normalizada (Escala de Bristol tipo 4)."
          }
        ]
      },
      {
        nome: "Paula Nogueira Fagundes",
        email: "paula.fagundes@gmail.com",
        whatsapp: "(31) 92222-8888",
        sexo: "Feminino",
        data_nascimento: "1988-06-11",
        peso_inicial: 68.0,
        altura: 161,
        objetivos: ["Emagrecer"],
        objetivo_texto: "Emagrecimento sustentável com foco em manutenção pós-dieta.",
        nivel_atividade: "Moderadamente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Nenhum"],
        alergias: ["Frutos do mar"],
        medicamentos: "",
        suplementos: "Colágeno Verisol, Vitamina C",
        refeicoes_por_dia: 4,
        horario_acorda: "06:00",
        horario_dorme: "22:30",
        litros_agua: 2.5,
        atividade_fisica: true,
        atividade_fisica_descricao: "Musculação 4x/semana",
        observacoes: "Paciente focada e sem histórico de efeito sanfona nos últimos meses.",
        consultas: [
          {
            data_consulta: "2026-08-02",
            peso: 65.5,
            cintura: 74,
            quadril: 100,
            percentual_gordura: 26.2,
            proximo_retorno: "2026-09-02",
            observacoes: "Evolução exemplar com perda de gordura e ganho de massa magra."
          }
        ]
      },
      {
        nome: "Roberta Caldeira Brandão",
        email: "roberta.brandao@gmail.com",
        whatsapp: "(31) 91111-9999",
        sexo: "Feminino",
        data_nascimento: "1994-03-25",
        peso_inicial: 63.0,
        altura: 165,
        objetivos: ["Ganhar massa", "Performance esportiva"],
        objetivo_texto: "Aumento de tônus muscular e definição corporal para o verão.",
        nivel_atividade: "Muito ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Nenhum"],
        alergias: ["Nenhum"],
        medicamentos: "",
        suplementos: "Whey Protein, Creatina 3g",
        refeicoes_por_dia: 5,
        horario_acorda: "06:15",
        horario_dorme: "22:45",
        litros_agua: 3.0,
        atividade_fisica: true,
        atividade_fisica_descricao: "Crossfit 4x/semana + Natação 1x",
        observacoes: "Boa resposta ao superávit calórico controlado.",
        consultas: [
          {
            data_consulta: "2026-08-11",
            peso: 64.2,
            cintura: 68,
            quadril: 98,
            percentual_gordura: 19.0,
            proximo_retorno: "2026-09-11",
            observacoes: "Consulta da semana. Ganho visível de massa em membros superiores e inferiores."
          }
        ]
      },
      {
        nome: "Sabrina Toledo Gusmão",
        email: "sabrina.gusmao@gmail.com",
        whatsapp: "(31) 90000-0000",
        sexo: "Feminino",
        data_nascimento: "1990-08-14",
        peso_inicial: 79.0,
        altura: 167,
        objetivos: ["Emagrecer", "Saúde geral"],
        objetivo_texto: "Controle de compulsão alimentar e ansiedade.",
        nivel_atividade: "Levemente ativo",
        patologias: ["Hipotireoidismo"],
        restricoes_alimentares: ["Glúten"],
        alergias: ["Nenhum"],
        medicamentos: "Puran T4 75mcg",
        suplementos: "5-HTP 100mg, Passiflora, Magnésio Inositol",
        refeicoes_por_dia: 4,
        horario_acorda: "07:15",
        horario_dorme: "23:15",
        litros_agua: 2.2,
        atividade_fisica: true,
        atividade_fisica_descricao: "Caminhadas 3x/semana",
        observacoes: "Acompanhamento multidisciplinar com psicólogo.",
        consultas: [
          {
            data_consulta: "2026-06-25",
            peso: 77.2,
            cintura: 82,
            quadril: 106,
            percentual_gordura: 31.0,
            proximo_retorno: "2026-07-25", // > 30 dias sem retorno (Alerta!)
            observacoes: "Menor frequência de episódios de compulsão noturna."
          }
        ]
      },
      {
        nome: "Vanessa Queiroz Lacerda",
        email: "vanessa.lacerda@gmail.com",
        whatsapp: "(31) 98765-4322",
        sexo: "Feminino",
        data_nascimento: "1995-10-05",
        peso_inicial: 60.0,
        altura: 164,
        objetivos: ["Reeducação alimentar", "Saúde geral"],
        objetivo_texto: "Alimentação vegetariana estrita balanceada com foco em ferro e B12.",
        nivel_atividade: "Moderadamente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Carne vermelha", "Frutos do mar"],
        alergias: ["Nenhum"],
        medicamentos: "",
        suplementos: "Metilcobalamina B12 1000mcg, Ferro quelato, Zinco",
        refeicoes_por_dia: 4,
        horario_acorda: "06:30",
        horario_dorme: "22:30",
        litros_agua: 2.5,
        atividade_fisica: true,
        atividade_fisica_descricao: "Musculação 3x + Corrida 2x",
        observacoes: "Vegetariana há 4 anos.",
        consultas: [
          {
            data_consulta: "2026-08-08",
            peso: 60.5,
            cintura: 66,
            quadril: 96,
            percentual_gordura: 21.0,
            proximo_retorno: "2026-09-08",
            observacoes: "Exames de sangue indicam B12 e ferritina em níveis ótimos."
          }
        ]
      }
    ]
  },
  {
    nome: "Dr. Lucas Mendonça",
    email: "lucas.mendonca@lopesnutri.com",
    especialidade: "Comportamento Alimentar e Longevidade",
    pacientes: [
      {
        nome: "Arthur Meireles Cunha",
        email: "arthur.meireles@gmail.com",
        whatsapp: "(41) 98888-3333",
        sexo: "Masculino",
        data_nascimento: "1982-07-19",
        peso_inicial: 90.0,
        altura: 177,
        objetivos: ["Reeducação alimentar", "Saúde geral"],
        objetivo_texto: "Mudança definitiva de hábitos alimentares sem dietas restritivas.",
        nivel_atividade: "Levemente ativo",
        patologias: ["Hipertensão"],
        restricoes_alimentares: ["Açúcar"],
        alergias: ["Nenhum"],
        medicamentos: "Candar 16mg",
        suplementos: "Ômega 3, Coenzima Q10",
        refeicoes_por_dia: 3,
        horario_acorda: "06:30",
        horario_dorme: "23:00",
        litros_agua: 2.2,
        atividade_fisica: true,
        atividade_fisica_descricao: "Natação 2x/semana",
        observacoes: "Paciente executivo com frequentes almoços de negócios.",
        consultas: [
          {
            data_consulta: "2026-08-13",
            peso: 87.2,
            cintura: 91,
            quadril: 103,
            percentual_gordura: 24.5,
            proximo_retorno: "2026-09-13",
            observacoes: "Consulta da semana. Excelente adaptação na escolha de pratos em restaurantes."
          }
        ]
      },
      {
        nome: "Bianca Duarte Alencar",
        email: "bianca.alencar@gmail.com",
        whatsapp: "(41) 97777-4444",
        sexo: "Feminino",
        data_nascimento: "1997-05-14",
        peso_inicial: 63.0,
        altura: 166,
        objetivos: ["Reeducação alimentar"],
        objetivo_texto: "Trabalhar a relação com a comida e superar o comer emocional.",
        nivel_atividade: "Moderadamente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Nenhum"],
        alergias: ["Lactose"],
        medicamentos: "",
        suplementos: "Triptofano, Magnésio",
        refeicoes_por_dia: 4,
        horario_acorda: "07:00",
        horario_dorme: "22:30",
        litros_agua: 2.0,
        atividade_fisica: true,
        atividade_fisica_descricao: "Pilates e Dança contemporânea",
        observacoes: "Prática de Mindfulness alimentar (Mindful Eating).",
        consultas: [
          {
            data_consulta: "2026-07-18",
            peso: 61.5,
            cintura: 69,
            quadril: 97,
            percentual_gordura: 23.0,
            proximo_retorno: "2026-08-18",
            observacoes: "Redução do sentimento de culpa associado à alimentação."
          }
        ]
      },
      {
        nome: "Caio Fernando Silveira",
        email: "caio.silveira@gmail.com",
        whatsapp: "(41) 96666-5555",
        sexo: "Masculino",
        data_nascimento: "1990-12-08",
        peso_inicial: 85.0,
        altura: 179,
        objetivos: ["Ganhar massa", "Saúde geral"],
        objetivo_texto: "Ganho de força e energia para a rotina diária de trabalho.",
        nivel_atividade: "Moderadamente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Nenhum"],
        alergias: ["Nenhum"],
        medicamentos: "",
        suplementos: "Creatina, Multivitamínico",
        refeicoes_por_dia: 4,
        horario_acorda: "06:15",
        horario_dorme: "22:45",
        litros_agua: 2.8,
        atividade_fisica: true,
        atividade_fisica_descricao: "Musculação 4x/semana",
        observacoes: "Apresenta boa consistência.",
        consultas: [
          {
            data_consulta: "2026-04-30",
            peso: 85.0,
            cintura: 83,
            quadril: 99,
            percentual_gordura: 18.0,
            proximo_retorno: null, // > 30 dias sem retorno (Alerta!)
            observacoes: "Plano hipercalórico moderado."
          }
        ]
      },
      {
        nome: "Daniela Xavier Antunes",
        email: "daniela.antunes@gmail.com",
        whatsapp: "(41) 95555-6666",
        sexo: "Feminino",
        data_nascimento: "1986-09-27",
        peso_inicial: 71.0,
        altura: 163,
        objetivos: ["Emagrecer", "Saúde geral"],
        objetivo_texto: "Manutenção da saúde metabólica e controle de peso na maturidade.",
        nivel_atividade: "Levemente ativo",
        patologias: ["Colesterol alto"],
        restricoes_alimentares: ["Açúcar"],
        alergias: ["Nenhum"],
        medicamentos: "Sinvastatina 10mg",
        suplementos: "Fitoesteróis, Ômega 3",
        refeicoes_por_dia: 3,
        horario_acorda: "06:45",
        horario_dorme: "22:15",
        litros_agua: 2.2,
        atividade_fisica: true,
        atividade_fisica_descricao: "Caminhadas 4x/semana",
        observacoes: "Preferência por alimentos integrais e verduras orgânicas.",
        consultas: [
          {
            data_consulta: "2026-08-14",
            peso: 68.4,
            cintura: 77,
            quadril: 101,
            percentual_gordura: 27.2,
            proximo_retorno: "2026-09-14",
            observacoes: "Consulta da semana. Redução de 2,6kg e colesterol LDL em queda."
          }
        ]
      },
      {
        nome: "Eduardo Castro Lins",
        email: "eduardo.lins@gmail.com",
        whatsapp: "(41) 94444-7777",
        sexo: "Masculino",
        data_nascimento: "1995-02-03",
        peso_inicial: 96.0,
        altura: 183,
        objetivos: ["Emagrecer"],
        objetivo_texto: "Perda de 12kg com acompanhamento comportamental.",
        nivel_atividade: "Sedentário",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Carne vermelha"],
        alergias: ["Frutos do mar"],
        medicamentos: "",
        suplementos: "",
        refeicoes_por_dia: 3,
        horario_acorda: "07:30",
        horario_dorme: "23:45",
        litros_agua: 1.8,
        atividade_fisica: false,
        atividade_fisica_descricao: "",
        observacoes: "Trabalho em home office com facilidade para petiscar o dia todo.",
        consultas: [
          {
            data_consulta: "2026-05-12",
            peso: 96.0,
            cintura: 101,
            quadril: 108,
            percentual_gordura: 29.0,
            proximo_retorno: null, // > 30 dias sem retorno (Alerta!)
            observacoes: "Estratégia de distanciamento de snacks do escritório."
          }
        ]
      },
      {
        nome: "Flávia Montenegro Prado",
        email: "flavia.prado@gmail.com",
        whatsapp: "(41) 93333-8888",
        sexo: "Feminino",
        data_nascimento: "1992-10-21",
        peso_inicial: 57.0,
        altura: 161,
        objetivos: ["Reeducação alimentar", "Saúde geral"],
        objetivo_texto: "Alimentação intuitiva e fortalecimento da imunidade.",
        nivel_atividade: "Moderadamente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Glúten"],
        alergias: ["Trigo"],
        medicamentos: "",
        suplementos: "Vitamina C, Própolis verde, Zinco",
        refeicoes_por_dia: 4,
        horario_acorda: "06:00",
        horario_dorme: "22:00",
        litros_agua: 2.5,
        atividade_fisica: true,
        atividade_fisica_descricao: "Yoga e Corrida leve",
        observacoes: "Excelente bem-estar relatado.",
        consultas: [
          {
            data_consulta: "2026-08-04",
            peso: 56.5,
            cintura: 65,
            quadril: 93,
            percentual_gordura: 20.8,
            proximo_retorno: "2026-09-04",
            observacoes: "Sem episódios de rinite alérgica após retirada do trigo."
          }
        ]
      },
      {
        nome: "Gustavo Henrique Pires",
        email: "gustavo.pires@gmail.com",
        whatsapp: "(41) 92222-9999",
        sexo: "Masculino",
        data_nascimento: "1988-04-16",
        peso_inicial: 81.0,
        altura: 176,
        objetivos: ["Performance esportiva", "Ganhar massa"],
        objetivo_texto: "Treinos de corrida de montanha (Trail Run).",
        nivel_atividade: "Extremamente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Nenhum"],
        alergias: ["Nenhum"],
        medicamentos: "",
        suplementos: "Palatinose, TCM, Eletrólitos",
        refeicoes_por_dia: 5,
        horario_acorda: "05:00",
        horario_dorme: "21:30",
        litros_agua: 3.6,
        atividade_fisica: true,
        atividade_fisica_descricao: "Trail running 4x/semana + Funcional 2x",
        observacoes: "Atleta amador dedicado.",
        consultas: [
          {
            data_consulta: "2026-08-10",
            peso: 79.2,
            cintura: 78,
            quadril: 95,
            percentual_gordura: 13.5,
            proximo_retorno: "2026-09-10",
            observacoes: "Consulta da semana. Preparação para prova de 21k na serra."
          }
        ]
      },
      {
        nome: "Helena Bastos Siqueira",
        email: "helena.bastos@gmail.com",
        whatsapp: "(41) 91111-0000",
        sexo: "Feminino",
        data_nascimento: "1998-01-30",
        peso_inicial: 66.0,
        altura: 168,
        objetivos: ["Emagrecer", "Reeducação alimentar"],
        objetivo_texto: "Construção de autonomia na cozinha e perda de gordura.",
        nivel_atividade: "Levemente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Lactose"],
        alergias: ["Nenhum"],
        medicamentos: "",
        suplementos: "Vitamina D, Ômega 3",
        refeicoes_por_dia: 4,
        horario_acorda: "07:00",
        horario_dorme: "23:00",
        litros_agua: 2.3,
        atividade_fisica: true,
        atividade_fisica_descricao: "Musculação 3x/semana",
        observacoes: "Aprendeu a preparar marmitas saudáveis para a semana toda.",
        consultas: [
          {
            data_consulta: "2026-07-25",
            peso: 63.8,
            cintura: 71,
            quadril: 99,
            percentual_gordura: 24.0,
            proximo_retorno: "2026-08-25",
            observacoes: "Evolução constante e sem estresse alimentar."
          }
        ]
      },
      {
        nome: "Igor Valença Medeiros",
        email: "igor.valenca@gmail.com",
        whatsapp: "(41) 90000-1111",
        sexo: "Masculino",
        data_nascimento: "1993-08-12",
        peso_inicial: 88.0,
        altura: 181,
        objetivos: ["Reeducação alimentar"],
        objetivo_texto: "Alimentação para aumento de foco cognitivo e produtividade.",
        nivel_atividade: "Moderadamente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Açúcar"],
        alergias: ["Nenhum"],
        medicamentos: "",
        suplementos: "Lion's Mane, Ômega 3 EPA/DHA, Tirosina",
        refeicoes_por_dia: 3,
        horario_acorda: "06:30",
        horario_dorme: "22:30",
        litros_agua: 3.0,
        atividade_fisica: true,
        atividade_fisica_descricao: "Musculação e esteira 4x/semana",
        observacoes: "Programador com longas horas de foco em tela.",
        consultas: [
          {
            data_consulta: "2026-06-10",
            peso: 86.5,
            cintura: 84,
            quadril: 101,
            percentual_gordura: 19.5,
            proximo_retorno: "2026-07-10", // > 30 dias sem retorno (Alerta!)
            observacoes: "Clareza mental melhorada significativamente."
          }
        ]
      },
      {
        nome: "Jéssica Prado Nogueira",
        email: "jessica.nogueira@gmail.com",
        whatsapp: "(41) 98765-9876",
        sexo: "Feminino",
        data_nascimento: "1991-11-04",
        peso_inicial: 62.0,
        altura: 162,
        objetivos: ["Saúde geral", "Reeducação alimentar"],
        objetivo_texto: "Melhora da digestão e sensação de leveza diária.",
        nivel_atividade: "Moderadamente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Glúten", "Lactose"],
        alergias: ["Leite"],
        medicamentos: "",
        suplementos: "Enzimas digestivas, Chá verde, Gengibre",
        refeicoes_por_dia: 4,
        horario_acorda: "06:15",
        horario_dorme: "22:15",
        litros_agua: 2.4,
        atividade_fisica: true,
        atividade_fisica_descricao: "Pilates 3x/semana",
        observacoes: "Paciente disciplinada e adepta de chás digestivos.",
        consultas: [
          {
            data_consulta: "2026-08-12",
            peso: 60.8,
            cintura: 67,
            quadril: 96,
            percentual_gordura: 22.4,
            proximo_retorno: "2026-09-12",
            observacoes: "Consulta da semana. Sem queixas de distensão abdominal."
          }
        ]
      }
    ]
  },
  {
    nome: "Dra. Juliana Paes Ribeiro",
    email: "juliana.ribeiro@lopesnutri.com",
    especialidade: "Nutrição Clínica, Diabetes e Longevidade",
    pacientes: [
      {
        nome: "Antônio Carlos Figueiredo",
        email: "antonio.figueiredo@gmail.com",
        whatsapp: "(51) 98888-4444",
        sexo: "Masculino",
        data_nascimento: "1968-03-22",
        peso_inicial: 89.0,
        altura: 173,
        objetivos: ["Controlar diabetes", "Saúde geral"],
        objetivo_texto: "Controle de Diabetes Tipo 2 e redução da hemoglobina glicada (HbA1c).",
        nivel_atividade: "Levemente ativo",
        patologias: ["Diabetes", "Hipertensão"],
        restricoes_alimentares: ["Açúcar"],
        alergias: ["Nenhum"],
        medicamentos: "Metformina 850mg (2x/dia), Gliclazida 30mg",
        suplementos: "Cromo Picolinato 200mcg, Canela em pó, Ácido Alfa-Lipóico",
        refeicoes_por_dia: 4,
        horario_acorda: "06:00",
        horario_dorme: "22:00",
        litros_agua: 2.2,
        atividade_fisica: true,
        atividade_fisica_descricao: "Caminhadas diárias 45 minutos pela manhã",
        observacoes: "Glicemia de jejum reduziu de 160 para 110 mg/dL.",
        consultas: [
          {
            data_consulta: "2026-08-11",
            peso: 85.8,
            cintura: 94,
            quadril: 104,
            percentual_gordura: 26.5,
            proximo_retorno: "2026-09-11",
            observacoes: "Consulta da semana. HbA1c caiu de 7.8% para 6.6%."
          }
        ]
      },
      {
        nome: "Beatriz Gusmão Toledo",
        email: "beatriz.toledo@gmail.com",
        whatsapp: "(51) 97777-5555",
        sexo: "Feminino",
        data_nascimento: "1975-09-15",
        peso_inicial: 78.0,
        altura: 162,
        objetivos: ["Emagrecer", "Controlar diabetes"],
        objetivo_texto: "Reversão de esteatose hepática e pré-diabetes.",
        nivel_atividade: "Sedentário",
        patologias: ["Diabetes", "Colesterol alto"],
        restricoes_alimentares: ["Açúcar", "Carne vermelha"],
        alergias: ["Nenhum"],
        medicamentos: "Metformina 500mg",
        suplementos: "Vitamina E, Ômega 3 1000mg",
        refeicoes_por_dia: 3,
        horario_acorda: "07:15",
        horario_dorme: "23:00",
        litros_agua: 2.0,
        atividade_fisica: false,
        atividade_fisica_descricao: "",
        observacoes: "Histórico familiar de complicações de diabetes.",
        consultas: [
          {
            data_consulta: "2026-05-18",
            peso: 78.0,
            cintura: 90,
            quadril: 108,
            percentual_gordura: 35.0,
            proximo_retorno: null, // > 30 dias sem retorno (Alerta!)
            observacoes: "Orientações sobre contagem de carboidratos."
          }
        ]
      },
      {
        nome: "Cláudio Roberto Silveira",
        email: "claudio.silveira@gmail.com",
        whatsapp: "(51) 96666-6666",
        sexo: "Masculino",
        data_nascimento: "1972-12-05",
        peso_inicial: 93.0,
        altura: 178,
        objetivos: ["Saúde geral", "Emagrecer"],
        objetivo_texto: "Prevenção cardiovascular e controle de triglicerídeos.",
        nivel_atividade: "Levemente ativo",
        patologias: ["Colesterol alto", "Hipertensão"],
        restricoes_alimentares: ["Açúcar"],
        alergias: ["Frutos do mar"],
        medicamentos: "Ciprofibrato 100mg, Losartana 50mg",
        suplementos: "Niacina, Alho desidratado",
        refeicoes_por_dia: 3,
        horario_acorda: "06:30",
        horario_dorme: "22:30",
        litros_agua: 2.5,
        atividade_fisica: true,
        atividade_fisica_descricao: "Bicicleta ergométrica 3x/semana",
        observacoes: "Triglicerídeos estavam acima de 350 mg/dL na anamnese inicial.",
        consultas: [
          {
            data_consulta: "2026-07-28",
            peso: 89.6,
            cintura: 96,
            quadril: 105,
            percentual_gordura: 27.0,
            proximo_retorno: "2026-08-28",
            observacoes: "Triglicerídeos reduziram para 180 mg/dL após corte de álcool e açúcares."
          }
        ]
      },
      {
        nome: "Denise Amaral Fontoura",
        email: "denise.fontoura@gmail.com",
        whatsapp: "(51) 95555-7777",
        sexo: "Feminino",
        data_nascimento: "1980-08-11",
        peso_inicial: 70.0,
        altura: 160,
        objetivos: ["Emagrecer", "Saúde geral"],
        objetivo_texto: "Emagrecimento com foco em preservação de massa muscular.",
        nivel_atividade: "Moderadamente ativo",
        patologias: ["Hipotireoidismo"],
        restricoes_alimentares: ["Glúten"],
        alergias: ["Trigo"],
        medicamentos: "Levotiroxina 50mcg",
        suplementos: "Selênio, Zinco, Vitamina D3",
        refeicoes_por_dia: 4,
        horario_acorda: "06:00",
        horario_dorme: "22:00",
        litros_agua: 2.4,
        atividade_fisica: true,
        atividade_fisica_descricao: "Musculação 3x/semana + Pilates 2x",
        observacoes: "Excelente evolução.",
        consultas: [
          {
            data_consulta: "2026-08-14",
            peso: 66.8,
            cintura: 76,
            quadril: 101,
            percentual_gordura: 28.0,
            proximo_retorno: "2026-09-14",
            observacoes: "Consulta da semana. TSH estabilizado em 1.8."
          }
        ]
      },
      {
        nome: "Ernesto Valadão Pires",
        email: "ernesto.valadao@gmail.com",
        whatsapp: "(51) 94444-8888",
        sexo: "Masculino",
        data_nascimento: "1965-05-30",
        peso_inicial: 102.0,
        altura: 175,
        objetivos: ["Controlar diabetes", "Emagrecer"],
        objetivo_texto: "Tratamento de síndrome metabólica.",
        nivel_atividade: "Sedentário",
        patologias: ["Diabetes", "Hipertensão", "Colesterol alto"],
        restricoes_alimentares: ["Açúcar", "Carne vermelha"],
        alergias: ["Nenhum"],
        medicamentos: "Insulina NPH (noite), Metformina 1000mg, Enalapril",
        suplementos: "Ômega 3",
        refeicoes_por_dia: 3,
        horario_acorda: "07:00",
        horario_dorme: "23:00",
        litros_agua: 1.8,
        atividade_fisica: false,
        atividade_fisica_descricao: "",
        observacoes: "Necessita de acompanhamento rigoroso de glicemia capilar.",
        consultas: [
          {
            data_consulta: "2026-04-10",
            peso: 102.0,
            cintura: 114,
            quadril: 118,
            percentual_gordura: 36.5,
            proximo_retorno: null, // > 30 dias sem retorno (Alerta!)
            observacoes: "Ajuste na quantidade de carboidratos do jantar."
          }
        ]
      },
      {
        nome: "Fátima Regina Dornelles",
        email: "fatima.dornelles@gmail.com",
        whatsapp: "(51) 93333-9999",
        sexo: "Feminino",
        data_nascimento: "1978-02-17",
        peso_inicial: 68.0,
        altura: 158,
        objetivos: ["Saúde geral", "Reeducação alimentar"],
        objetivo_texto: "Alimentação cardioprotetora e anti-inflamatória.",
        nivel_atividade: "Levemente ativo",
        patologias: ["Hipertensão"],
        restricoes_alimentares: ["Açúcar"],
        alergias: ["Amendoim"],
        medicamentos: "Amlodipino 5mg",
        suplementos: "Magnésio Quelato, CoQ10",
        refeicoes_por_dia: 4,
        horario_acorda: "06:45",
        horario_dorme: "22:15",
        litros_agua: 2.2,
        atividade_fisica: true,
        atividade_fisica_descricao: "Hidroginástica 3x/semana",
        observacoes: "Pressão arterial controlada com dieta DASH (baixa em sódio).",
        consultas: [
          {
            data_consulta: "2026-08-01",
            peso: 65.4,
            cintura: 78,
            quadril: 100,
            percentual_gordura: 29.5,
            proximo_retorno: "2026-09-01",
            observacoes: "PA média de 120/80 mmHg sem picos hipertensivos."
          }
        ]
      },
      {
        nome: "Geraldo Magela Nogueira",
        email: "geraldo.magela@gmail.com",
        whatsapp: "(51) 92222-0000",
        sexo: "Masculino",
        data_nascimento: "1984-10-09",
        peso_inicial: 86.0,
        altura: 180,
        objetivos: ["Emagrecer", "Performance esportiva"],
        objetivo_texto: "Perda de peso para participar de corridas de 5km com os filhos.",
        nivel_atividade: "Moderadamente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Lactose"],
        alergias: ["Leite"],
        medicamentos: "",
        suplementos: "Whey sem lactose, Creatina",
        refeicoes_por_dia: 4,
        horario_acorda: "06:00",
        horario_dorme: "22:30",
        litros_agua: 3.0,
        atividade_fisica: true,
        atividade_fisica_descricao: "Corrida leve 3x/semana + Funcional 2x",
        observacoes: "Mais disposição e vitalidade.",
        consultas: [
          {
            data_consulta: "2026-08-12",
            peso: 82.5,
            cintura: 85,
            quadril: 100,
            percentual_gordura: 20.0,
            proximo_retorno: "2026-09-12",
            observacoes: "Consulta da semana. Completou 5km sem dores articulares."
          }
        ]
      },
      {
        nome: "Heloísa Helena Fagundes",
        email: "heloisa.fagundes@gmail.com",
        whatsapp: "(51) 91111-1234",
        sexo: "Feminino",
        data_nascimento: "1992-06-03",
        peso_inicial: 62.0,
        altura: 164,
        objetivos: ["Reeducação alimentar"],
        objetivo_texto: "Alimentação saudável com foco em longevidade e pele.",
        nivel_atividade: "Moderadamente ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Açúcar"],
        alergias: ["Nenhum"],
        medicamentos: "",
        suplementos: "Colágeno, Resveratrol, Vitamina C",
        refeicoes_por_dia: 4,
        horario_acorda: "06:30",
        horario_dorme: "22:30",
        litros_agua: 2.6,
        atividade_fisica: true,
        atividade_fisica_descricao: "Musculação 4x/semana",
        observacoes: "Dieta rica em antioxidantes (frutas vermelhas, azeite extra-virgem).",
        consultas: [
          {
            data_consulta: "2026-07-22",
            peso: 60.5,
            cintura: 67,
            quadril: 96,
            percentual_gordura: 22.0,
            proximo_retorno: "2026-08-22",
            observacoes: "Pele com mais viço e energia ao longo de todo o dia."
          }
        ]
      },
      {
        nome: "Ivanildo Medeiros Lemos",
        email: "ivanildo.lemos@gmail.com",
        whatsapp: "(51) 90000-2345",
        sexo: "Masculino",
        data_nascimento: "1970-04-14",
        peso_inicial: 97.0,
        altura: 179,
        objetivos: ["Emagrecer", "Controlar diabetes"],
        objetivo_texto: "Controle de glicemia e perda de peso progressiva.",
        nivel_atividade: "Sedentário",
        patologias: ["Diabetes", "Hipertensão"],
        restricoes_alimentares: ["Açúcar"],
        alergias: ["Nenhum"],
        medicamentos: "Metformina 850mg",
        suplementos: "Ômega 3, Vitamina D 5000UI",
        refeicoes_por_dia: 3,
        horario_acorda: "07:00",
        horario_dorme: "23:00",
        litros_agua: 2.0,
        atividade_fisica: false,
        atividade_fisica_descricao: "",
        observacoes: "Dificuldade para beber água ao longo do expediente.",
        consultas: [
          {
            data_consulta: "2026-05-25",
            peso: 97.0,
            cintura: 106,
            quadril: 110,
            percentual_gordura: 31.0,
            proximo_retorno: null, // > 30 dias sem retorno (Alerta!)
            observacoes: "Orientação para uso de garrafa com marcadores de horário."
          }
        ]
      },
      {
        nome: "Jaqueline Prado Valente",
        email: "jaqueline.valente@gmail.com",
        whatsapp: "(51) 98765-3456",
        sexo: "Feminino",
        data_nascimento: "1996-01-20",
        peso_inicial: 58.0,
        altura: 161,
        objetivos: ["Ganhar massa", "Performance esportiva"],
        objetivo_texto: "Aumento de massa magra sem ganho de gordura.",
        nivel_atividade: "Muito ativo",
        patologias: ["Nenhum"],
        restricoes_alimentares: ["Lactose"],
        alergias: ["Leite"],
        medicamentos: "",
        suplementos: "Whey isolado sem lactose, Creatina 5g",
        refeicoes_por_dia: 5,
        horario_acorda: "06:00",
        horario_dorme: "22:00",
        litros_agua: 2.8,
        atividade_fisica: true,
        atividade_fisica_descricao: "Musculação 5x/semana",
        observacoes: "Excelente evolução com registro fotográfico a cada 30 dias.",
        consultas: [
          {
            data_consulta: "2026-08-13",
            peso: 59.8,
            cintura: 65,
            quadril: 96,
            percentual_gordura: 18.5,
            proximo_retorno: "2026-09-13",
            observacoes: "Consulta da semana. Ganho de 1,8kg com excelente densidade muscular."
          }
        ]
      }
    ]
  }
];

async function seed() {
  console.log("🌱 Iniciando população do sistema LopesNutri...");

  const credentialsReport = [];

  for (const nutri of nutricionistasData) {
    console.log(`\n======================================================`);
    console.log(`👩‍⚕️ Processando Nutricionista: ${nutri.nome} (${nutri.email})`);

    let userId = null;

    // 1. Tentar login primeiro para ver se a conta já existe
    try {
      const signInRes = await authClient.signIn.email({
        email: nutri.email,
        password: defaultPassword,
        callbackURL: "http://localhost:5173"
      });

      if (signInRes.data && signInRes.data.user) {
        userId = signInRes.data.user.id;
        console.log(`  ✓ Conta de autenticação já existe (ID: ${userId})`);
      }
    } catch (err) {
      // Se falhar o login, tenta criar a conta
    }

    if (!userId) {
      try {
        const signUpRes = await authClient.signUp.email({
          email: nutri.email,
          password: defaultPassword,
          name: nutri.nome,
          callbackURL: "http://localhost:5173"
        });

        if (signUpRes.data && signUpRes.data.user) {
          userId = signUpRes.data.user.id;
          console.log(`  ✓ Conta de autenticação criada com sucesso (ID: ${userId})`);
        } else if (signUpRes.error) {
          console.log(`  ⚠️ Aviso signUp: ${signUpRes.error.message}`);
        }
      } catch (err) {
        console.error(`  ❌ Erro ao criar conta de autenticação:`, err.message);
      }
    }

    if (!userId) {
      // Se por algum motivo não conseguiu id do auth, tenta buscar ou gerar na tabela
      const existingInDb = await sql`SELECT id FROM nutricionistas WHERE email = ${nutri.email}`;
      if (existingInDb.length > 0) {
        userId = existingInDb[0].id;
      }
    }

    if (!userId) {
      console.error(`  ❌ Não foi possível obter o ID de autenticação para ${nutri.email}. Pulando.`);
      continue;
    }

    // 2. Garantir que o nutricionista existe na tabela 'nutricionistas'
    await sql`
      INSERT INTO nutricionistas (id, nome, email)
      VALUES (${userId}, ${nutri.nome}, ${nutri.email})
      ON CONFLICT (email) DO UPDATE 
      SET nome = ${nutri.nome}, id = ${userId}
    `;
    console.log(`  ✓ Registro em 'nutricionistas' sincronizado.`);

    credentialsReport.push({
      nome: nutri.nome,
      email: nutri.email,
      senha: defaultPassword,
      especialidade: nutri.especialidade,
      totalPacientes: nutri.pacientes.length
    });

    // 3. Cadastrar os 10 pacientes
    console.log(`  👥 Cadastrando ${nutri.pacientes.length} pacientes e suas consultas...`);

    for (const p of nutri.pacientes) {
      // Deletar paciente duplicado se existir para evitar poluição
      await sql`
        DELETE FROM pacientes 
        WHERE nutricionista_id = ${userId} AND (nome = ${p.nome} OR email = ${p.email})
      `;

      const insertPacienteRes = await sql`
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
          ${userId},
          ${p.nome},
          ${p.email},
          ${p.whatsapp},
          ${p.sexo},
          ${p.data_nascimento},
          ${p.peso_inicial},
          ${p.altura},
          ${p.refeicoes_por_dia},
          ${p.litros_agua},
          ${p.atividade_fisica},
          ${p.atividade_fisica_descricao || null},
          ${p.nivel_atividade},
          ${p.horario_acorda},
          ${p.horario_dorme},
          ${p.objetivos},
          ${p.objetivo_texto},
          ${p.patologias},
          ${p.restricoes_alimentares},
          ${p.alergias},
          ${p.medicamentos || null},
          ${p.suplementos || null},
          ${p.observacoes || null}
        )
        RETURNING id
      `;

      const pacienteId = insertPacienteRes[0]?.id;

      // 4. Inserir histórico de consultas
      if (pacienteId && p.consultas && p.consultas.length > 0) {
        for (const c of p.consultas) {
          await sql`
            INSERT INTO consultas (
              paciente_id,
              data_consulta,
              peso,
              cintura,
              quadril,
              percentual_gordura,
              proximo_retorno,
              observacoes
            ) VALUES (
              ${pacienteId},
              ${c.data_consulta},
              ${c.peso},
              ${c.cintura},
              ${c.quadril},
              ${c.percentual_gordura},
              ${c.proximo_retorno || null},
              ${c.observacoes || null}
            )
          `;
        }
      }
    }
    console.log(`  ✓ 10 pacientes e consultas inseridos com sucesso!`);
  }

  console.log(`\n======================================================`);
  console.log(`🎉 População concluída com sucesso!`);
  console.log(`======================================================`);
  console.log(JSON.stringify(credentialsReport, null, 2));
}

seed().catch((err) => {
  console.error("❌ Erro fatal durante a população:", err);
  process.exit(1);
});
