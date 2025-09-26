// Team type based on API response
export interface Team {
  id: string;
  name: string;
  description?: string;
  // Add more fields if needed from API
}
export enum TaskCategory {
  Melhoria = 'Melhoria',
  Desenvolvimento = 'Desenvolvimento',
  Correcao = 'Correção',
  Hotfix = 'Hotfix'
}

export const getTaskCategoryDisplayName = (category: TaskCategory | string): string => {
  switch (category) {
    case TaskCategory.Melhoria:
      return 'Melhoria';
    case TaskCategory.Desenvolvimento:
      return 'Desenvolvimento';
    case TaskCategory.Correcao:
      return 'Correção';
    case TaskCategory.Hotfix:
      return 'Hotfix';
    default:
      return String(category);
  }
};

export const getTaskCategoryByDisplayName = (displayName: string): TaskCategory => {
  switch (displayName) {
    case 'Melhoria':
      return TaskCategory.Melhoria;
    case 'Desenvolvimento':
      return TaskCategory.Desenvolvimento;
    case 'Correção':
      return TaskCategory.Correcao;
    case 'Hotfix':
      return TaskCategory.Hotfix;
    default:
      return TaskCategory.Desenvolvimento;
  }
};
// Enums
export enum UserRole {
  Admin = 1,
  ProductOwner = 2,
  ScrumMaster = 3,
  Developer = 4,
  Stakeholder = 5
}

export enum ProjectStatus {
  Active = 1,
  Completed = 2,
  OnHold = 3,
  Cancelled = 4
}

export enum ProjectRole {
  ProductOwner = 1,
  ScrumMaster = 2,
  Developer = 3,
  Stakeholder = 4
}

export enum SprintStatus {
  Planning = 1,
  Active = 2,
  Testing = 3,
  Completed = 4
}

export enum TaskStatus {
  ToDo = 1,        // A Fazer
  InProgress = 2,  // Em Progresso
  Done = 3         // Concluído
}

export enum TaskPriority {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4
}

// Funções auxiliares para conversão de status
export const getTaskStatusName = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.ToDo:
      return 'ToDo';
    case TaskStatus.InProgress:
      return 'InProgress';
    case TaskStatus.Done:
      return 'Done';
    default:
      return 'ToDo';
  }
};

export const getTaskStatusByName = (name: string): TaskStatus => {
  switch (name) {
    case 'ToDo':
      return TaskStatus.ToDo;
    case 'InProgress':
      return TaskStatus.InProgress;
    case 'Done':
      return TaskStatus.Done;
    default:
      return TaskStatus.ToDo;
  }
};

// Função para converter status do backend (string) para exibição em português
export const getTaskStatusDisplayName = (status: string | TaskStatus): string => {
  // Se já é um enum, converter para string primeiro
  if (typeof status === 'number') {
    status = getTaskStatusName(status);
  }

  switch (status) {
    case 'ToDo':
      return 'A Fazer';
    case 'InProgress':
      return 'Em Progresso';
    case 'Done':
      return 'Concluído';
    default:
      return 'A Fazer';
  }
};

// Função para converter status de exibição (português) para formato do backend
export const getTaskStatusByDisplayName = (displayName: string): string => {
  switch (displayName) {
    case 'A Fazer':
      return 'ToDo';
    case 'Em Progresso':
      return 'InProgress';
    case 'Concluído':
      return 'Done';
    default:
      return 'ToDo';
  }
};

export const getTaskPriorityName = (priority: TaskPriority): string => {
  switch (priority) {
    case TaskPriority.Low:
      return 'Low';
    case TaskPriority.Medium:
      return 'Medium';
    case TaskPriority.High:
      return 'High';
    case TaskPriority.Critical:
      return 'Critical';
    default:
      return 'Medium';
  }
};

export const getTaskPriorityByName = (name: string): TaskPriority => {
  switch (name) {
    case 'Low':
      return TaskPriority.Low;
    case 'Medium':
      return TaskPriority.Medium;
    case 'High':
      return TaskPriority.High;
    case 'Critical':
      return TaskPriority.Critical;
    default:
      return TaskPriority.Medium;
  }
};

export type TaskType = "task" | "milestone" | "project";

export enum DependencyType {
  FinishToStart = 1,
  StartToStart = 2,
  FinishToFinish = 3,
  StartToFinish = 4
}

export enum AssignmentRole {
  Assignee = 1,
  Reviewer = 2,
  Collaborator = 3,
  Observer = 4
}

// Interfaces principais
export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  created: string;
  updated?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  url?: string; // Campo URL adicionado
  startDate: string;
  endDate?: string;
  status: ProjectStatus | string; // Aceita tanto enum quanto string do backend
  ownerId: string;
  created: string;
  updated?: string;
}

