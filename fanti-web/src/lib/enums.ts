import { 
  TaskType, 
  TaskPriority, 
  TaskStatus, 
  DependencyType, 
  AssignmentRole,
  UserRole,
  ProjectStatus,
  ProjectRole,
  SprintStatus 
} from '@/types';

// Cores para Task Priority
export const getTaskPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case TaskPriority.Low:
      return '#10b981'; // Green
    case TaskPriority.Medium:
      return '#f59e0b'; // Yellow
    case TaskPriority.High:
      return '#f97316'; // Orange
    case TaskPriority.Critical:
      return '#ef4444'; // Red
    default:
      return '#6b7280'; // Gray
  }
};

// Cores para Dependency Types
export const getDependencyTypeColor = (type: DependencyType): string => {
  switch (type) {
    case DependencyType.FinishToStart:
      return '#3b82f6'; // Blue
    case DependencyType.StartToStart:
      return '#10b981'; // Green
    case DependencyType.FinishToFinish:
      return '#f59e0b'; // Yellow
    case DependencyType.StartToFinish:
      return '#8b5cf6'; // Purple
    default:
      return '#6b7280'; // Gray
  }
};

// Descrições para Dependency Types
export const getDependencyTypeDescription = (type: DependencyType): string => {
  switch (type) {
    case DependencyType.FinishToStart:
      return 'A tarefa predecessora deve terminar antes da sucessora começar';
    case DependencyType.StartToStart:
      return 'Ambas as tarefas devem começar ao mesmo tempo';
    case DependencyType.FinishToFinish:
      return 'Ambas as tarefas devem terminar ao mesmo tempo';
    case DependencyType.StartToFinish:
      return 'A tarefa predecessora deve começar antes da sucessora terminar';
    default:
      return 'Tipo de dependência';
  }
};

// Cores para Assignment Roles
export const getAssignmentRoleColor = (role: AssignmentRole): string => {
  switch (role) {
    case AssignmentRole.Assignee:
      return '#3b82f6'; // Blue
    case AssignmentRole.Reviewer:
      return '#8b5cf6'; // Purple
    case AssignmentRole.Collaborator:
      return '#10b981'; // Green
    case AssignmentRole.Observer:
      return '#6b7280'; // Gray
    default:
      return '#6b7280'; // Gray
  }
};

// Descrições para Assignment Roles
export const getAssignmentRoleDescription = (role: AssignmentRole): string => {
  switch (role) {
    case AssignmentRole.Assignee:
      return 'Responsável principal pela execução da tarefa';
    case AssignmentRole.Reviewer:
      return 'Responsável por revisar e aprovar o trabalho';
    case AssignmentRole.Collaborator:
      return 'Colabora ativamente na execução da tarefa';
    case AssignmentRole.Observer:
      return 'Acompanha o progresso sem participação ativa';
    default:
      return 'Papel na tarefa';
  }
};

export const getTaskPriorityLabel = (priority: TaskPriority): string => {
  switch (priority) {
    case TaskPriority.Low:
      return 'Baixa';
    case TaskPriority.Medium:
      return 'Média';
    case TaskPriority.High:
      return 'Alta';
    case TaskPriority.Critical:
      return 'Crítica';
    default:
      return 'Desconhecida';
  }
};


export const getDependencyTypeLabel = (type: DependencyType): string => {
  switch (type) {
    case DependencyType.FinishToStart:
      return 'Fim para Início';
    case DependencyType.StartToStart:
      return 'Início para Início';
    case DependencyType.FinishToFinish:
      return 'Fim para Fim';
    case DependencyType.StartToFinish:
      return 'Início para Fim';
    default:
      return 'Desconhecido';
  }
};

export const getAssignmentRoleLabel = (role: AssignmentRole): string => {
  switch (role) {
    case AssignmentRole.Assignee:
      return 'Responsável';
    case AssignmentRole.Reviewer:
      return 'Revisor';
    case AssignmentRole.Collaborator:
      return 'Colaborador';
    case AssignmentRole.Observer:
      return 'Observador';
    default:
      return 'Desconhecido';
  }
};

// Validação de progresso
export const validateProgress = (progress: number): number => {
  if (progress < 0) return 0;
  if (progress > 100) return 100;
  return Math.round(progress);
};

// Geração de cor aleatória para novos itens
export const generateRandomColor = (): string => {
  const colors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#6366f1', // Indigo
    '#84cc16', // Lime
    '#ec4899', // Pink
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Formatação de datas para Gantt
export const formatDateForGantt = (date: string | Date): Date => {
  if (typeof date === 'string') {
    return new Date(date);
  }
  return date;
};

export const formatDateForApi = (date: Date): string => {
  return date.toISOString();
};
