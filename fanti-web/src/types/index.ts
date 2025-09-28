// Team type based on API response
export interface Team {
    id: string;
    name: string;
    description?: string;
    // Add more fields if needed from API
}
export enum TaskCategory {
    Improvement = 0,
    Development = 1,
    BugFix = 2,
    Hotfix = 3
}

// Enums
export enum UserRole {
    Admin = 1,
    ProductOwner = 2,
    ScrumMaster = 3,
    Developer = 4,
    Stakeholder = 5
}

export enum ProjectStatus {
    Active = 0,
    Completed = 1,
    OnHold = 2,
    Cancelled = 3
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

export type TaskType = "task" | "milestone" | "project";

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
    title: string;
    description?: string;
    storyPoints?: number;
    status: TaskStatus; // Aceita tanto enum quanto string do backend
    type: TaskType;
    category?: TaskCategory | string;
    actualHours?: number;
    startDate?: string;
    endDate?: string;
    progress?: number; // 0-100
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


// Comando específico para o backend
export interface CreateProjectCommand {
    name: string;
    description: string;
    url?: string; // Campo URL adicionado
    startDate: string;
    endDate: string;
    status: ProjectStatus;
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

export interface CreateTaskCommand {
    ProjectId?: string;   // GUID como string
    SprintId?: string;    // GUID como string
    ParentTaskId?: string;
    Title: string;
    Description?: string;
    Status?: TaskStatus;      // String, não enum
    Type?: string;        // String, não enum
    Category?: string;    // String, não enum
    StartDate?: string;
    EndDate?: string;
    Progress?: number;    // 0-100
    TeamId?: string;      // Equipe
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

export interface UpdateProjectCommand {
    id: string;
    name: string;
    description: string;
    url?: string; // Campo URL adicionado
    startDate: string;
    endDate: string;
    status: string;
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
