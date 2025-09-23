# 📖 **Documentação @wamra/gantt-task-react v0.6.17**

## 🚀 **Instalação e Uso Básico**

```bash
npm install @wamra/gantt-task-react
```

```tsx
import { Gantt, ViewMode } from '@wamra/gantt-task-react';
import '@wamra/gantt-task-react/dist/style.css';
import { ptBR } from 'date-fns/locale';

// Dados das tarefas
const tasks = [
  {
    id: "task-1",
    name: "Tarefa 1",
    start: new Date(2025, 0, 1),
    end: new Date(2025, 0, 5),
    progress: 50,
    type: "task" as const,
    dependencies: ["task-2"], // IDs das dependências
  }
];

// Uso básico
<Gantt
  tasks={tasks}
  viewMode={ViewMode.Week}
  dateLocale={ptBR} // Português Brasil
/>
```

## 🎛️ **Props Principais (GanttProps)**

### **📋 Dados (Obrigatório)**
```tsx
tasks: readonly TaskOrEmpty[] // Array de tarefas
```

### **🎯 Eventos**
```tsx
onDateChange?: (task, children) => void    // Arrasto de datas
onProgressChange?: (task, children) => void // Mudança de progresso
onDelete?: (tasks, dependents, indexes, parents, suggestions) => void
onClick?: (task) => void                   // Clique simples
onDoubleClick?: (task) => void            // Duplo clique
onAddTaskClick?: (task) => void           // Botão adicionar
onEditTaskClick?: (task) => void          // Botão editar
```

### **🎨 Aparência (DisplayOption)**
```tsx
viewMode?: ViewMode                       // Hour|Day|Week|Month|Year
dateLocale?: DateLocale                   // Locale do date-fns
viewDate?: Date                          // Data inicial exibida
rtl?: boolean                            // Direita para esquerda
isShowCriticalPath?: boolean             // Caminho crítico
isShowTaskNumbers?: boolean              // Números das tarefas
```

### **🎨 Estilos (StylingOption)**
```tsx
colors?: {
  arrowColor: string                     // Cor das setas de dependência
  arrowCriticalColor: string            // Cor das setas críticas
  barBackgroundColor: string            // Cor de fundo das barras
  barProgressColor: string              // Cor do progresso
  selectedTaskBackgroundColor: string   // Cor da tarefa selecionada
  todayColor: string                    // Cor da linha "hoje"
}

distances?: {
  arrowIndent: number                   // Espaçamento das setas
  columnWidth: number                   // Largura das colunas
  rowHeight: number                     // Altura das linhas
  headerHeight: number                  // Altura do cabeçalho
}

dateFormats?: {
  dateColumnFormat: string              // Formato da coluna de data
  dayBottomHeaderFormat: string         // Formato do cabeçalho inferior
}

fontFamily?: string                     // Fonte
fontSize?: string                       // Tamanho da fonte
```

## 📊 **Estrutura da Tarefa (Task)**

```tsx
interface Task {
  id: string                           // ID único (obrigatório)
  name: string                         // Nome exibido (obrigatório)
  start: Date                          // Data início (obrigatório)
  end: Date                           // Data fim (obrigatório)
  progress: number                     // Progresso 0-100 (obrigatório)
  type: "task" | "milestone" | "project" // Tipo (obrigatório)
  
  // Opcionais
  dependencies?: Dependency[]          // Dependências estruturadas
  parent?: string                      // ID da tarefa pai (para subtarefas)
  hideChildren?: boolean               // Ocultar filhos
  isDisabled?: boolean                 // Desabilitar interação
  styles?: Partial<ColorStyles>        // Estilos específicos
  assignees?: string[]                 // Responsáveis
}
```

## 🌳 **Hierarquia de Tarefas (Subtarefas)**

### **Como Funciona:**
- Use `parent: "task-id"` para criar subtarefas
- Tarefas pai são automaticamente exibidas como `type: "project"`
- Subtarefas são indentadas visualmente: `└─ Nome da Subtarefa`
- A biblioteca organiza automaticamente a ordem: pais → filhos

