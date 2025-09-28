'use client';

import {
  CalendarOutlined,
  LinkOutlined,
  PlusOutlined,
  UserOutlined
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
  Button,
  Card,
  Col,
  message,
  Row,
  Select,
  Space,
  Spin
} from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CreateSubtaskModal } from '@/app/tasks/components/CreateSubtaskModal';
import { UnifiedTaskModal } from '@/app/tasks/components/UnifiedTaskModal';
import { Project, Sprint, Task, TaskDependency, TaskStatus, Team } from '@/types';
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
import { createGanttHandlers } from '@/hooks/useGanttHandlers';

const { Option } = Select;

function TasksPageContent() {
  const { modal } = App.useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const [selectedTaskForUnified, setSelectedTaskForUnified] = useState<Task | null>(null);
  const [showUnifiedModal, setShowUnifiedModal] = useState(false);
  const [unifiedModalTab, setUnifiedModalTab] = useState<string>('edit');
  const [selectedTaskForSubtask, setSelectedTaskForSubtask] = useState<Task | null>(null);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);

  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedSprint, setSelectedSprint] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);
  const [forceUpdate, setForceUpdate] = useState<number>(0);

  // Refs para otimização e controle de estado
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingUpdatesRef = useRef<Map<string, any>>(new Map());

  // Função de debounce para otimizar atualizações - UMA POR TASK ID
  const debounceUpdate = useCallback((taskId: string, updateData: any, updateFn: () => Promise<void>) => {

    // Armazenar a atualização pendente para esta task específica
    pendingUpdatesRef.current.set(taskId, updateData);

    // Limpar timer anterior DESTA TASK se existir
    const existingTimer = debounceTimersRef.current.get(taskId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Definir novo timer ESPECÍFICO para esta task
    const newTimer = setTimeout(async () => {
      try {
        await updateFn();
        pendingUpdatesRef.current.delete(taskId);
        debounceTimersRef.current.delete(taskId);
      } catch (error) {
        pendingUpdatesRef.current.delete(taskId);
        debounceTimersRef.current.delete(taskId);
      }
    }, 300); // 300ms de debounce

    debounceTimersRef.current.set(taskId, newTimer);
  }, []);

  useEffect(() => {
    loadData();
    fetch('/api/teams').then(res => res.json()).then(data => setTeams(data?.data || [])).catch(() => setTeams([]));
  }, []);

  // Resetar selectedSprint se estiver em uma milestone concluída
  useEffect(() => {
    if (selectedSprint !== 'all' && sprints.length > 0) {
      const currentSprint = sprints.find(s => s.id === selectedSprint);
      if (currentSprint) {
        const sprintStatus = typeof currentSprint.status === 'string'
          ? parseInt(currentSprint.status)
          : currentSprint.status;

        if (sprintStatus === 4) { // SprintStatus.Completed = 4
          setSelectedSprint('all');
        }
      }
    }
  }, [sprints, selectedSprint]);

  // Limpeza dos timers quando o componente for desmontado
  useEffect(() => {
    return () => {
      // Limpar todos os timers de debounce
      debounceTimersRef.current.forEach((timer) => {
        clearTimeout(timer);
      });
      debounceTimersRef.current.clear();
      pendingUpdatesRef.current.clear();
    };
  }, []);

  const loadData = async () => {
    console.log('Loading data...');
    try {
      setLoading(true);
      const [tasksRes, projectsRes, sprintsRes, dependenciesRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/projects'),
        fetch('/api/sprints'),
        fetch('/api/taskDependencies'),
      ]);

      const [tasksData, projectsData, sprintsData, dependenciesData] = await Promise.all([
        tasksRes.json(),
        projectsRes.json(),
        sprintsRes.json(),
        dependenciesRes.json(),
      ]);

      setTasks(tasksData?.data || []);
      setProjects(projectsData?.data || []);
      setSprints(sprintsData?.data || []);
      setDependencies(dependenciesData?.data || []);
    } catch (error) {
      message.error('Erro ao carregar dados');
      setTasks([]);
      setProjects([]);
      setSprints([]);
      setDependencies([]);
    } finally {
      setLoading(false);
    }
  };

  const ganttTasks = useMemo(() => {
    if (!tasks.length || loading) {
      return [];
    }

    let filteredTasks = tasks;

    if (selectedProject !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.projectId === selectedProject);
    }

    if (selectedSprint !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.sprintId === selectedSprint);
    }

    if (selectedTeam !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.teamId === selectedTeam);
    }

    // Filtrar tarefas que não pertencem a milestones concluídas
    filteredTasks = filteredTasks.filter(task => {
      if (!task.sprintId) return true; // Tarefas sem milestone são incluídas

      const sprint = sprints.find(s => s.id === task.sprintId);
      if (!sprint) return true; // Se não encontrar a milestone, inclui a tarefa

      // Converter status do backend para number se necessário
      const sprintStatus = typeof sprint.status === 'string' ? parseInt(sprint.status) : sprint.status;
      return sprintStatus !== 4; // SprintStatus.Completed = 4
    });

    // Organizar tarefas por hierarquia (pais primeiro, depois filhos)
    const parentTasks = filteredTasks.filter(task => !task.parentTaskId);
    const childTasks = filteredTasks.filter(task => task.parentTaskId);

    // Criar um array ordenado: pais seguidos de seus filhos
    const orderedTasks: typeof filteredTasks = [];

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

      let progress = task.progress || 0;
      if (progress === 0) {
        switch (task.status) {
          case TaskStatus.Done:
            progress = 100;
            break;
          case TaskStatus.InProgress:
            progress = 50;
            break;
          case TaskStatus.ToDo:
            progress = 10;
            break;
          default:
            progress = 0;
        }
      }

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
      let taskType: GanttTaskType = task.type || "task";

      // Se não tem tipo definido, inferir pela hierarquia
      if (!task.type) {
        if (hasChildren && !task.parentTaskId) {
          taskType = "project"; // Tarefa pai será mostrada como projeto
        } else {
          taskType = "task"; // Padrão para tarefas normais
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
  }, [tasks, projects, sprints, dependencies, selectedProject, selectedSprint, selectedTeam, loading, forceUpdate]);

  const handleOpenManagement = (tab: 'edit' | 'team' | 'dependencies') => {
    if (selectedTaskForUnified) {
      setUnifiedModalTab(tab);
      setShowUnifiedModal(true);
    }
  };

  const availableSprints = useMemo(() => {
    const projectFilteredSprints = selectedProject === 'all'
      ? sprints
      : sprints.filter(sprint => sprint.projectId === selectedProject);

    // Filtrar apenas milestones que não estão concluídas (status !== 4)
    return projectFilteredSprints.filter(sprint => {
      // Converter status do backend para number se necessário
      const sprintStatus = typeof sprint.status === 'string' ? parseInt(sprint.status) : sprint.status;
      return sprintStatus !== 4; // SprintStatus.Completed = 4
    });
  }, [sprints, selectedProject]);

  // Criar handlers do Gantt
  const ganttHandlers = createGanttHandlers({
    modal,
    setTasks,
    setDependencies,
    loadData,
    tasks,
    debounceUpdate,
    setSelectedTaskForSubtask,
    setShowSubtaskModal,
    setSelectedTaskForUnified,
    setShowUnifiedModal,
    setUnifiedModalTab
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
          <Col
            xs={24}
            sm={12}
            md={8}>
            <div>
              <Space>
                <Button
                  icon={<UserOutlined />}
                  onClick={() => handleOpenManagement('team')}
                  disabled={!selectedTaskForUnified}
                >
                  Gerenciar Equipes
                </Button>
                <Button
                  icon={<LinkOutlined />}
                  onClick={() => handleOpenManagement('dependencies')}
                  disabled={!selectedTaskForUnified}
                >
                  Gerenciar Dependências
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      <Card>
        {loading ? (
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
                // Botão de mais (criar subtarefa) - usando tipos corretos
                onAddTaskClick={ganttHandlers.handleAddTask}
              // onEditTask={ganttHandlers.onEditTask}
              
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
