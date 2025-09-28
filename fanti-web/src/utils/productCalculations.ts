import { Project, Sprint, SprintStatus, Task, TaskStatus } from '@/types';

export interface ProductData {
  project: Project;
  sprints: Sprint[];
  tasks: Task[];
  totalTasks: number;
  completedTasks: number;
  progress: number;
  status: 'planning' | 'active' | 'testing' | 'completed' | 'mixed';
}

// Função para converter status de string para enum
export const parseSprintStatus = (status: SprintStatus | string): SprintStatus => {
  if (typeof status === 'string') {
    return parseInt(status, 10) as SprintStatus;
  }
  return status;
};

// Função centralizada para calcular dados dos produtos
export const calculateProductData = (
  projects: Project[],
  sprints: Sprint[],
  tasks: Task[]
): ProductData[] => {
  const productDataMap = new Map<string, ProductData>();

  // Inicializar dados dos projetos
  projects.forEach(project => {
    productDataMap.set(project.id, {
      project,
      sprints: [],
      tasks: [],
      totalTasks: 0,
      completedTasks: 0,
      progress: 0,
      status: 'planning'
    });
  });

  // Agrupar sprints por projeto
  sprints.forEach(sprint => {
    if (sprint.projectId && productDataMap.has(sprint.projectId)) {
      const productData = productDataMap.get(sprint.projectId)!;
      productData.sprints.push(sprint);
    }
  });

  // Agrupar tarefas por projeto
  tasks.forEach(task => {
    if (task.projectId && productDataMap.has(task.projectId)) {
      const productData = productDataMap.get(task.projectId)!;
      productData.tasks.push(task);
    }
  });

  // Calcular métricas para cada produto
  productDataMap.forEach(productData => {

    // 1. MILESTONES: Contar apenas sprints que NÃO estão concluídos
    const activeSprints = productData.sprints.filter(sprint =>
      parseSprintStatus(sprint.status) !== SprintStatus.Completed
    );

    if (productData.project.name === 'Financiamento') {
      console.log('Sprints ativos:', activeSprints);
    }

    // 2. TAREFAS: Contar APENAS tarefas que compõem as sprints ativas (não concluídas) e que NÃO são do tipo 'project'
    const sprintIds = activeSprints.map(sprint => sprint.id);
    const sprintTasks = productData.tasks.filter(task =>
      task.sprintId && sprintIds.includes(task.sprintId) && task.type !== 'project'
    );

    productData.totalTasks = sprintTasks.length;
    productData.completedTasks = sprintTasks.filter(task => task.status === TaskStatus.Done || task.progress === 100
    ).length;

    // 3. PROGRESSO GERAL: Baseado APENAS nas tarefas do tipo 'project' dos sprints ativos, excluindo as completas
    const projectTasks = productData.tasks.filter(task =>
      task.type == 'project' &&
      task.sprintId && sprintIds.includes(task.sprintId) && // APENAS sprints ativos
      task.status !== TaskStatus.Done &&
      task.progress !== 100
    );

    if (projectTasks.length > 0) {
      // Se há apenas 1 tarefa de projeto, usar seu progresso direto
      if (projectTasks.length === 1) {
        productData.progress = projectTasks[0].progress || 0;
      } else {
        // Se há múltiplas tarefas, calcular média
        const totalProgress = projectTasks.reduce((sum, task) => sum + (task.progress || 0), 0);
        productData.progress = Math.round(totalProgress / projectTasks.length);
      }
    } else {
      // Se todas as tasks do tipo 'project' estão completas, progresso = 100%
      const allProjectTasksInActiveSprints = productData.tasks.filter(task =>
        task.type === 'project' &&
        task.sprintId && sprintIds.includes(task.sprintId)
      );
      if (allProjectTasksInActiveSprints.length > 0) {
        productData.progress = 100;
      } else {
        productData.progress = 0;
      }
    }

    // 4. STATUS GERAL: Determinar status baseado nos sprints e progresso
    const sprintStatuses = productData.sprints.map(s => parseSprintStatus(s.status));
    if (sprintStatuses.length === 0) {
      productData.status = 'planning';
    } else if (sprintStatuses.every(s => s === SprintStatus.Completed)) {
      productData.status = 'completed';
    } else if (sprintStatuses.some(s => s === SprintStatus.Active)) {
      productData.status = 'active';
    } else if (sprintStatuses.some(s => s === SprintStatus.Testing)) {
      productData.status = 'testing';
    } else {
      productData.status = 'planning';
    }
  });

  return Array.from(productDataMap.values());
};

// Função para calcular estatísticas simplificadas para a home (usando a mesma lógica)
export const calculateSimpleProductStats = (
  projects: Project[],
  sprints: Sprint[],
  tasks: Task[]
) => {
  // Usar a função principal e adaptar o resultado
  const fullCalculation = calculateProductData(projects, sprints, tasks);

  return fullCalculation.map(productData => ({
    project: productData.project,
    sprints: productData.sprints, // Todos os sprints para exibição na home
    tasks: productData.tasks.filter(t => t.type !== 'project'), // Apenas tarefas não-projeto para exibição
    progress: productData.progress, // MESMO cálculo da função principal
    totalTasks: productData.totalTasks,
    completedTasks: productData.completedTasks
  }));
};