### **Exemplo de Hierarquia:**
```tsx
const tasks = [
  // Tarefa pai (será exibida como projeto)
  {
    id: "task-1",
    name: "Desenvolvimento Frontend",
    start: new Date(2025, 0, 1),
    end: new Date(2025, 0, 15),
    progress: 40,
    type: "project" // Automaticamente definido se tem filhos
  },
  
  // Subtarefas
  {
    id: "task-1-1", 
    name: "  └─ Criar Componentes",
    parent: "task-1", // Referencia a tarefa pai
    start: new Date(2025, 0, 1),
    end: new Date(2025, 0, 5),
    progress: 80,
    type: "task"
  },
  
  {
    id: "task-1-2",
    name: "  └─ Implementar Testes", 
    parent: "task-1",
    start: new Date(2025, 0, 6),
    end: new Date(2025, 0, 10),
    progress: 20,
    type: "task"
  }
];
```

### **Visualização no Gantt:**
- **Tarefas Pai**: Aparecem como barras de projeto (mais grossas/destacadas)
- **Subtarefas**: Aparecem indentadas com `└─` prefixo
- **Ordem**: Sempre pai → filhos em sequência
- **Funcionalidade**: Botões editar/adicionar funcionam normalmente

## 🔗 **Dependências**

### **Método Simples (Array de IDs):**
```tsx
dependencies: ["task-2", "task-3"] // IDs das tarefas predecessoras
```

### **Método Avançado (Objetos):**
```tsx
dependencies: [{
  sourceId: "task-2",
  sourceTarget: "endOfTask",         // "startOfTask" | "endOfTask"
  ownTarget: "startOfTask"
}]
```

## 🌍 **Localização PT-BR**

```tsx
import { ptBR } from 'date-fns/locale';

<Gantt
  dateLocale={ptBR}
  dateFormats={{
    dateColumnFormat: "dd/MM",
    dayBottomHeaderFormat: "dd/MM",
    monthBottomHeaderFormat: "MMM yyyy"
  }}
/>
```

## 🎨 **Exemplo Completo Estilizado**

```tsx
<Gantt
  tasks={tasks}
  viewMode={ViewMode.Week}
  dateLocale={ptBR}
  
  // Cores
  colors={{
    arrowColor: "#1890ff",
    arrowCriticalColor: "#ff4d4f",
    barBackgroundColor: "#f0f0f0",
    barProgressColor: "#52c41a",
    selectedTaskBackgroundColor: "#e6f7ff",
    todayColor: "rgba(255, 0, 0, 0.3)"
  }}
  
  // Espaçamentos
  distances={{
    arrowIndent: 20,
    columnWidth: 60,
    rowHeight: 50,
    headerHeight: 80
  }}
  
  // Eventos
  onDateChange={async (task) => {
    await updateTask(task);
    reloadTasks();
  }}
  
  onDelete={async (tasks) => {
    await deleteTasks(tasks.map(t => t.id));
    reloadTasks();
  }}
  
  onClick={(task) => setSelectedTask(task)}
  onDoubleClick={(task) => openEditModal(task)}
/>
```

## ⚡ **ViewModes Disponíveis**

```tsx
ViewMode.Hour        // Por hora
ViewMode.QuarterDay  // 6 horas
ViewMode.HalfDay     // 12 horas
ViewMode.Day         // Por dia
ViewMode.Week        // Por semana (padrão recomendado)
ViewMode.Month       // Por mês
ViewMode.Year        // Por ano
```

## 🔧 **Dicas de Performance**

1. **Use `readonly` nos arrays:** `readonly Task[]`
2. **Memoize dados grandes:** `useMemo(() => tasks, [dependencies])`
3. **IDs únicos:** Sempre use IDs únicos para evitar re-renders
4. **Lazy loading:** Para +1000 tarefas, implemente paginação

## ⚠️ **Limitações Conhecidas**

- Dependências circulares não são automaticamente detectadas
- ViewMode não pode ser mudado dinamicamente sem re-render completo
- CSS customizado pode quebrar com atualizações da lib
- date-fns é dependência obrigatória para locale

## 🎯 **Casos de Uso Comuns**

```tsx
// Seleção única
const [selected, setSelected] = useState(null);
onClick={(task) => setSelected(task.id)}

// Modal de edição no duplo clique
onDoubleClick={(task) => {
  setEditingTask(task);
  setModalOpen(true);
}}

// Validação antes de deletar
onDelete={(tasks) => {
  if (confirm(`Deletar ${tasks.length} tarefa(s)?`)) {
    deleteTasks(tasks);
  }
}}
```

Esta documentação cobre 95% dos casos de uso. A lib é robusta e bem tipada em TypeScript.
