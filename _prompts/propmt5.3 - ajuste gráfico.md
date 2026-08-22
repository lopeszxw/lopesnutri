# PROMPT DE CORREÇÃO — LÓGICA DO GRÁFICO DE EVOLUÇÃO DE PESO

Corrija o comportamento e a renderização do componente de **Evolução do Peso Corporal** na tela de detalhes do paciente (`/pacientes/:id`).

---

### Diagnóstico do Problema Atual:
Quando o paciente possui apenas 1 consulta registrada, o gráfico está criando um segundo ponto artificial (misturando a data de cadastro com a data da consulta), gerando uma linha reta entre duas datas diferentes e informando erroneamente que a curva foi calculada a partir de 2 registros.

---

### Regras de Renderização Correta:

1. **Caso 0 Consultas (Sem histórico):**
   - Não renderizar linha nem pontos.
   - Exibir um *empty state* limpo dentro do card:
     > *"Nenhuma consulta registrada ainda. Realize a primeira consulta para iniciar a curva de evolução."*

2. **Caso 1 Consulta Registrada:**
   - Renderizar **apenas 1 único ponto (ponto único/marker)** no gráfico correspondente à data daquela consulta e ao peso registrado.
   - **Não traçar linha horizontal falsa** entre datas diferentes.
   - O rodapé deve exibir: *"1 registro antropométrico registrado. A curva de tendência será traçada a partir da 2ª consulta."*
   - O card de variação deve indicar `0.0 kg` (ou *"Primeira consulta"*).

3. **Caso 2 ou Mais Consultas:**
   - Traçar a linha de evolução cronológica conectando apenas os registros reais de consulta existentes na tabela/array.
   - O rodapé deve exibir: *"Curva calculada a partir de [N] consultas antropométricas."*

4. **Tratamento do Array de Dados:**
   - O gráfico deve consumir estritamente o array `consultas` ordenado por data crescente para a plotagem.
   - Não injete a data de cadastro (`created_at`) como um ponto antropométrico a menos que ela seja explicitamente uma consulta com peso registrado.

Aplique essa correção de lógica no componente de gráfico e no cálculo de contadores.