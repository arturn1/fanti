import { SprintStatus, TaskStatus } from '@/types';
import {
  CriticalProject,
  DashboardRawData,
  DashboardSummary,
  EfficiencyMetrics,
  PerformanceMetrics,
  ProjectPerformanceData
} from '@/types/metrics';
import dayjs from 'dayjs';
import { calculateProductData } from './productCalculations';

/**
 * Calcula métricas de performance da equipe
 */
export function calculatePerformanceMetrics(data: DashboardRawData): PerformanceMetrics {
  const { projects, sprints, tasks } = data;

  // Filtrar tarefas que não são projetos
  const regularTasks = tasks.filter(t => t.type !== 'project');

  // Calcular dados dos produtos
  const productDataList = calculateProductData(projects, sprints, tasks);

  return {
    // Projetos - simplesmente verificar o status do projeto
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status == "1").length,
    completedProjects: projects.filter(p => p.status === "2").length,

    // Milestones - verificar se não está concluído e se está no período atual
    totalSprints: sprints.length,
    activeSprints: sprints.filter(s => {
      // Milestone em andamento se:
      // 1. Não está concluído E
      // 2. Data atual está entre startDate e endDate (se existirem)
      if (s.status === SprintStatus.Completed) return false;

      const today = dayjs();
      const startDate = s.startDate ? dayjs(s.startDate) : null;
      const endDate = s.endDate ? dayjs(s.endDate) : null;

      // Se não tem datas, considera em andamento se não está concluído
      if (!startDate && !endDate) return true;

      // Se tem data de início, verificar se já começou
      const hasStarted = !startDate || today.isAfter(startDate) || today.isSame(startDate, 'day');

      // Se tem data de fim, verificar se ainda não terminou
      const hasNotEnded = !endDate || today.isBefore(endDate) || today.isSame(endDate, 'day');

      return hasStarted && hasNotEnded;
    }).length,
    completedSprints: sprints.filter(s => s.status === SprintStatus.Completed).length,
    delayedSprints: sprints.filter(s =>
      s.status !== SprintStatus.Completed && dayjs().isAfter(dayjs(s.endDate))
    ).length,

    // Tarefas
    totalTasks: regularTasks.length,
    completedTasks: regularTasks.filter(t => t.status === TaskStatus.Done).length,
    overdueTasks: regularTasks.filter(t =>
      t.status !== TaskStatus.Done && t.dueDate && dayjs().isAfter(dayjs(t.dueDate))
    ).length,

    // Progresso médio
    averageProgress: productDataList.length > 0
      ? Math.round(productDataList.reduce((sum, p) => sum + p.progress, 0) / productDataList.length)
      : 0,
  };
}

/**
 * Calcula métricas de eficiência considerando contexto temporal e milestones ativos
 */
export function calculateEfficiencyMetrics(performanceMetrics: PerformanceMetrics, data: DashboardRawData): EfficiencyMetrics {
  const {
    totalProjects,
    completedProjects,
    totalSprints,
    completedSprints,
    totalTasks,
    completedTasks,
    delayedSprints,
    activeSprints: activeSprintsCount
  } = performanceMetrics;

  // Eficiência de projetos (% concluídos)
  const projectCompletion = totalProjects > 0
    ? Math.round((completedProjects / totalProjects) * 100)
    : 0;

  // Eficiência de milestones considerando apenas os relevantes (ativos + concluídos)
  const relevantSprints = activeSprintsCount + completedSprints;
  const sprintCompletion = relevantSprints > 0
    ? Math.round((completedSprints / relevantSprints) * 100)
    : 0;

  // Eficiência de tarefas em milestones ativas (contexto atual)
  const activeSprintIds = data.sprints
    .filter(s => s.status === SprintStatus.Active)
    .map(s => s.id);

  const tasksInActiveSprints = data.tasks.filter(t =>
    t.type !== 'project' &&
    (t.sprintId ? activeSprintIds.includes(t.sprintId) : true) // Inclui tarefas sem milestone
  );

  const completedTasksInActiveSprints = tasksInActiveSprints.filter(t =>
    t.status === TaskStatus.Done
  );

  const activeTaskCompletion = tasksInActiveSprints.length > 0
    ? Math.round((completedTasksInActiveSprints.length / tasksInActiveSprints.length) * 100)
    : (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);

  // Pontualidade considerando apenas milestones com deadline
  const sprintsWithDeadline = data.sprints.filter(s => s.endDate);
  const onTimeDelivery = sprintsWithDeadline.length > 0
    ? Math.round(((sprintsWithDeadline.length - delayedSprints) / sprintsWithDeadline.length) * 100)
    : 100; // Se não há deadlines, considera 100%

  // Progresso em milestones ativas (peso importante para eficiência atual)
  const activeSprintsList = data.sprints.filter(s => s.status === SprintStatus.Active);
  const activeSprintProgress = activeSprintsList.length > 0
    ? Math.round(activeSprintsList.reduce((sum, sprint) => {
      const sprintTasks = data.tasks.filter(t => t.sprintId === sprint.id);
      const sprintCompletedTasks = sprintTasks.filter(t => t.status === TaskStatus.Done);
      const sprintProgress = sprintTasks.length > 0
        ? (sprintCompletedTasks.length / sprintTasks.length) * 100
        : 0;
      return sum + sprintProgress;
    }, 0) / activeSprintsList.length)
    : activeTaskCompletion;

  // Eficiência geral ponderada considerando contexto atual
  // Maior peso para atividades atuais (milestones ativas) e pontualidade
  const overallEfficiency = Math.round(
    (activeSprintProgress * 0.4 +     // 40% - Progresso em milestones ativas
      activeTaskCompletion * 0.25 +   // 25% - Conclusão de tarefas em contexto ativo
      onTimeDelivery * 0.25 +         // 25% - Pontualidade
      projectCompletion * 0.1)        // 10% - Conclusão geral de projetos
  );

  return {
    projectCompletion,
    sprintCompletion,
    taskCompletion: activeTaskCompletion,
    onTimeDelivery,
    overallEfficiency: Math.max(0, Math.min(100, overallEfficiency)) // Garantir entre 0-100%
  };
}

