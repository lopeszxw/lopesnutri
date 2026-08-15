# 🥗 LopesNutri — Sistema de Gestão Nutricional

<div align="center">
  <img src="public/logo.png" alt="LopesNutri Logo" width="220" />
  <p><strong>Plataforma moderna, intuitiva e em tempo real para nutricionistas gerenciarem pacientes, consultas e evoluções clínicas.</strong></p>

  [![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
  [![Neon PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=flat&logo=postgresql&logoColor=white)](https://neon.tech/)
  [![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)
  [![License](https://img.shields.io/badge/License-MIT-0d7a6b?style=flat)](LICENSE)
</div>

---

## 📌 Sobre o Projeto

O **LopesNutri** foi desenvolvido para transformar e simplificar o dia a dia de profissionais de nutrição. O sistema oferece acompanhamento clínico completo em tempo real, controle de pacientes ativos, monitoramento de consultas semanais, alertas de retorno e cálculo automatizado de métricas antropométricas.

---

## ✨ Principais Funcionalidades

### 1. 📊 Dashboard Clínico em Tempo Real
- **Card 1 — Pacientes Ativos**: Contagem em tempo real de pacientes vinculados à nutricionista logada.
- **Card 2 — Consultas da Semana**: Total de consultas agendadas/registradas na semana corrente (segunda a domingo).
- **Card 3 — Alerta de Pacientes sem Retorno**: Identificação automática de pacientes cuja última consulta foi há mais de 30 dias e que não possuem próximo retorno agendado. Cada paciente possui atalho direto para seu perfil.

### 2. 👥 Gestão Completa de Pacientes
- **Busca Instantânea**: Filtragem em tempo real por nome, e-mail ou WhatsApp.
- **Ordenação Interativa**: Classificação dinâmica por nome, data de cadastro, e-mail e data do próximo retorno.
- **Paginação Inteligente**: Navegação limpa com exibição de 10 pacientes por página.
- **Tabela com Linhas Zebradas**: Interface otimizada e responsiva para leitura rápida em qualquer dispositivo.

### 3. 📝 Cadastro Refinado & Cálculo de IMC
- Formulário organizado em seções visuais:
  - 👤 **Dados Pessoais & Contato** (Nome, E-mail, WhatsApp, Sexo e Nascimento).
  - ⚖️ **Antropometria Inicial** com **cálculo dinâmico de IMC em tempo real** e indicação de faixa (Eutrofia, Sobrepeso, etc.).
  - 🎯 **Objetivos & Anamnese** com sugestões rápidas em chips clicáveis (*Emagrecimento*, *Hipertrofia*, *Reeducação Alimentar*, etc.).

### 4. 📈 Perfil Detalhado & Histórico de Consultas
- Visualização completa da ficha clínica e contatos com atalhos diretos para WhatsApp e e-mail.
- Linha do tempo de consultas com evolução antropométrica:
  - Peso (kg), Circunferência da Cintura (cm), Circunferência do Quadril (cm) e Percentual de Gordura (%).
  - Registro de conduta nutricional e agendamento do próximo retorno.

### 5. 🌓 Suporte a Dark Mode & Interface Responsiva
- Alternador de tema Claro / Escuro (*Emerald Teal & Deep Slate*).
- Menu lateral fixo (*Sidebar*) com colapso inteligente em dispositivos móveis (*Drawer*).

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [React Router DOM](https://reactrouter.com/)
- **Banco de Dados**: [Neon Serverless PostgreSQL](https://neon.tech/) (`@neondatabase/serverless`)
- **Autenticação**: [Neon Auth](https://neon.tech/docs/guides/neon-auth) (`@neondatabase/neon-js`)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Estilização**: CSS Moderno com Design Tokens, CSS Variables e Glassmorphism
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
   Copie o arquivo de exemplo `.env.example` para `.env` (o `.env` é protegido pelo `.gitignore` e nunca vai para o GitHub) e preencha com as credenciais do seu projeto Neon:
   ```bash
   cp .env.example .env
   ```
   Exemplo das chaves necessárias em `.env`:
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
│   ├── components/         # Componentes reutilizáveis (Sidebar, AppLayout, Logo, ThemeToggle)
│   ├── context/            # Context API (ThemeContext)
│   ├── pages/              # Páginas da aplicação
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── PacienteDetalhes.jsx
│   │   ├── Pacientes.jsx
│   │   └── Register.jsx
│   ├── auth.js             # Cliente de autenticação do Neon Auth
│   ├── db.js               # Conexão Serverless com Neon PostgreSQL
│   ├── App.jsx             # Roteamento e layouts
│   ├── index.css           # Design System e estilos globais
│   └── main.jsx            # Ponto de entrada da aplicação
├── .env                    # Variáveis de ambiente (ignorado no git)
├── vercel.json             # Configuração de roteamento SPA e Serverless no Vercel
├── vite.config.js          # Configuração do Vite e middleware de desenvolvimento
└── README.md               # Documentação do projeto
```

---

## 👨‍💻 Autor

Desenvolvido por **Gabriel Santos Lopes**  
- **GitHub**: [@lopeszxw](https://github.com/lopeszxw)
- **Repositório**: [https://github.com/lopeszxw/lopesnutri](https://github.com/lopeszxw/lopesnutri)