export interface ProjectUser {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  joinedAt: string;
  created: string;
  updated?: string;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  goal?: string;
  status: SprintStatus | string; // Aceita tanto enum quanto string do backend
  created: string;
  updated?: string;
}

export interface Task {
  id: string;
  projectId: string;
  sprintId?: string;
  parentTaskId?: string;
  assigneeId?: string;
  title: string;
  description?: string;
  storyPoints?: number;
  priority: TaskPriority;
  status: TaskStatus | string; // Aceita tanto enum quanto string do backend
  type: TaskType;
  category?: TaskCategory | string;
  estimatedHours?: number;
  actualHours?: number;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  completedAt?: string;
  progress?: number; // 0-100
  color?: string; // Hex color
  isDisabled?: boolean;
  hideChildren?: boolean;
  tags?: string;
  teamId?: string; // Equipe
  created: string;
  updated?: string;
}

export interface TaskDependency {
  id: string;
  predecessorTaskId: string;
  successorTaskId: string;
  type: number; // 1=FinishToStart, 2=StartToStart, 3=FinishToFinish, 4=StartToFinish
  lag: number;
  created: string;
  updated?: string;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  role: AssignmentRole;
  created: string;
  updated?: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  comment: string;
  created: string;
  updated?: string;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  uploadedById: string;
  created: string;
  updated?: string;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  userId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  fieldChanged?: string;
  created: string;
}

// DTOs para APIs
export interface CreateProjectDto {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: ProjectStatus;
  ownerId?: string;
}

// Comando específico para o backend
export interface CreateProjectCommand {
  name: string;
  description: string;
  url?: string; // Campo URL adicionado
  startDate: string;
  endDate: string;
  status: string;
  ownerId: string;
}

export interface CreateSprintDto {
  projectId?: string;
  name: string;
  description?: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
}

// Comando específico para o backend
export interface CreateSprintCommand {
  projectId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  goal: string;
  status: string;
}

export interface CreateTaskDto {
  ProjectId?: string;   // GUID como string
  SprintId?: string;    // GUID como string
  ParentTaskId?: string;
  AssigneeId?: string;  // GUID como string - mantido para compatibilidade
  Title: string;
  Description?: string;
  Priority: string;     // String, não enum
  Status?: string;      // String, não enum
  Type?: string;        // String, não enum
  Category?: string;    // String, não enum
  EstimatedHours?: number;
  StartDate?: string;
  EndDate?: string;
  Progress?: number;    // 0-100
  Color?: string;       // Hex color
  IsDisabled?: boolean;
  HideChildren?: boolean;
  TeamId?: string;      // Equipe
}

export interface CreateUserDto {
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isActive?: boolean;
}

// Response API
export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: string[];
}

// Kanban Board
export interface KanbanColumn {
  id: string;
  title: string;
  status: TaskStatus;
  tasks: Task[];
  color: string;
}

export interface DragResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  };
}

// Comandos específicos para o backend
export interface CreateProjectCommand {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  ownerId: string;
}

export interface UpdateProjectCommand {
  id: string;
  name: string;
  description: string;
  url?: string; // Campo URL adicionado
  startDate: string;
  endDate: string;
  status: string;
  ownerId: string;
}

export interface UpdateSprintCommand {
  id: string;
  projectId: string | null;
  name: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  goal: string | null;
  status: string;
}

// Filtros e buscas
export interface TaskFilters {
  projectId?: string;
  sprintId?: string;
  assigneeId?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  type?: TaskType[];
  search?: string;
}

export interface ProjectFilters {
  status?: ProjectStatus[];
  ownerId?: string;
  search?: string;
}

// Period Management Types
export interface Staff {
  id: string;
  name: string;
}

export interface PeriodStaff {
  id: string;
  periodId: string;
  staffId: string;
  totalHours: number;
  taskNumber: number;
}

export interface TasksPeriod {
  id: string;
  periodStaffId: string;
  taskNumber: number;
  taskHours: number;
  projectId?: string;
}

export interface Period {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  staffs?: Staff[];
}

// Organization Types
export interface TaskItem {
  id?: string;
  number: number;
  hours: number;
  projectId?: string;
}

export interface StaffOrganizationData {
  totalHours: number;
  tasks: TaskItem[];
  remaining: number;
}

export interface OrganizationData {
  [staffId: string]: StaffOrganizationData;
}

// Modal States
export interface ModalStates {
  createEdit: boolean;
  view: boolean;
  organization: boolean;
}

export interface ModalData {
  editingPeriod: Period | null;
  viewingPeriod: Period | null;
  organizingPeriod: Period | null;
}
