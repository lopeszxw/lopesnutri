# 🥗 LopesNutri — Sistema de Gestão Nutricional & Clínica

<div align="center">
  <img src="public/logo.png" alt="LopesNutri Logo" width="200" />
  <p><strong>Plataforma clínica moderna, editorial e em tempo real para nutricionistas gerenciarem prontuários, consultas, indicadores de retenção e evolução antropométrica.</strong></p>

  [![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
  [![Neon PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=flat&logo=postgresql&logoColor=white)](https://neon.tech/)
  [![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)
  [![License](https://img.shields.io/badge/License-MIT-2d4336?style=flat)](LICENSE)
</div>

---

## 📌 Sobre o Projeto

O **LopesNutri** é um ecossistema clínico desenvolvido para proporcionar uma experiência profissional sofisticada e humanizada para nutricionistas e consultórios. 

Combinando um design no estilo **Bento Grid Editorial**, tipografia serifada moderna (*Newsreader*) e um banco de dados serverless **Neon PostgreSQL**, a plataforma oferece acompanhamento clínico completo em tempo real: desde o cálculo de métricas antropométricas e gráficos de evolução do peso até o controle de retenção de pacientes e prescrição de planos alimentares.

---

## ✨ Principais Funcionalidades

### 1. 🍱 Dashboard em Bento Grid Editorial (Layout Assimétrico)
- **Bloco 1 — Boas-Vindas & Status Rápido (8 Colunas)**:
  - Saudação personalizada e dinâmica para a nutricionista logada (`"Boa tarde, Dra. Camila"`).
  - Micro-resumo horizontal com divisórias refinadas:
    - **Pacientes sob cuidado**: Total de pacientes ativos vinculados à conta.
    - **Taxa de Retenção Clínica**: Percentual dinâmico de pacientes com retornos em dia.
    - **Consultas da Semana**: Atendimentos agendados na semana corrente (Segunda a Domingo).
  - Mini Sparkline SVG elegante ilustrando a consistência do fluxo mensal de consultas.
- **Bloco 2 — Consulta Expressa & Acesso Rápido (4 Colunas)**:
  - Card em tom verde floresta profundo com acesso rápido a `+ Cadastrar Novo Paciente`.
  - Barra de busca inteligente em tempo real com dropdown instantâneo de pacientes para acesso direto ao prontuário.
- **Bloco 3 — Painel de Atenção Clínica & Retornos (7 Colunas)**:
  - Lista minimalista estilo editorial com pacientes sem consulta há mais de 30 dias.
  - Exibição de avatar com iniciais, nome, telefone formatado em máscara `(XX) XXXXX-XXXX`, badge de dias de ausência e ação direta `Abrir Prontuário →`.
- **Bloco 4 — Foco & Indicadores da Base (5 Colunas)**:
  - Barras lineares de progresso proporcionais calculadas a partir dos principais objetivos da base clínica (*Emagrecimento*, *Hipertrofia*, *Recomposição Corporal*, *Saúde & Longevidade*).

---

### 2. 📈 Gráfico de Evolução Antropométrica (SVG Dinâmico)
- Card de acompanhamento cronológico do peso corporal com **renderização matemática pura em SVG**:
  - **Caso 0 consultas**: *Empty state* limpo orientando o início do acompanhamento.
  - **Caso 1 consulta**: Ponto único centralizado com indicação de ponto de partida (`0.0 kg`), sem linhas horizontais falsas.
  - **Caso 2+ consultas**: Curva de tendência cronológica conectando todas as consultas registradas, área sombreada com gradiente e cálculo de variação total ($\Delta$ kg).
- **Tooltips Interativos**: Ao passar o cursor sobre qualquer ponto da curva, exibe detalhes como Data, Peso, Circunferência da Cintura, Quadril e % de Gordura.
- **Header de Métricas**: Indicadores rápidos de *Peso Inicial*, *Peso Atual*, *Variação Total* e *Mínimo / Máximo Registrado*.

---

### 3. 👤 Prontuário Completo do Paciente (`/pacientes/:id`)
- **Card Principal de Identificação**:
  - Avatar, nome completo, e-mail, WhatsApp com link direto para conversa (`https://wa.me/...`) e data de cadastro.
  - Grade de dados: Sexo, Data de Nascimento com **cálculo automático de idade**, Peso Inicial, Altura e **IMC Inicial** com classificação clínica (*Eutrofia*, *Sobrepeso*, *Obesidade*).
- **Estrutura em 2 Colunas**:
  - **Coluna da Esquerda (Histórico & Hábitos)**:
    1. *Objetivos do Paciente*: Chips/tags de foco e relato textual da meta.
    2. *Saúde & Restrições*: Patologias, restrições alimentares, alergias, medicamentos e suplementos.
    3. *Hábitos & Rotina*: Refeições/dia, ingestão de água (L/dia), horários de sono e nível de atividade física.
    4. *Observações Clínicas*: Histórico geral e anotações do profissional.
  - **Coluna da Direita (Histórico Clínico & Planos)**:
    1. *Linha do Tempo de Consultas*: Histórico detalhado com número da consulta, data, peso, cintura, quadril, % gordura e conduta.
    2. *Planos Alimentares*: Módulo dedicado para prescrição de cardápios e dietas personalizadas.
- **Modal "Nova Consulta"**:
  - Registro de novas consultas com validação de peso obrigatório, atualização em tempo real no banco Neon e recálculo instantâneo do gráfico.

---

### 4. 👥 Listagem e Gestão de Pacientes (`/pacientes`)
- **Busca em Tempo Real**: Filtragem instantânea por nome, e-mail ou telefone.
- **Ordenação Dinâmica**: Classificação por nome, data de cadastro ou próximo retorno agendado.
- **Paginação Limpa**: Navegação otimizada para 10 pacientes por página.
- **Telefones Formatados**: Máscara padrão brasileira `(XX) XXXXX-XXXX` aplicada universalmente.

---

### 5. 🎨 Design System & Dark Mode
- **Paleta de Cores**: Fundo linho/papel suave (`#F8F7F4`), superfícies brancas com bordas finas em cinza quente (`#E5E2DC`) e detalhes em verde floresta/oliva (`#2D4336`).
- **Dark Mode Refinado**: Modo escuro em tom linho profundo (`#121513`) com contraste otimizado para não cansar a visão em atendimentos noturnos.
- **Resiliência**: `ErrorBoundary` integrado na raiz da aplicação prevenindo telas brancas e garantindo estabilidade contra falhas de renderização.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [React Router DOM v7](https://reactrouter.com/)
- **Banco de Dados**: [Neon Serverless PostgreSQL](https://neon.tech/) (`@neondatabase/serverless`)
- **Autenticação**: [Neon Auth](https://neon.tech/docs/guides/neon-auth) (`@neondatabase/neon-js`)
- **Tipografia**: [Newsreader](https://fonts.google.com/specimen/Newsreader) (Serifada Editorial) & [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (Sans-Serif)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Estilização**: CSS Moderno com Design Tokens, CSS Variables e Grid Layout responsivo
- **Deploy**: [Vercel](https://vercel.com/) (com Vercel Serverless Functions para rotas de API)

---

## 🗄️ Estrutura do Banco de Dados (PostgreSQL)

```sql
-- Nutricionistas
CREATE TABLE nutricionistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

-- Pacientes
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutricionista_id UUID NOT NULL REFERENCES nutricionistas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  sexo TEXT,
  data_nascimento DATE,
  peso_inicial NUMERIC,
  altura NUMERIC,
  refeicoes_por_dia INTEGER,
  litros_agua NUMERIC,
  atividade_fisica BOOLEAN,
  atividade_fisica_descricao TEXT,
  nivel_atividade TEXT,
  objetivo_texto TEXT,
  objetivos TEXT[],
  patologias TEXT[],
  restricoes_alimentares TEXT[],
  alergias TEXT[],
  medicamentos TEXT,
  suplementos TEXT,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Consultas
CREATE TABLE consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  data_consulta DATE NOT NULL,
  peso NUMERIC,
  cintura NUMERIC,
  quadril NUMERIC,
  percentual_gordura NUMERIC,
  proximo_retorno DATE,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Planos Alimentares
CREATE TABLE planos_alimentares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  conteudo JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **Git**
- Conta e banco configurados no [Neon](https://neon.tech)

### Passo a passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/lopeszxw/lopesnutri.git
   cd lopesnutri
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto preenchendo com as credenciais do seu projeto Neon:
   ```env
   VITE_NEON_AUTH_URL="https://sua-instancia.neonauth.sa-east-1.aws.neon.tech/neondb/auth"
   NEON_DB_URL="postgresql://seu_usuario:sua_senha@seu-host.sa-east-1.aws.neon.tech/neondb?sslmode=require"
   VITE_NEON_DB_URL="postgresql://seu_usuario:sua_senha@seu-host.sa-east-1.aws.neon.tech/neondb?sslmode=require"
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse a aplicação no navegador em `http://localhost:5173`.

5. **Gerar Build para Produção:**
   ```bash
   npm run build
   ```

---

## 📁 Estrutura de Pastas

```
LopesNutri/
├── api/                    # Serverless Functions da API (Vercel)
│   └── register-nutricionista.js
├── public/                 # Assets estáticos (logos, favicons)
├── src/
│   ├── components/         # Componentes reutilizáveis (Sidebar, AppLayout, EvolucaoPesoChart, Logo, ErrorBoundary)
│   ├── context/            # Context API (ThemeContext)
│   ├── pages/              # Páginas da aplicação
│   │   ├── Dashboard.jsx         # Bento Grid Editorial Dashboard
│   │   ├── Login.jsx             # Autenticação de Nutricionistas
│   │   ├── PacienteDetalhes.jsx  # Prontuário, Evolução e Consultas
│   │   ├── Pacientes.jsx         # Gestão e Listagem de Pacientes
│   │   └── Register.jsx          # Cadastro de Novo Nutricionista
│   ├── utils/              # Funções utilitárias (helpers, formatação de datas e telefones)
│   ├── auth.js             # Cliente de autenticação do Neon Auth
│   ├── db.js               # Conexão Serverless com Neon PostgreSQL
│   ├── App.jsx             # Roteamento e ErrorBoundary
│   ├── index.css           # Design System, Bento Grid e estilos globais
│   └── main.jsx            # Ponto de entrada da aplicação
├── .env                    # Variáveis de ambiente (ignorado no git)
├── vercel.json             # Configuração SPA e Serverless no Vercel
├── vite.config.js          # Configuração do Vite
└── README.md               # Documentação do projeto
```

---

## 👨‍💻 Autor

Desenvolvido por **Gabriel Santos Lopes**  
- **GitHub**: [@lopeszxw](https://github.com/lopeszxw)  
- **Repositório**: [https://github.com/lopeszxw/lopesnutri](https://github.com/lopeszxw/lopesnutri)

