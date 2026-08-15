# Regra de Sincronização Automática com Git / GitHub

Sempre que forem feitas alterações em arquivos locais, novos recursos, correções ou edições de código no projeto:

1. **Commit & Push Automático**:
   - Adicionar os arquivos alterados com `git add .` (respeitando o `.gitignore`).
   - Fazer o commit com uma mensagem semântica e descritiva em português/inglês (ex: `feat: ...`, `fix: ...`, `chore: ...`).
   - Fazer o push imediatamente para o repositório remoto (`origin main`): `git push origin main`.

2. **Aviso Obrigatório ao Usuário**:
   - Em todas as respostas onde alterações foram feitas e enviadas, informar claramente ao usuário:
     > 🚀 **Atualização no GitHub:** As alterações foram sincronizadas e enviadas com sucesso para o repositório [lopeszxw/lopesnutri](https://github.com/lopeszxw/lopesnutri.git) (Commit: `<hash>` - `<mensagem>`).
