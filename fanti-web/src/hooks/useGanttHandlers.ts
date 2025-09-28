/**
 * Handlers dos eventos da biblioteca Gantt
 * Funções para lidar com movimentação, dependências e outros eventos do Gantt
 */
import { Task, TaskDependency } from '@/types';
import { message } from 'antd';
import dayjs from 'dayjs';

/**
 * Interface para configuração dos handlers
 */
export interface GanttHandlersConfig {
  modal: any;
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  setDependencies: (deps: TaskDependency[]) => void;
  loadData: () => Promise<void>;
  tasks: Task[];
  debounceUpdate: (taskId: string, updateData: any, updateFn: () => Promise<void>) => void;
  setSelectedTaskForSubtask: (task: Task | null) => void;
  setShowSubtaskModal: (show: boolean) => void;
  setSelectedTaskForUnified: (task: Task | null) => void;
  setShowUnifiedModal: (show: boolean) => void;
  setUnifiedModalTab: (tab: string) => void;
}

/**
 * Classe para gerenciar os handlers do Gantt
 */
export class GanttHandlers {
  private config: GanttHandlersConfig;

  constructor(config: GanttHandlersConfig) {
    this.config = config;
  }

  /**
   * Handler para editar tarefa: apenas recarrega os dados do Gantt
   */
  public onEditTask = async (task: any) => {
    if (this.config.loadData) {
      await this.config.loadData();
    }
    return task; // ou null, se preferir não alterar nada
  }

  /**
   * Sincroniza as datas da sprint com as datas do projeto
   */
  private syncSprintDates = async (task: Task, startDate: string, endDate: string) => {
    if (task.type === 'project' && task.sprintId) {
      try {
        await fetch(`/api/sprints`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: task.sprintId,
            startDate,
            endDate,
            status: task.status?.toString() || '1'
          })
        });

