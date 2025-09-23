# 🚀 Guia de Produtividade - Desenvolvimento Fanti

## 📋 Atalhos Essenciais do VS Code

### Navegação e Busca
- `Ctrl+P` - Quick Open (abrir arquivos rapidamente)
- `Ctrl+Shift+P` - Command Palette (executar comandos)
- `Ctrl+Shift+E` - Explorer (sidebar de arquivos)
- `Ctrl+Shift+F` - Search (busca global no projeto)
- `Ctrl+T` - Go to Symbol in Workspace
- `Ctrl+G` - Go to Line
- `F12` - Go to Definition
- `Alt+F12` - Peek Definition

### Edição Eficiente
- `F2` - Rename Symbol (renomear variável/função)
- `Ctrl+D` - Multi-cursor na próxima ocorrência
- `Ctrl+Shift+L` - Multi-cursor em todas as ocorrências
- `Alt+Click` - Multi-cursor manual
- `Ctrl+/` - Toggle comment
- `Shift+Alt+F` - Format Document
- `Ctrl+Shift+O` - Go to Symbol in File

### Terminal e Debug
- `Ctrl+```` - Toggle Terminal
- `Ctrl+Shift+```` - New Terminal
- `F5` - Start Debugging
- `F9` - Toggle Breakpoint
- `F10` - Step Over
- `F11` - Step Into

## 🎯 Workflow de Desenvolvimento Eficiente

### 1. Início do Desenvolvimento
```bash
# Terminal integrado (Ctrl+`)
cd /home/artur/Desktop/Projects/fanti/fanti-web
npm run dev
```

### 2. Estrutura de Trabalho
- **Explorer (Ctrl+Shift+E)**: Navegação de arquivos
- **Search (Ctrl+Shift+F)**: Busca global no código
- **Source Control (Ctrl+Shift+G)**: Git integration
- **Extensions (Ctrl+Shift+X)**: Gerenciar extensões

### 3. Debugging Eficiente
- Use breakpoints (F9) em vez de console.log
- Console integrado para comandos npm/yarn
- Debug Console para análise de variáveis

## 🔧 Configurações Aplicadas (Já Ativo)

### Editor Otimizado
- ✅ Auto-save após 1 segundo
- ✅ Format on save ativado
- ✅ Sugestões rápidas (200ms)
- ✅ Font ligatures para melhor legibilidade
- ✅ Mini-map desabilitado (mais espaço)

### Performance
- ✅ Search exclusions (node_modules, .git, dist)
- ✅ File watching otimizado
- ✅ Auto-trim whitespace
- ✅ Insert final newline

### TypeScript/JavaScript
- ✅ Auto-organize imports
- ✅ Auto-fix on save
- ✅ IntelliSense otimizado
- ✅ Formatação automática

## 📱 Dicas Específicas para Fanti

### Componentes
```typescript
// Use snippets para componentes React
// Digite: 'rfce' + Tab para React Function Component Export
```

### Styling
```css
/* Cores do sistema minimalista já definidas */
/* #f5f5f5 - Background neutro */
/* #262626 - Texto principal */
/* #8c8c8c - Texto secundário */
/* #d9d9d9 - Bordas */
```

### APIs
```typescript
// Use auto-complete para tipos
// Ctrl+Space para sugestões
// F12 para ir para definição
```

## 🏃‍♂️ Comandos Rápidos do Projeto

### Frontend (fanti-web)
```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run lint         # Verificar código
npm run type-check   # Verificar tipos TypeScript
```

### Backend (API)
```bash
dotnet run           # Executar API
dotnet build         # Build do projeto
dotnet test          # Executar testes
```

## 🎨 Git Workflow

### Commits Semânticos
```bash
git add .
git commit -m "feat: adicionar componente ProductCard"
git commit -m "fix: corrigir cálculo de progresso"
git commit -m "style: aplicar design minimalista"
git commit -m "refactor: centralizar cálculos"
```

### Prefixos Recomendados
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `style:` - Mudanças de estilo/formatação
- `refactor:` - Refatoração de código
- `docs:` - Documentação
- `test:` - Testes

## 🧠 Dicas de Produtividade Mental

### Foco
1. **Pomodoro**: 25min focado + 5min pausa
2. **Uma tarefa por vez**: Evite multitasking
3. **Planejamento**: Liste tarefas antes de começar

### Debugging
1. **Leia o erro completo**: Não ignore detalhes
2. **Divida problemas**: Quebre em partes menores
3. **Use breakpoints**: Pare e analise o estado
4. **Console estratégico**: Log pontos críticos

### Refactoring
1. **Teste primeiro**: Garanta que funciona
2. **Pequenos passos**: Mudanças incrementais
3. **Commit frequente**: Versione cada etapa
4. **Documentação**: Comente código complexo

## 🔗 Recursos Úteis

### Documentação
- [Next.js Docs](https://nextjs.org/docs)
- [Ant Design Components](https://ant.design/components/overview/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Extensions Recomendadas
- GitHub Copilot (IA assistant)
- Thunder Client (REST client)
- GitLens (Git insights)
- Auto Rename Tag
- Bracket Pair Colorizer

---
*Configurações aplicadas automaticamente no VS Code para máxima produtividade! 🚀*
