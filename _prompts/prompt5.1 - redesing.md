# PROMPT — REDESIGN DO DASHBOARD & INTERFACE (LOPESNUTRI)

Quero fazer um redesign completo na interface e no layout do **Dashboard Principal** da aplicação **LopesNutri**, mantendo 100% das funcionalidades, rotas, autenticação e dados do banco Neon intactos (não vamos alterar o logo agora).

O objetivo é transformar o visual genérico de template/IA em uma **experiência clínica sofisticada, acolhedora e de estilo editorial/humanizado**.

---

### 1. SISTEMA VISUAL & PALETA DE CORES
* **Plano de Fundo:** Fundo suave off-white / linho (`#F9F9F6` ou `#F7F8F5`), fugindo do cinza frio padrão ou fundo branco estéril.
* **Superfícies & Cards:** Branco puro com bordas bem finas e elegantes (`1px solid #E8ECE9`), eliminando sombras pesadas flutuantes ou gradientes neon.
* **Acentos & Ações:** Verde sálvia/oliva suave (`#3D5A45` / `#4A6B53`) para botões principais e estados ativos.
* **Badges & Status:** Tons suaves de terracota, damasco e ocre para alertas clínicos e tags.
* **Tipografia:** Hierarquia refinada com títulos elegantes e números/tabelas em fonte sans-serif ultra legível (Inter/Plus Jakarta Sans).

---

### 2. REFORMULAÇÃO DO DASHBOARD PRINCIPAL (`/dashboard`)
* **Saudação Dinâmica:**
  * Puxar o nome correto do nutricionista logado a partir da sessão (`user.name.split(' ')[0]`), tratando o título dinamicamente (ex: `"Boa tarde, Dra. Camila!"` ou `"Boa tarde, Dr. Rafael!"`), corrigindo o erro atual de espaço vazio (`"Boa tarde, Dra. !"`).
  * Subtítulo clínico objetivo e limpo.
* **Cards de Métricas de Topo (Métricas Relevantes):**
  * Total de Pacientes Ativos com badge discreta de crescimento.
  * Consultas da Semana com calendário contextual.
  * Card com indicador visual de retenção/engajamento dos pacientes.
* **Seção de Alertas: Pacientes Sem Retorno:**
  * Lista limpa dos pacientes que estão há mais de 30 dias sem agendamento.
  * Cada item deve conter: Avatar com iniciais, Nome, E-mail, Telefone, Badge com os dias desde a última consulta e botão direto `"Ver Perfil →"`.
* **Feed / Acesso Rápido:**
  * Organização em cards estruturados com espaçamento generoso e leitura rápida.

---

### 3. REGRAS TÉCNICAS
* **Manter integridade:** Nenhuma rota, chamada ao banco Neon ou lógica de sessão deve ser quebrada.
* **Escopo:** Focar exclusivamente na refatoração de CSS, Tailwind, estrutura dos cards e componentes visuais do dashboard.

Aplique esse redesign refinando o código da tela principal.