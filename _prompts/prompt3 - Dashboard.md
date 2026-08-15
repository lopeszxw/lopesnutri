# Prompt 3 — Dashboard principal

Agora vamos criar o dashboard principal do sistema. Essa é a primeira tela que a nutricionista vê após fazer login.

## Layout
- Menu lateral fixo com as opções: Dashboard, Pacientes
- Área principal com os cards de informação

## Cards de informação
O dashboard deve exibir 3 cards principais:

### Card 1 — Total de pacientes ativos
- Exibe o número total de pacientes cadastrados pela nutricionista logada

### Card 2 — Consultas da semana
- Exibe o número de consultas registradas na semana atual

### Card 3 — Pacientes sem retorno
- Exibe uma lista com o nome dos pacientes cuja última consulta foi há mais de 30 dias e que não possuem próximo retorno agendado
- Cada nome da lista deve ser clicável e redirecionar para o perfil do paciente

## Regras importantes
- Todos os dados devem ser carregados do Neon em tempo real
- Exibir apenas dados da nutricionista logada
- Se não houver pacientes sem retorno, exibir a mensagem "Nenhum paciente sem retorno no momento"

## Design
- Seguir o mesmo padrão visual da tela de autenticação (verde e branco)
- Cards com visual limpo, moderno e profissional
- Menu lateral fixo com logo "LopesNutri" no topo
# Prompt 4 — Lista de pacientes

Crie a página de lista de pacientes. Ela deve ser acessível pelo menu lateral do dashboard.

## Layout
- Menu lateral fixo (mesmo do dashboard)
- Área principal com:
  - Título "Pacientes"
  - Um campo de busca para pesquisar por nome ou e-mail
  - Uma tabela com a lista de pacientes

## Tabela de pacientes

A tabela deve exibir as seguintes colunas:

1. **Nome** - Nome completo do paciente
2. **E-mail** - E-mail do paciente
3. **Telefone** - Telefone do paciente
4. **Data de cadastro** - Data em que o paciente foi cadastrado
5. **Próximo retorno** - Data do próximo retorno agendado (se houver)
6. **Status** - Indica se o paciente está ativo ou inativo

## Funcionalidades

- **Busca em tempo real**: Conforme o usuário digita no campo de busca, a tabela deve filtrar os resultados instantaneamente
- **Ordenação**: Clicar no cabeçalho de qualquer coluna deve ordenar a lista (crescente/decrescente)
- **Paginação**: Se houver mais de 10 pacientes, exibir paginação (mostrar 10 por página)
- **Visualização detalhada**: Clicar em qualquer linha da tabela deve abrir o perfil completo do paciente (vamos criar na próxima etapa)

## Regras importantes

- Exibir apenas pacientes da nutricionista logada
- Buscar todos os dados no Neon em tempo real
- A tabela deve ser responsiva e funcionar bem em dispositivos móveis

## Design

- Seguir o padrão visual verde e branco do sistema
- Tabela com linhas alternadas (zebra) para melhor leitura
- Botão "Novo paciente" no canto superior direito
- Campos de busca e paginação clean e modernos