/**
 * Identifica projetos críticos que precisam de atenção
 */
export function calculateCriticalProjects(data: DashboardRawData): CriticalProject[] {
  const productDataList = calculateProductData(data.projects, data.sprints, data.tasks);

  return productDataList
    .map(productData => {
      const reasons: string[] = [];
      let severity: 'low' | 'medium' | 'high' = 'low';

      // Verificar progresso baixo
      if (productData.progress < 30) {
        reasons.push('Progresso muito baixo');
        severity = 'high';
      } else if (productData.progress < 50) {
        reasons.push('Progresso abaixo do esperado');
        severity = 'medium';
      }

      // Verificar milestones atrasados
      const delayedSprints = productData.sprints.filter(s =>
        s.status !== SprintStatus.Completed && dayjs().isAfter(dayjs(s.endDate))
      );

      if (delayedSprints.length > 0) {
        reasons.push(`${delayedSprints.length} milestone(s) atrasado(s)`);
        if (delayedSprints.length > 1) {
          severity = 'high';
        } else if (severity !== 'high') {
          severity = 'medium';
        }
      }

      // Verificar tarefas overdue
      const overdueTasks = data.tasks.filter(t =>
        t.projectId === productData.project.id &&
        t.status !== TaskStatus.Done &&
        t.dueDate &&
        dayjs().isAfter(dayjs(t.dueDate))
      );

      if (overdueTasks.length > 3) {
        reasons.push(`${overdueTasks.length} tarefas em atraso`);
        severity = 'high';
      } else if (overdueTasks.length > 0) {
        reasons.push(`${overdueTasks.length} tarefas em atraso`);
        if (severity !== 'high') {
          severity = 'medium';
        }
      }

      // Verificar se não tem atividade recente
      const recentTasks = data.tasks.filter(t =>
        t.projectId === productData.project.id &&
        t.updated &&
        dayjs().subtract(7, 'days').isBefore(dayjs(t.updated))
      );

      if (recentTasks.length === 0 && productData.status === 'active') {
        reasons.push('Sem atividade recente');
        if (severity !== 'high') {
          severity = 'medium';
        }
      }

      // Só retornar se há razões para ser crítico
      if (reasons.length > 0) {
        return {
          project: productData.project,
          reasons,
          progress: productData.progress,
          delayedSprints: delayedSprints.length,
          severity
        };
      }

      return null;
    })
    .filter((project): project is CriticalProject => project !== null)
    .sort((a, b) => {
      // Ordenar por severidade (high > medium > low) e depois por progresso
      const severityOrder = { high: 3, medium: 2, low: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return a.progress - b.progress;
    });
}

/**
 * Calcula dados de performance dos projetos para tabela
 */
export function calculateProjectPerformanceData(data: DashboardRawData): ProjectPerformanceData[] {
  const productDataList = calculateProductData(data.projects, data.sprints, data.tasks);

  return productDataList.map(p => {
    const delayedMilestones = p.sprints.filter(s =>
      s.status !== SprintStatus.Completed && dayjs().isAfter(dayjs(s.endDate))
    ).length;

    // Calcular horas estimadas e completadas
    const projectTasks = data.tasks.filter(t => t.projectId === p.project.id);
    const estimatedHours = projectTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const completedHours = projectTasks
      .filter(t => t.status === TaskStatus.Done)
      .reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

    const timeEfficiency = estimatedHours > 0
      ? Math.round((completedHours / estimatedHours) * 100)
      : 0;

    return {
      key: p.project.id,
      name: p.project.name,
      progress: p.progress,
      milestones: p.sprints.length,
      completedMilestones: p.sprints.filter(s => s.status === SprintStatus.Completed).length,
      tasks: p.totalTasks,
      completedTasks: p.completedTasks,
      efficiency: p.totalTasks > 0 ? Math.round((p.completedTasks / p.totalTasks) * 100) : 0,
      status: p.status,
      delayedMilestones,
      estimatedHours,
      completedHours,
      timeEfficiency
    };
  });
}

/**
 * Identifica os projetos com melhor performance
 */
export function calculateTopPerformingProjects(
  projectPerformanceData: ProjectPerformanceData[]
): ProjectPerformanceData[] {
  return projectPerformanceData
    .filter(p => p.progress > 80 || p.efficiency > 90)
    .sort((a, b) => {
      // Ordenar por uma combinação de progresso e eficiência
      const scoreA = (a.progress * 0.6) + (a.efficiency * 0.4);
      const scoreB = (b.progress * 0.6) + (b.efficiency * 0.4);
      return scoreB - scoreA;
    })
    .slice(0, 3);
}

/**
 * Função principal que calcula todo o resumo do dashboard
 */
export function calculateDashboardSummary(data: DashboardRawData): DashboardSummary {
  const performanceMetrics = calculatePerformanceMetrics(data);
  const efficiencyMetrics = calculateEfficiencyMetrics(performanceMetrics, data);
  const criticalProjects = calculateCriticalProjects(data);
  const projectPerformanceData = calculateProjectPerformanceData(data);
  const topPerformingProjects = calculateTopPerformingProjects(projectPerformanceData);

  return {
    performanceMetrics,
    efficiencyMetrics,
    criticalProjects,
    topPerformingProjects,
    projectPerformanceData
  };
}
