import { Project, Sprint, Task } from './index';

/**
 * Métricas de performance da equipe e projetos
 */
export interface PerformanceMetrics {
  // Eficiência geral
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;

  // Performance de milestones
  totalSprints: number;
  activeSprints: number;
  completedSprints: number;
  delayedSprints: number;

  // Performance de tarefas
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;

  // Velocidade média
  averageProgress: number;
}

/**
 * Métricas de eficiência calculadas
 */
export interface EfficiencyMetrics {
  projectCompletion: number;
  sprintCompletion: number;
  taskCompletion: number;
  onTimeDelivery: number;
  overallEfficiency: number;
}

/**
 * Dados de performance de um projeto específico
 */
export interface ProjectPerformanceData {
  key: string;
  name: string;
  progress: number;
  milestones: number;
  completedMilestones: number;
  tasks: number;
  completedTasks: number;
  efficiency: number;
  status: string;
  delayedMilestones: number;
  estimatedHours: number;
  completedHours: number;
  timeEfficiency: number;
}

/**
 * Projeto crítico (que precisa de atenção)
 */
export interface CriticalProject {
  project: Project;
  reasons: string[];
  progress: number;
  delayedSprints: number;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Resumo executivo do dashboard
 */
export interface DashboardSummary {
  performanceMetrics: PerformanceMetrics;
  efficiencyMetrics: EfficiencyMetrics;
  criticalProjects: CriticalProject[];
  topPerformingProjects: ProjectPerformanceData[];
  projectPerformanceData: ProjectPerformanceData[];
}

/**
 * Dados brutos para cálculos
 */
export interface DashboardRawData {
  projects: Project[];
  sprints: Sprint[];
  tasks: Task[];
}
