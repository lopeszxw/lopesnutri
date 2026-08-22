# PROMPT — REDESIGN TOTAL DE INTERFACE: ESTILO EDITORIAL & BENTO GRID

Quero desconstruir completamente o layout padrão de 3 cards alinhados do dashboard e aplicar um design **autêntico, humanizado e assimétrico (estilo Bento Grid Editorial)** para a aplicação **LopesNutri**.

Mantenha todas as rotas, autenticação e dados do Neon DB intactos. Apenas transforme radicalmente a arquitetura visual e os componentes de `/dashboard`.

---

### 1. NOVO CONCEITO VISUAL & TIPOGRAFIA
* **Estética:** Fuja de layouts previsíveis de IA. Busque um estilo *editorial clínico minimalista*, inspirado em publicações de saúde integrativa e plataformas médicas de luxo.
* **Tipografia:**
  - Títulos e cabeçalhos em fonte **Serifada Moderna/Elegante** (ex: *Fraunces*, *Playfair Display* ou *Newsreader*).
  - Métricas e rótulos em fonte Sans-serif refinada e nítida (*Plus Jakarta Sans* ou *Inter*).
* **Paleta & Texturas:**
  - Fundo linho/papel suave (`#F8F7F4`).
  - Cards em branco marfim com bordas ultra-finas em cinza quente (`1px solid #E5E2DC`), sem sombras pesadas.
  - Verde floresta/oliva profundo (`#2D4336`) para elementos de destaque e botões de ação com cantos levemente suavizados (`rounded-xl` em vez de pílulas completas).

---

### 2. ARQUITETURA EM BENTO GRID (LAYOUT ASSIMÉTRICO)
Substitua a estrutura atual de fileiras por uma grade dinâmica de 12 colunas (`grid grid-cols-1 lg:grid-cols-12 gap-6`):

1. **Bloco de Boas-Vindas & Status Rápido (`lg:col-span-8`):**
   - Título serifado: `"Boa tarde, [Nome do Nutricionista]"` com tipografia de destaque.
   - Micro-resumo horizontal com separadores elegantes de linha vertical:
     - Pacientes sob cuidado: **[N]**
     - Taxa de retenção clínica: **[X]%**
     - Consultas previstas na semana: **[Y]**
   - Mini gráfico/sparkline sutil mostrando a evolução de atendimentos do mês.

2. **Card de Ação Rápida / Consulta Expressa (`lg:col-span-4`):**
   - Bloco contrastante com fundo verde escuro (`#2D4336`) e texto claro:
     - Botão de acesso rápido `+ Cadastrar Novo Paciente`.
     - Atalho direto para buscar prontuário por nome.

3. **Painel de Atenção Clínica & Retornos (`lg:col-span-7`):**
   - Lista minimalista estilo editorial (linhas divisórias limpas, sem caixas dentro de caixas).
   - Pacientes sem retorno (>30 dias): Foto/iniciais, Nome, telefone com máscara formatada `(XX) XXXXX-XXXX`, dias de ausência e botão de ação textual discreto `Abrir Prontuário →`.

4. **Painel de Hábitos & Indicadores da Base (`lg:col-span-5`):**
   - Card com resumo visual dos principais objetivos dos pacientes cadastrados (ex: *Recomposição Corporal*, *Controle Glicêmico*, *Hipertrofia*) usando barras de progresso lineares elegantes.

---

### 3. AJUSTES FINOS DE UI
* **Sidebar:** Reduzir a altura da logo para deixá-la proporcional aos textos de navegação e aplicar máscara de formatação em todos os telefones exibidos `(XX) XXXXX-XXXX`.
* Corrigir a saudação para remover o espaço antes da vírgula.

Refatore a tela do dashboard com essa nova estrutura e aplique o novo layout.