        // Atualizar o estado local da tarefa para refletir as novas datas
        message.success(`Datas da milestone do projeto "${task.title}" foram atualizadas.`);
      } catch (error) {
        console.error('Erro ao sincronizar datas da milestone:', error);
        message.error('Erro ao sincronizar datas da milestone.');
      }
    }
  }

  /**
   * Exclui a sprint associada ao projeto
   */
  private deleteAssociatedSprint = async (task: Task) => {
    if (task.type === 'project' && task.sprintId) {
      try {
        await fetch(`/api/sprints/${task.sprintId}`, {
          method: 'DELETE'
        });
        message.success(`Sprint associada ao projeto "${task.title}" foi excluída.`);
      } catch (error) {
        console.error('Erro ao excluir sprint:', error);
        message.error('Erro ao excluir sprint associada.');
      }
    }
  }

  /**
   * Atualizar datas da tarefa pai baseada nas subtarefas
   */
  updateParentTaskDates = async (parentTask: Task, childTasks: Task[]) => {
    if (childTasks.length === 0) return;

    const startDates = childTasks
      .map(child => child.startDate ? dayjs(child.startDate) : null)
      .filter(date => date !== null) as dayjs.Dayjs[];

    const endDates = childTasks
      .map(child => child.endDate ? dayjs(child.endDate) : null)
      .filter(date => date !== null) as dayjs.Dayjs[];

    if (startDates.length === 0 || endDates.length === 0) return;

    let earliestStart = startDates[0];
    let latestEnd = endDates[0];

    for (const date of startDates) {
      if (date.isBefore(earliestStart)) {
        earliestStart = date;
      }
    }

    for (const date of endDates) {
      if (date.isAfter(latestEnd)) {
        latestEnd = date;
      }
    }

    const parentStart = parentTask.startDate ? dayjs(parentTask.startDate) : null;
    const parentEnd = parentTask.endDate ? dayjs(parentTask.endDate) : null;

    let needsUpdate = false;

    // Só atualizar em casos específicos:
    if (!parentStart || !parentEnd) {
      // 1. Pai não tem datas definidas - definir ambas
      needsUpdate = true;
    } else {
      // 2. Verificar se subtarefas ultrapassaram os limites do pai
      const startOutOfBounds = earliestStart.isBefore(parentStart);
      const endOutOfBounds = latestEnd.isAfter(parentEnd);

      needsUpdate = startOutOfBounds || endOutOfBounds;
    }

    if (needsUpdate) {
      try {
        // Determinar quais datas atualizar
        let newStartDate: string;
        let newEndDate: string;

        if (!parentStart || !parentEnd) {
          // Pai sem datas: definir ambas baseado nos filhos
          newStartDate = earliestStart.format('YYYY-MM-DD');
          newEndDate = latestEnd.format('YYYY-MM-DD');
        } else {
          // Atualizar apenas a extremidade que foi ultrapassada
          const startOutOfBounds = earliestStart.isBefore(parentStart);
          const endOutOfBounds = latestEnd.isAfter(parentEnd);

          newStartDate = startOutOfBounds
            ? earliestStart.format('YYYY-MM-DD')  // Atualizar início
            : parentStart.format('YYYY-MM-DD');   // Manter início original

          newEndDate = endOutOfBounds
            ? latestEnd.format('YYYY-MM-DD')      // Atualizar fim
            : parentEnd.format('YYYY-MM-DD');     // Manter fim original
        }


        await fetch(`/api/tasks/${parentTask?.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            StartDate: newStartDate,
            EndDate: newEndDate,
          })
        });

        await fetch(`/api/tasks/${parentTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            StartDate: newStartDate,
            EndDate: newEndDate,
          })
        });

        // Atualizar o estado local da tarefa pai
        this.config.setTasks(currentTasks => currentTasks.map(t =>
          t.id === parentTask.id
            ? { ...t, startDate: newStartDate, endDate: newEndDate }
            : t
        ));

      } catch (error) {
        message.error('Erro ao atualizar tarefa pai:' + error);
      }
    }
  }

  /**
   * Handler para mudanças de data e duração de tarefas
   */
  handleTaskChange = async (task: any, dependentTasks?: readonly any[]) => {
    try {

      // Buscar a task real no estado para comparar
      const realTask = this.config.tasks.find(t => t.id === task.id);

      if (!task.start || !task.end || task.start >= task.end) {
        message.error('Datas inválidas. A data de início deve ser anterior à data de fim.');
        return;
      }

      const startDate = dayjs(task.start).format('YYYY-MM-DD');
      const endDate = dayjs(task.end).format('YYYY-MM-DD');

      // Verificar se é um projeto e sincronizar datas da sprint
      if (realTask?.type === 'project' && realTask?.sprintId &&
        (realTask.startDate !== startDate || realTask.endDate !== endDate)) {
        await this.syncSprintDates(realTask, startDate, endDate);
      }


      // Atualizar estado local IMEDIATAMENTE para responsividade
      this.config.setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(t =>
          t.id === task.id
            ? {
              ...t,
              startDate,
              endDate,
              progress: task.progress || t.progress || 0,
              updated: new Date().toISOString() // Marcar como atualizado
            }
            : t
        );
        return updatedTasks;
      });

      // Usar debounce para a atualização do backend
      this.config.debounceUpdate(
        task.id,
        { startDate, endDate, progress: task.progress || 0 },
        async () => {

          await fetch(`/api/tasks/${task?.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              StartDate: startDate,
              EndDate: endDate,
            })
          });
        }
      );

      // Lidar com dependências e tarefas pai (sem debounce para manter sincronização)
      const additionalUpdates: Promise<any>[] = [];

      // Atualizar tarefa pai se necessário
      const fullTask = this.config.tasks.find(t => t.id === task.id);
      if (fullTask && fullTask.parentTaskId) {
        const parentTask = this.config.tasks.find(t => t.id === fullTask.parentTaskId);
        if (parentTask) {
          const siblingTasks = this.config.tasks.filter(t => t.parentTaskId === fullTask.parentTaskId);
          const updatedSiblingTasks = siblingTasks.map(t =>
            t.id === task.id ? { ...t, startDate, endDate } : t
          );
          additionalUpdates.push(this.updateParentTaskDates(parentTask, updatedSiblingTasks));
        }
      }

      // Processar tarefas dependentes
      if (dependentTasks && dependentTasks.length > 0) {
        dependentTasks.forEach(dependent => {
          additionalUpdates.push(this.handleTaskChange(dependent));
        });
      }

      // Aguardar atualizações adicionais (mas não a principal que está com debounce)
      if (additionalUpdates.length > 0) {
        await Promise.all(additionalUpdates);
      }

    } catch (error) {
      message.error('Erro ao atualizar tarefa. Tente novamente.');

      // Reverter o estado local em caso de erro
      setTimeout(() => this.config.loadData(), 500); // Aguardar um pouco antes de recarregar
    }
  }

  /**
   * Handler para mudanças de progresso de tarefas
   */
  handleProgressChange = async (task: any, children?: readonly any[]) => {
    try {
      if (task.progress < 0 || task.progress > 100) {
        message.error('Progresso deve estar entre 0% e 100%');
        return;
      }

      const roundedProgress = Math.round(task.progress);

      // Atualizar estado local IMEDIATAMENTE para responsividade
      this.config.setTasks(prevTasks => {
        return prevTasks.map(t =>
          t.id === task.id
            ? {
              ...t,
              progress: roundedProgress,
              updated: new Date().toISOString() // Marcar como atualizado
            }
            : t
        );
      });

      // Usar debounce para a atualização do backend
      this.config.debounceUpdate(
        `${task.id}_progress`,
        { progress: roundedProgress },
        async () => {

          await fetch(`/api/tasks/${task?.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              Progress: roundedProgress,
            })
          });
        }
      );

      // Processar tarefas filhas (sem debounce para manter sincronização)
      if (children && children.length > 0) {
        const childUpdates: Promise<any>[] = [];
        children.forEach(child => {
          childUpdates.push(this.handleProgressChange(child));
        });
        await Promise.all(childUpdates);
      }

    } catch (error) {
      message.error('Erro ao atualizar progresso');

      // Reverter o estado local em caso de erro
      setTimeout(() => this.config.loadData(), 500); // Aguardar um pouco antes de recarregar
    }
  }

  /**
   * Handler para mover tarefas para dentro de outra (hierarquia)
   */
  handleMoveTasksInside = async (
    parent: any,
    childs: readonly any[],
    dependentTasks?: readonly any[],
    parentIndex?: number,
    childIndexes?: readonly number[],
    parents?: readonly any[],
    suggestions?: readonly any[]
  ) => {
    try {
      // Criar dependências entre o pai e cada filho
      // Lógica: pai precede todos os filhos (pai → filho)
      for (const child of childs) {
        try {
          await fetch(`/api/taskDependencies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              predecessorTaskId: parent.id,
              successorTaskId: child.id
            })
          });
        } catch (error) {
          console.warn(`Falha ao criar dependência para ${child.name}:`, error);
          // Continua com os outros filhos mesmo se uma dependência falhar
        }
      }

      message.success(`${childs.length} tarefa(s) movida(s) para dentro de "${parent.name}" com dependências criadas!`);

      // Recarregar dados para atualizar Gantt
      const [updatedTasks, updatedDependencies] = await Promise.all([
        fetch(`/api/tasks`).then(res => res.json()).then(data => data.data as Task[]),
        fetch(`/api/taskDependencies`).then(res => res.json()).then(data => data.data as TaskDependency[])
      ]);

      this.config.setTasks(updatedTasks);
      this.config.setDependencies(updatedDependencies);

    } catch (error) {
      message.error('Erro ao criar dependências. Tente novamente.');
    }
  }

  /**
   * Handler para mover tarefa DEPOIS de outra
   */
  handleMoveTaskAfter = async (task: any, taskForMove: any) => {
    try {
      // Criar dependência: task (anterior) → taskForMove (posterior)
      // A tarefa que será movida para depois depende da tarefa alvo
      await fetch(`/api/taskDependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predecessorTaskId: task.id,
          successorTaskId: taskForMove.id
        })
      });
      //
      message.success(`"${taskForMove.name}" movida DEPOIS de "${task.name}" e dependência criada!`);

      // Recarregar dados para atualizar Gantt
      const [updatedTasks, updatedDependencies] = await Promise.all([
        fetch(`/api/tasks`).then(res => res.json()).then(data => data.data as Task[]),
        fetch(`/api/taskDependencies`).then(res => res.json()).then(data => data.data as TaskDependency[])
      ]);

      this.config.setTasks(updatedTasks);
      this.config.setDependencies(updatedDependencies);

    } catch (error) {
      message.error('Erro ao criar dependência entre tarefas.');
    }
  }

  /**
   * Handler para mover tarefa ANTES de outra
   */
  handleMoveTaskBefore = async (
    task: any,
    taskForMove: any,
    dependentTasks?: readonly any[],
    taskIndex?: number,
    taskForMoveIndex?: number,
    parents?: readonly any[],
    suggestions?: readonly any[]
  ) => {
    try {
      // Criar dependência: taskForMove (anterior) → task (posterior)
      // A tarefa que será movida para antes precede a tarefa alvo
      await fetch(`/api/taskDependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predecessorTaskId: taskForMove.id,
          successorTaskId: task.id
        })
      });
      //
      message.success(`"${taskForMove.name}" movida ANTES de "${task.name}" e dependência criada!`);

      // Recarregar dados para atualizar Gantt
      const [updatedTasks, updatedDependencies] = await Promise.all([
        fetch(`/api/tasks`).then(res => res.json()).then(data => data.data as Task[]),
        fetch(`/api/taskDependencies`).then(res => res.json()).then(data => data.data as TaskDependency[])
      ]);

      this.config.setTasks(updatedTasks);
      this.config.setDependencies(updatedDependencies);

    } catch (error) {
      message.error('Erro ao criar dependência entre tarefas.');
    }
  }

  /**
   * Handler para duplo clique na seta de dependência
   */
  handleArrowDoubleClick = async (
    taskFrom: any,
    taskFromIndex?: number,
    taskTo?: any,
    taskToIndex?: number
  ) => {
    try {
      this.config.modal.confirm({
        title: 'Remover Dependência',
        content: `Deseja remover a dependência entre "${taskFrom.name}" e "${taskTo.name}"?`,
        okText: 'Remover',
        okType: 'danger',
        cancelText: 'Cancelar',
        onOk: async () => {
          try {
            // Usar o novo método para remover dependência diretamente pelas tarefas
            await fetch(`/api/taskDependencies?predecessorTaskId=${taskFrom.id}&successorTaskId=${taskTo.id}`, {
              method: 'DELETE'
            });
            //
            message.success('Dependência removida com sucesso!');

            // Recarregar apenas os dados necessários sem recarregar a página inteira
            const [updatedTasks, updatedDependencies] = await Promise.all([
              fetch(`/api/tasks`).then(res => res.json()).then(data => data.data as Task[]),
              fetch(`/api/taskDependencies`).then(res => res.json()).then(data => data.data as TaskDependency[])
            ]);

            this.config.setTasks(updatedTasks);
            this.config.setDependencies(updatedDependencies);

          } catch (error) {
            message.error('Erro ao remover dependência.');
          }
        }
      });
    } catch (error) {
      message.error('Erro no duplo clique da seta:' + error);
    }
  }

  /**
   * Handler para deletar tarefas
   */
  handleTaskDelete = async (
    tasksToDelete: readonly any[],
    dependentTasks?: readonly any[],
    indexes?: { task: any; index: number }[],
    parents?: readonly any[],
    suggestions?: readonly any[]
  ) => {
    if (!tasksToDelete || tasksToDelete.length === 0) {
      message.warning('Nenhuma tarefa selecionada para deletar');
      return;
    }

    const taskNames = tasksToDelete.map(t => t.name).join(', ');
    const confirmMessage = tasksToDelete.length === 1
      ? `Tem certeza que deseja deletar a tarefa "${taskNames}"?`
      : `Tem certeza que deseja deletar ${tasksToDelete.length} tarefas: ${taskNames}?`;

    if (dependentTasks && dependentTasks.length > 0) {
      const dependentNames = dependentTasks.map(t => t.name).join(', ');
      message.warning(`Atenção: As seguintes tarefas dependem das que serão deletadas: ${dependentNames}`);
    }

    try {
      this.config.modal.confirm({
        title: 'Confirmar Exclusão',
        content: confirmMessage,
        okText: 'Deletar',
        okType: 'danger',
        cancelText: 'Cancelar',
        onOk: async () => {
          try {
            for (const task of tasksToDelete) {
              // Verificar se é um projeto e excluir sprint antes de excluir a tarefa
              const realTask = this.config.tasks.find(t => t.id === task.id);
              if (realTask?.type === 'project' && realTask?.sprintId) {
                await this.deleteAssociatedSprint(realTask);
              }
              await fetch(`/api/tasks?id=${task.id}`, {
                method: 'DELETE'
              });
            }

            this.config.loadData();
          } catch (error) {
            message.error('Erro ao excluir tarefa(s). Tente novamente.');
          }
        }
      });
    } catch (error: any) {
      message.error('Erro ao excluir tarefa(s). Tente novamente.');
    }
  }

  /**
   * Handler para adicionar subtarefa (botão + no Gantt)
   */
  handleAddTask = (parentTask: any, getMetadata?: any) => {
    const fullTask = this.config.tasks.find(t => t.id === parentTask.id);
    if (fullTask) {
      this.config.setSelectedTaskForSubtask(fullTask);
      this.config.setShowSubtaskModal(true);
    }
  }

  /**
   * Handler para editar tarefa (duplo clique)
   */
  handleEditTask = (task: any) => {
    const fullTask = this.config.tasks.find(t => t.id === task.id);
    if (fullTask) {
      this.config.setSelectedTaskForUnified(fullTask);
      this.config.setUnifiedModalTab('edit');
      this.config.setShowUnifiedModal(true);
    }
  }

  /**
   * Handler para seleção de tarefa (clique simples)
   */
  handleTaskSelect = (task: any) => {
    const fullTask = this.config.tasks.find(t => t.id === task.id);
    if (fullTask) {
      this.config.setSelectedTaskForUnified(fullTask);
    }
  }
}

/**
 * Função de conveniência para criar uma instância dos handlers
 */
export const createGanttHandlers = (config: GanttHandlersConfig) => {
  return new GanttHandlers(config);
};
