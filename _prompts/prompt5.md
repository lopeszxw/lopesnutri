# PROMPT 5 — IMPLEMENTAÇÃO: PERFIL DO PACIENTE, EVOLUÇÃO E CONSULTAS

Implemente e ajuste a página completa de **Perfil do Paciente** no projeto **LopesNutri**.
Essa rota deve ser acessada via `/pacientes/:id` (ao clicar em "Ver Perfil" nos cards do dashboard ou na listagem de pacientes).

Siga rigorosamente a stack do projeto: **Next.js / React, TypeScript, Tailwind CSS e Neon DB (PostgreSQL)**.

---

### 1. TOP BAR & IDENTIFICAÇÃO DINÂMICA
* **Saudação no Dashboard:** Tratar o primeiro nome do nutricionista logado a partir da sessão (`user.name.split(' ')[0]`), ajustando o pronome/título dinamicamente (ex: `"Boa tarde, Dra. Camila!"` ou `"Boa tarde, Dr. Rafael!"`), evitando saudações quebradas como `"Boa tarde, Dra. !"`.
* **Navegação:**
  * Botão de retorno: `<Link href="/pacientes"> ← Voltar para Lista de Pacientes </Link>`.
  * Ações no topo: Botão secundário `"Editar Dados"` e botão primário em destaque `"+ Nova Consulta / Evolução"`.

---

### 2. CARD PRINCIPAL: IDENTIFICAÇÃO DO PACIENTE
Manter o card superior com os dados carregados do Neon DB:
* Avatar com as iniciais do paciente e badge de status (`Ativo`).
* Nome completo, E-mail, WhatsApp (com link ativo para `https://wa.me/...`) e data de cadastro.
* Grade de métricas antropométricas de base:
  * **Sexo**
  * **Idade / Data de Nascimento** (cálculo dinâmico da idade)
  * **Peso Inicial** (kg)
  * **Altura** (cm)
  * **IMC Inicial** (com badge clínica correspondente, ex: *29.7 - Sobrepeso*)
  * **Total de Consultas** (contador baseado no histórico)

---

### 3. PAINEL FIXO: EVOLUÇÃO DO PESO CORPORAL (GRÁFICO)
Card de largura total posicionado abaixo dos dados de identificação:
* **Métricas do Cabeçalho:** `Peso Inicial`, `Peso Atual`, `Variação Total (Δ kg)` e `Mínimo / Máximo Registrado`.
* **Gráfico de Linha Interativo:**
  * Curva contínua conectando as consultas registradas (Eixo X: Datas | Eixo Y: Peso em kg).
  * Tooltips flutuantes ao passar o cursor com a data e o valor exato.
  * Rodapé com legenda descritiva da série histórica.
  * Atualização e re-renderização instantânea ao salvar uma nova consulta (sem reload).

---

### 4. GRID INFERIOR (LAYOUT EM 2 COLUNAS)
Organizar a interface em `grid grid-cols-1 lg:grid-cols-12 gap-6`:

#### Coluna da Esquerda (Prontuário & Hábitos — `lg:col-span-5`):
1. **Objetivos do Paciente:** Badges de tags de foco (*Emagrecer*, *Saúde Geral*, etc.) + descrição textual da meta.
2. **Saúde & Restrições:** Badges organizadas para *Patologias/Condições*, *Restrições Alimentares*, *Alergias*, além dos campos para *Medicamentos* e *Suplementos*.
3. **Hábitos & Rotina Diária:** Grid com 4 micro-cards (*Refeições/dia*, *Ingestão de Água L/dia*, *Horários Acorda/Dorme*, *Frequência de Atividade Física*).
4. **Observações Clínicas Gerais:** Bloco de texto com o histórico e queixas gerais do paciente.

#### Coluna da Direita (Histórico Clínico & Planos — `lg:col-span-7`):
1. **Histórico de Consultas & Evoluções:**
   * Cabeçalho da seção com botão `+ Nova Consulta`.
   * Lista cronológica decrescente (da mais recente para a mais antiga).
   * Cards de consulta contendo: Índice/Número da consulta, Data formatada, Badges (`Peso`, `Cintura`, `Quadril`, `% de Gordura`) e Bloco descritivo de `Evolução / Anotações da Consulta`.
2. **Seção de Planos Alimentares (Preenchimento inferior):**
   * Card dedicado com título **Planos Alimentares**.
   * Botão `"Gerar Plano Alimentar"` visível (desabilitado/preparado para o próximo módulo).
   * Lista dos planos existentes ou *empty state*: *"Nenhum plano alimentar gerado ainda."*

---

### 5. MODAL "NOVA CONSULTA" & PERSISTÊNCIA NO NEON DB
Ao acionar o botão `+ Nova Consulta / Evolução`:
* Abrir modal com formulário estruturado:
  * `data_consulta` (Input Date, preenchido com a data atual por padrão).
  * `peso` (Number, obrigatório).
  * `cintura` (Number, cm, opcional).
  * `quadril` (Number, cm, opcional).
  * `percentual_gordura` (Number, %, opcional).
  * `observacoes` (Textarea para notas e condutas).
  * `proximo_retorno` (Input Date, opcional).
* **Persistência:** Salvar o registro no Neon DB vinculado ao `paciente_id`, fechar o modal e atualizar o estado da aplicação localmente em tempo real.

---

### 6. PADRÃO VISUAL
* Manter o tema visual limpo e editorial: fundo off-white/linho suave, cartões brancos com bordas sutis (`border-border`), detalhes e botões de ação em verde sálvia/oliva e tipografia nítida sem gradientes neon.