'use client';

import {
  CalendarOutlined
} from '@ant-design/icons';
import {
  Gantt,
  Task as GanttTask,
  TaskType as GanttTaskType,
  ViewMode
} from '@wamra/gantt-task-react';
import '@wamra/gantt-task-react/dist/style.css';
import {
  App,
  Card,
  Col,
  Row,
  Select,
  Space,
  Spin
} from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { CreateSubtaskModal } from '@/app/tasks/components/CreateSubtaskModal';
import { UnifiedTaskModal } from '@/app/tasks/components/UnifiedTaskModal';
import { Task, toGanttTaskType } from '@/types';
import { getColorVariations, getTaskColorByStatus } from '@/utils/taskColors';
import dayjs from 'dayjs';

// Configurações do Gantt
import {
  ganttColors,
  ganttContainerClass,
  ganttContainerStyles,
  ganttDateFormats,
  ganttDistances,
  ganttSettings
} from '@/config/ganttConfig';

// Handlers do Gantt
import { usePeriods, usePeriodStaff, useProjects, useSprints, useStaff, useTaskDependencies, useTasks, useTasksPeriod, useTeams } from '@/hooks';
import { createGanttHandlers } from '@/hooks/useGanttHandlers';

const { Option } = Select;

function TasksPageContent() {
  const { modal } = App.useApp();

  const { tasks, createTask, setTasks, updateTask, deleteTask, patchTask, createSubTask } = useTasks();
  const { sprints, updateSprint, deleteSprint, loading: loadingSprints } = useSprints();
  const { teams, loading: loadingTeams } = useTeams();
  const { projects } = useProjects();
  const { taskDependencies, getDependenciesByTask, taskDependencies: dependencies,
    setTaskDependencies: setDependencies, createTaskDependency, deleteTaskDependency } = useTaskDependencies();
  const [loading, setLoading] = useState(false);
  const { periods } = usePeriods();
  const { periodStaffs } = usePeriodStaff();
  const { staffs } = useStaff();
  const { tasksPeriod } = useTasksPeriod();

  let anyLoading = loadingSprints || loadingTeams || loading;

  const [selectedTeam, setSelectedTeam] = useState<string>('all');

  const [selectedTaskForUnified, setSelectedTaskForUnified] = useState<Task | null>(null);
  const [showUnifiedModal, setShowUnifiedModal] = useState(false);
  const [unifiedModalTab, setUnifiedModalTab] = useState<string>('edit');
  const [selectedTaskForSubtask, setSelectedTaskForSubtask] = useState<Task | null>(null);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);

  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedSprint, setSelectedSprint] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);


  // Resetar selectedSprint se estiver em uma milestone concluída
  useEffect(() => {
    if (selectedSprint !== 'all' && sprints.length > 0) {
      const currentSprint = sprints.find(s => s.id === selectedSprint);
      if (currentSprint) {

        if (currentSprint.status === "3") { // SprintStatus.Completed = 3
          setSelectedSprint('all');
        }
      }
    }
  }, [sprints, selectedSprint]);

  const loadData = async () => {
    try {
      setLoading(true);
    } finally {
      setLoading(false);
    }
  };

  const ganttTasks = useMemo(() => {
    console.log('Recalculating ganttTasks...');
    if (!tasks.length || anyLoading) {
      return [];
    }

    let filteredTasks = tasks;

    if (selectedProject !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.projectId === selectedProject);
    }

    if (selectedSprint !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.sprintId === selectedSprint);
    }

    // --- NOVA LÓGICA DE FILTRO POR EQUIPE ---
    let teamFilteredTasks: Task[];
    if (selectedTeam !== 'all') {
      // 1. Filhos que pertencem à equipe filtrada
      const childTasksInTeam = filteredTasks.filter(task => task.teamId === selectedTeam && !!task.parentTaskId);
      // 2. Pais desses filhos
      const parentIds = Array.from(new Set(childTasksInTeam.map(child => child.parentTaskId)));
      const parentTasksOfChildren = filteredTasks.filter(task => parentIds.includes(task.id));
      // 3. Tarefas "pai" que pertencem à equipe filtrada
      const parentTasksInTeam = filteredTasks.filter(task => task.teamId === selectedTeam && !task.parentTaskId);
      // 4. Tarefas sem parent (pais) que não são pais de filhos filtrados e não pertencem à equipe: não entram
      // 5. Montar lista final: pais (da equipe ou de filhos), filhos da equipe
      teamFilteredTasks = [
        ...parentTasksInTeam,
        ...parentTasksOfChildren,
        ...childTasksInTeam
      ];
      // Remover duplicatas
      teamFilteredTasks = teamFilteredTasks.filter((task, idx, arr) => arr.findIndex(t => t.id === task.id) === idx);
    } else {
      teamFilteredTasks = filteredTasks;
    }

    // Filtrar tarefas que não pertencem a milestones concluídas
    teamFilteredTasks = teamFilteredTasks.filter(task => {
      if (!task.sprintId) return true; // Tarefas sem milestone são incluídas
      const sprint = sprints.find(s => s.id === task.sprintId);
      if (!sprint) return true; // Se não encontrar a milestone, inclui a tarefa
      return sprint.status !== "3"; // SprintStatus.Completed = 3
    });

    // Organizar tarefas por hierarquia (pais primeiro, depois filhos)
    const parentTasks = teamFilteredTasks.filter(task => !task.parentTaskId);
    const childTasks = teamFilteredTasks.filter(task => task.parentTaskId);

    // Para cada pai, só mostrar filhos que estão na lista filtrada
    const orderedTasks: typeof teamFilteredTasks = [];
    parentTasks.forEach(parent => {
      orderedTasks.push(parent);
      const children = childTasks.filter(child => child.parentTaskId === parent.id);
      orderedTasks.push(...children);
    });

    // Adicionar tarefas órfãs (que têm parentTaskId mas o pai não existe)
    const orphanTasks = childTasks.filter(child =>
      !parentTasks.some(parent => parent.id === child.parentTaskId)
    );
    orderedTasks.push(...orphanTasks);

    return orderedTasks.map((task, index) => {
      const startDate = task.startDate ? dayjs(task.startDate).toDate() : new Date();
      const endDate = task.endDate ? dayjs(task.endDate).toDate() : dayjs().add(1, 'day').toDate();

      const progress = task.progress || 0;

      const taskDependencies = (dependencies || [])
        .filter(dep => {
          // Verificar se a dependência é válida e se esta tarefa é a sucessora
          return dep && dep.predecessorTaskId && dep.successorTaskId && dep.successorTaskId === task.id;
        })
        .map(dep => ({
          sourceId: dep.predecessorTaskId,
          sourceTarget: "endOfTask" as const,
          ownTarget: "startOfTask" as const
        }));

      // Verificar se esta tarefa tem subtarefas
      const hasChildren = orderedTasks.some(t => t.parentTaskId === task.id);

      // Determinar o tipo: usar o tipo da tarefa do backend ou inferir pela hierarquia
      let taskType: GanttTaskType = toGanttTaskType(task.type);

      // Se não tem tipo definido, inferir pela hierarquia
      if (!task.type) {
        if (hasChildren && !task.parentTaskId) {
          taskType = 'project'; // Tarefa pai será mostrada como projeto
        } else {
          taskType = 'task'; // Padrão para tarefas normais
        }
      }

      // Obtém a cor baseada no status usando o utilitário centralizado
      const taskColor = getTaskColorByStatus(task.status);

      // Gera tonalidades da cor principal para um visual mais sofisticado
      const colorVariations = getColorVariations(taskColor);

      return {
        start: startDate,
        end: endDate,
        name: task.parentTaskId ? `  └─ ${task.title}` : `${projects.find(p => p.id === task.projectId)?.name}: ${task.title}`, // Indent para subtarefas
        id: task.id,
        type: taskType,
        progress: progress,
        parent: task.parentTaskId || undefined,
        dependencies: taskDependencies,
        styles: {
          barBackgroundColor: colorVariations.background,
          milestoneBackgroundColor: colorVariations.background,
          projectBackgroundColor: colorVariations.background,
          projectBackgroundSelectedColor: colorVariations.selected,
          barProgressColor: colorVariations.progress,
          barBackgroundSelectedColor: colorVariations.selected,
          barProgressSelectedColor: colorVariations.selectedProgress,
          barCornerRadius: taskType === 'milestone' ? 50 : 6,
          barBorderColor: colorVariations.border,
          barBorderWidth: hasChildren && !task.parentTaskId ? 2 : 1,
          progressColor: colorVariations.progress,
          progressSelectedColor: colorVariations.selectedProgress,
        }
      } as GanttTask;
    });
  }, [tasks, projects, sprints, dependencies, selectedProject, selectedSprint, selectedTeam, anyLoading]);


  const availableSprints = useMemo(() => {
    const projectFilteredSprints = selectedProject === 'all'
      ? sprints
      : sprints.filter(sprint => sprint.projectId === selectedProject);

    // Filtrar apenas milestones que não estão concluídas (status !== 4)
    return projectFilteredSprints.filter(sprint => {
      // Converter status do backend para number se necessário
      return sprint.status != "3"; // SprintStatus.Completed = 3
    });
  }, [sprints, selectedProject]);


  // Criar handlers do Gantt
  const ganttHandlers = createGanttHandlers({
    modal,
    setTasks,
    setDependencies,
    loadData,
    tasks,
    setSelectedTaskForSubtask,
    setShowSubtaskModal,
    setSelectedTaskForUnified,
    setShowUnifiedModal,
    setUnifiedModalTab,
    updateSprint,
    deleteSprint,
    updateTask,
    patchTask,
    deleteTask,
    createTaskDependency,
    deleteTaskDependency
  });

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">

          <Col>
            <Space>
              <Select
                value={selectedProject}
                onChange={setSelectedProject}
                style={{ minWidth: 150 }}
                placeholder="Filtrar por produto"
              >
                <Option value="all">Todos os Produtos</Option>
                {projects.map(project => (
                  <Option key={project.id} value={project.id}>
                    {project.name}
                  </Option>
                ))}
              </Select>
              <Select
                value={selectedSprint}
                onChange={setSelectedSprint}
                style={{ minWidth: 150 }}
                placeholder="Filtrar por milestone"
                disabled={!availableSprints.length}
              >
                <Option value="all">Todos os Milestones</Option>
                {availableSprints.map(sprint => (
                  <Option key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </Option>
                ))}
              </Select>
              <Select
                value={selectedTeam}
                onChange={setSelectedTeam}
                style={{ minWidth: 150 }}
                placeholder="Filtrar por equipe"
              >
                <Option value="all">Todas as Equipes</Option>
                {teams.map(team => (
                  <Option key={team.id} value={team.id}>
                    {team.name}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Select
                value={viewMode}
                onChange={setViewMode}
                style={{ minWidth: 120 }}
              >
                <Option value={ViewMode.Week}>Semana</Option>
                <Option value={ViewMode.Month}>Mês</Option>
              </Select>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        {anyLoading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>Carregando tarefas...</p>
          </div>
        ) : ganttTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#999' }}>
            <CalendarOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <p>Nenhuma tarefa encontrada</p>
          </div>
        ) : (
          <>
            <div
              className={ganttContainerClass}
              style={ganttContainerStyles}
            >
              <Gantt
                tasks={ganttTasks}
                viewMode={viewMode}
                dateLocale={ganttSettings.dateLocale}

                isShowTaskNumbers={ganttSettings.isShowTaskNumbers}
                isShowCriticalPath={ganttSettings.isShowCriticalPath}
                canMoveTasks={ganttSettings.canMoveTasks}

                colors={ganttColors}
                distances={ganttDistances}

                dateFormats={ganttDateFormats}

                fontFamily={ganttSettings.fontFamily}
                fontSize={ganttSettings.fontSize}

                onDateChange={ganttHandlers.handleTaskChange}
                onDelete={ganttHandlers.handleTaskDelete}
                onProgressChange={ganttHandlers.handleProgressChange}
                onDoubleClick={ganttHandlers.handleEditTask}
                onClick={ganttHandlers.handleTaskSelect}
                onMoveTaskInside={ganttHandlers.handleMoveTasksInside}
                onMoveTaskAfter={ganttHandlers.handleMoveTaskAfter}
                onMoveTaskBefore={ganttHandlers.handleMoveTaskBefore}
                onArrowDoubleClick={ganttHandlers.handleArrowDoubleClick}
                onEditTaskClick={ganttHandlers.handleEditTask}
                onAddTaskClick={ganttHandlers.handleAddTask}

              />
            </div>
          </>
        )}
      </Card>

      <UnifiedTaskModal
        task={selectedTaskForUnified}
        tasks={tasks}
        visible={showUnifiedModal}
        activeTab={unifiedModalTab}
        onClose={() => {
          setShowUnifiedModal(false);
          setSelectedTaskForUnified(null);
        }}
        onSuccess={() => {
          loadData();
          setShowUnifiedModal(false);
          setSelectedTaskForUnified(null);
        }}
        createTask={createTask}
        updateTask={updateTask}
        periods={periods}
        periodStaffs={periodStaffs}
        staffs={staffs}
        tasksPeriod={tasksPeriod}
        teams={teams}
        taskDependencies={taskDependencies}
        getDependenciesByTask={getDependenciesByTask}
      />

      <CreateSubtaskModal
        parentTask={selectedTaskForSubtask}
        visible={showSubtaskModal}
        onClose={() => {
          setShowSubtaskModal(false);
          setSelectedTaskForSubtask(null);
        }}
        onSuccess={() => {
          loadData();
          setShowSubtaskModal(false);
          setSelectedTaskForSubtask(null);
        }}
        teams={teams}
        createSubTask={createSubTask}
        updateTask={updateTask}
      />
    </div>
  );
}

export default function TasksPage() {
  return (
    <App>
      <TasksPageContent />
    </App>
  );
}
